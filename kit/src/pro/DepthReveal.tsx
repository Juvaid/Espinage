import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, useCurrentFrame} from 'remotion';
import {asset} from '../lib/asset';
import {useKitTheme} from '../theme/KitTheme';

// Depth reveal: a photo builds in from near to far using its depth map (Depth Anything V2: white = near), with a
// thin light riding the edge of the reveal. For the first look at a building or a room; reverse it (`out`) to
// dissolve far → near. Box defaults to the full frame; the photo is cover-fitted.
const VERT = `#version 300 es
in vec2 a; out vec2 v; void main(){ v = a*0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `#version 300 es
precision highp float;
in vec2 v; out vec4 o;
uniform sampler2D u_img; uniform sampler2D u_dep;
uniform float u_thr; uniform float u_soft; uniform vec3 u_edge; uniform vec2 u_scale; uniform float u_zoom;
void main(){
  vec2 uv = (v - 0.5)*u_scale/u_zoom + 0.5; uv.y = 1.0 - uv.y;
  vec3 c = texture(u_img, uv).rgb;
  float d = texture(u_dep, uv).r;
  float a = smoothstep(u_thr - u_soft, u_thr, d);
  float edge = exp(-abs(d - u_thr)/(u_soft*0.6)) * (1.0 - step(0.999, a)) * step(0.001, u_thr) * step(u_thr, 0.999);
  // premultiplied sum, then un-premultiply (the canvas is non-premultiplied)
  float e = edge*0.85;
  float al = clamp(a + e*(1.0 - a), 0.0, 1.0);
  vec3 pm = c*a + u_edge*e*(1.0 - a) + u_edge*e*0.35*a;
  o = vec4(pm/max(al, 1e-4), al);
}`;

const hexRgb = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const;
};
const load = (src: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => rej(new Error(`DepthReveal: cannot load ${src}`));
    i.src = asset(src);
  });

type St = {gl: WebGL2RenderingContext; loc: Record<string, WebGLUniformLocation | null>; aspect: number; q: number[]};

// q[i]: the depth value with i% of the picture nearer than it, so the revealed area grows evenly over time even when
// most of the frame is far away (typical for facades: a dark depth map with a bright foreground)
const quantiles = (im: HTMLImageElement) => {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = Math.max(1, Math.round((128 * im.height) / im.width));
  const x = c.getContext('2d')!;
  x.drawImage(im, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const hist = new Array(256).fill(0);
  for (let i = 0; i < d.length; i += 4) hist[d[i]]++;
  const n = d.length / 4;
  const q: number[] = [];
  let acc = 0, v = 255;
  for (let i = 0; i <= 100; i++) {
    while (v > 0 && acc + hist[v] <= (n * i) / 100) acc += hist[v--];
    q.push(v / 255);
  }
  return q;
};

export const DepthReveal: React.FC<{src: string; depth: string; at: number; dur?: number; out?: boolean; w?: number; h?: number; left?: number; top?: number; soft?: number; radius?: number; style?: React.CSSProperties}> = ({
  src, depth, at, dur = 36, out = false, w = 1080, h = 1920, left = 0, top = 0, soft = 0.08, radius = 0, style,
}) => {
  const C = useKitTheme();
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<St | null>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender(`DepthReveal ${src}`));

  useEffect(() => {
    let alive = true;
    Promise.all([load(src), load(depth)])
      .then(([img, dep]) => {
        if (!alive || !ref.current) return;
        const gl = ref.current.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: false, alpha: true})!;
        const sh = (t: number, s: string) => {
          const x = gl.createShader(t)!;
          gl.shaderSource(x, s);
          gl.compileShader(x);
          if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(`DepthReveal: ${gl.getShaderInfoLog(x)}`);
          return x;
        };
        const prog = gl.createProgram()!;
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        gl.useProgram(prog);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const a = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        [img, dep].forEach((im, i) => {
          const tex = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        });
        const loc: St['loc'] = {};
        for (const n of ['u_img', 'u_dep', 'u_thr', 'u_soft', 'u_edge', 'u_scale', 'u_zoom']) loc[n] = gl.getUniformLocation(prog, n);
        gl.uniform1i(loc.u_img, 0);
        gl.uniform1i(loc.u_dep, 1);
        st.current = {gl, loc, aspect: img.width / img.height, q: quantiles(dep)};
        setReady(true);
        continueRender(handle);
      })
      .catch((e) => {
        continueRender(handle);
        throw e;
      });
    return () => {
      alive = false;
    };
  }, [src, depth, handle]);

  useLayoutEffect(() => {
    const s = st.current;
    if (!ready || !s) return;
    const {gl, loc} = s;
    const p = interpolate(f, [at, at + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1)});
    // threshold walks the depth quantiles: at p the nearest p of the picture is in; it starts above the nearest
    // value and ends below the farthest so the edge travels through everything
    const k = out ? 1 - p : p;
    const qi = k * 100;
    const qv = s.q[Math.min(100, Math.floor(qi))] + (s.q[Math.min(100, Math.ceil(qi))] - s.q[Math.min(100, Math.floor(qi))]) * (qi % 1);
    const thr = k <= 0 ? 1 + soft : k >= 1 ? -soft : qv;
    const box = w / h;
    const scale: [number, number] = s.aspect > box ? [box / s.aspect, 1] : [1, s.aspect / box];
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(loc.u_thr, thr);
    gl.uniform1f(loc.u_soft, soft);
    gl.uniform3f(loc.u_edge, ...hexRgb(String(C.type3d.ramp[0][1])));
    gl.uniform2f(loc.u_scale, scale[0], scale[1]);
    gl.uniform1f(loc.u_zoom, 1.06 - 0.06 * p); // a slow settle as it builds
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return <canvas ref={ref} width={Math.round(w * 0.75)} height={Math.round(h * 0.75)} style={{position: 'absolute', left, top, width: w, height: h, borderRadius: radius, ...style}} />;
};
