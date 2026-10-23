import React, {useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

// DotField: a halftone dot screen drawn by one WebGL2 fragment shader. Dots sit on a fixed grid; a mask (text, e.g. a
// giant number, or an image, e.g. a logo) makes the dots inside it big and hot, the rest stay small and noisy. A
// shimmer band sweeps through the field. Transparent between dots, so it layers over any ground.
//   Cheap: one pass, no blur; the grid never moves, so h264 spends its bits only where the shimmer passes.
//   Spacing ≥ 14 px keeps the dots crisp after Instagram's re-encode (8–10 px dots smear into grey).
//   fade [from, to] (px from the top): the small background dots exist only below `from`, full by `to`. Keep them out
//   of the text zone: dots behind type turn it muddy once the shimmer passes (owner, 23 Oct 2026).
export type DotMask =
  | {type: 'text'; text: string; font: string; x: number; y: number; align?: CanvasTextAlign}
  | {type: 'image'; src: string; x: number; y: number; w: number; h: number}
  | {type: 'poly'; points: [number, number][]}
  | {type: 'polys'; polys: [number, number][][]};

const FRAG = `#version 300 es
precision highp float;
uniform vec2 u_res; uniform float u_t; uniform float u_sp; uniform float u_noise; uniform float u_shimmer; uniform float u_seed;
uniform vec3 u_dot; uniform vec3 u_hot; uniform vec3 u_shine; uniform sampler2D u_mask; uniform vec2 u_fade;
out vec4 o;
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x - floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1; i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); m = m*m; m = m*m;
  vec3 x = 2.0*fract(p*C.www) - 1.0; vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5); vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g; g.x = a0.x*x0.x + h.x*x0.y; g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m, g);
}
void main(){
  vec2 fc = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y); // top-left origin, like CSS
  vec2 cell = floor(fc/u_sp); vec2 c = (cell + 0.5)*u_sp;
  float m = texture(u_mask, c/u_res).a;
  float n = snoise(cell*0.085 + vec2(u_t*0.12, -u_t*0.08) + u_seed);
  // shimmer: a soft diagonal band travelling across the frame
  float d = dot(c/u_res.y, normalize(vec2(1.0, 0.55)));
  float sh = exp(-pow((fract(d*0.42 - u_t*0.16) - 0.5)*5.0, 2.0))*u_shimmer;
  float rOut = u_sp*(0.07 + 0.11*max(n, 0.0)*u_noise + 0.05*sh);
  float rIn = u_sp*(0.38 + 0.05*n*u_noise + 0.05*sh);
  float r = mix(rOut, rIn, m);
  float a = smoothstep(r + 0.75, r - 0.75, length(fc - c));
  float zone = smoothstep(u_fade.x, u_fade.y, c.y);
  float vis = mix((0.28 + 0.5*max(n, 0.0) + 0.5*sh)*zone, 1.0, m);
  vec3 col = mix(u_dot, u_hot, m);
  col = mix(col, u_shine, sh*(0.35 + 0.45*m));
  float A = a*clamp(vis, 0.0, 1.0);
  o = vec4(col*A, A);
}`;
const VERT = `#version 300 es
in vec2 a; void main(){gl_Position = vec4(a, 0.0, 1.0);}`;
const rgb = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

type St = {gl: WebGL2RenderingContext; loc: Record<string, WebGLUniformLocation | null>};

export const DotField: React.FC<{
  mask?: DotMask;
  spacing?: number;
  noise?: number;
  shimmer?: number;
  speed?: number;
  seed?: number;
  colors?: {dot?: string; hot?: string; shine?: string};
  fade?: [number, number];
  style?: React.CSSProperties;
}> = ({mask, spacing = 16, noise = 1, shimmer = 1, speed = 1, seed = 0, colors = {}, fade = [-1, 0], style}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<St | null>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('DotField mask'));
  const key = JSON.stringify(mask ?? null);

  // build the program and the mask texture once (text waits for its font, images for decode)
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: true});
    if (!gl) throw new Error('DotField: no WebGL2');
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`DotField: ${gl.getShaderInfoLog(s)}`);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const loc: St['loc'] = {};
    for (const n of ['u_res', 'u_t', 'u_sp', 'u_noise', 'u_shimmer', 'u_seed', 'u_dot', 'u_hot', 'u_shine', 'u_mask', 'u_fade']) loc[n] = gl.getUniformLocation(prog, n);
    st.current = {gl, loc};

    const mc = document.createElement('canvas');
    mc.width = width;
    mc.height = height;
    const g2 = mc.getContext('2d')!;
    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mc);
      setReady(true);
      continueRender(handle);
    };
    if (!mask) upload();
    else if (mask.type === 'text') {
      document.fonts.load(mask.font).then(() => {
        g2.font = mask.font;
        g2.textAlign = mask.align ?? 'center';
        g2.textBaseline = 'alphabetic';
        g2.fillStyle = '#fff';
        g2.fillText(mask.text, mask.x, mask.y);
        upload();
      });
    } else if (mask.type === 'poly' || mask.type === 'polys') {
      g2.fillStyle = '#fff';
      for (const poly of mask.type === 'poly' ? [mask.points] : mask.polys) {
        g2.beginPath();
        poly.forEach(([x, y], k) => (k ? g2.lineTo(x, y) : g2.moveTo(x, y)));
        g2.closePath();
        g2.fill();
      }
      upload();
    } else {
      const img = new Image();
      img.src = mask.src;
      img.decode().then(() => {
        g2.drawImage(img, mask.x, mask.y, mask.w, mask.h);
        upload();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, width, height]);

  useLayoutEffect(() => {
    const s = st.current;
    if (!s || !ready) return;
    const {gl, loc} = s;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(loc.u_res, width, height);
    gl.uniform1f(loc.u_t, (frame / fps) * speed);
    gl.uniform1f(loc.u_sp, spacing);
    gl.uniform1f(loc.u_noise, noise);
    gl.uniform1f(loc.u_shimmer, shimmer);
    gl.uniform1f(loc.u_seed, seed * 7.3);
    gl.uniform3f(loc.u_dot, ...rgb(colors.dot ?? '#8A8780'));
    gl.uniform3f(loc.u_hot, ...rgb(colors.hot ?? '#F24D07'));
    gl.uniform3f(loc.u_shine, ...rgb(colors.shine ?? '#FFE2CF'));
    gl.uniform1i(loc.u_mask, 0);
    gl.uniform2f(loc.u_fade, fade[0], fade[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', ...style}} />;
};
