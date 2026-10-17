import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useKitTheme} from '../theme/KitTheme';

// Shader backdrops: full-frame WebGL2 fragment shaders, driven by the frame (identical on every render), coloured
// from the brand theme (the 3D type palette: bg, deep, env, light, ramp). Quiet by design: they sit behind cards and
// type, never compete with them. `energy` (0..1) sets how bright the highlights get; keep 0.3–0.6 under content.
//
//   mesh    · four soft pools of light drifting slowly: the default under cards and headings
//   silk    · domain-warped satin folds with soft sheen: interiors, "luxury" lines
//   metal   · liquid chrome bands in the brand metal ramp: behind 3D type and the logo
//   aurora  · slow vertical curtains of light: hooks and openers
//   rays    · shafts of light falling from above: reveals, the brand name
//   contour · drifting topographic lines: location, map and land beats
//
// No grain (brand rule). A ±0.5/255 dither is applied only to stop banding in dark gradients after h264.
export type ShaderKind = 'mesh' | 'silk' | 'metal' | 'aurora' | 'rays' | 'contour';
export const SHADER_KINDS: ShaderKind[] = ['mesh', 'silk', 'metal', 'aurora', 'rays', 'contour'];

const COMMON = `#version 300 es
precision highp float;
uniform vec2 u_res; uniform float u_t; uniform float u_energy; uniform float u_seed;
uniform vec3 u_bg; uniform vec3 u_deep; uniform vec3 u_mid; uniform vec3 u_light; uniform vec3 u_hi;
out vec4 o;
vec3 lin(vec3 c){return pow(c, vec3(2.2));}
vec3 srgb(vec3 c){return pow(max(c, 0.0), vec3(1.0/2.2));}
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
float fbm(vec2 p){float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){s += a*snoise(p); p = p*2.02 + 17.0; a *= 0.5;} return s;}
float fbm3(vec2 p){float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++){s += a*snoise(p); p = p*1.9 + 11.0; a *= 0.5;} return s;}
float hash(vec2 p){return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453);}
// uv: 0..1 with y up; p: aspect-correct, centred, width = 1
void finish(vec3 c, vec2 uv){
  float v = smoothstep(1.25, 0.35, length((uv - vec2(0.5, 0.55))*vec2(1.0, 0.85)));
  c = mix(lin(u_deep), c, 0.35 + 0.65*v);
  vec3 s = srgb(c) + (hash(gl_FragCoord.xy + u_t) - 0.5)/255.0;
  o = vec4(s, 1.0);
}
`;

const BODY: Record<ShaderKind, string> = {
  mesh: `
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x);
  float t = u_t*0.06 + u_seed;
  vec2 a = vec2(-0.32 + 0.12*sin(t*1.3), 0.55 + 0.10*cos(t*0.9));
  vec2 b = vec2(0.36 + 0.10*cos(t*1.1), 0.25 + 0.14*sin(t*0.7));
  vec2 c = vec2(-0.20 + 0.14*sin(t*0.8 + 2.0), -0.45 + 0.12*cos(t*1.2));
  vec2 d = vec2(0.30 + 0.10*sin(t*1.4 + 1.0), -0.70 + 0.10*cos(t));
  vec2 w = p + 0.06*vec2(snoise(p*1.4 + t), snoise(p*1.4 - t + 9.0));
  float wa = exp(-dot(w - a, w - a)*5.0), wb = exp(-dot(w - b, w - b)*6.0), wc = exp(-dot(w - c, w - c)*4.5), wd = exp(-dot(w - d, w - d)*6.0);
  vec3 col = lin(u_bg);
  col = mix(col, lin(u_mid), wa*0.9);
  col = mix(col, lin(u_light)*0.65, wb*0.75*u_energy);
  col = mix(col, lin(u_mid)*1.2, wc*0.8);
  col = mix(col, lin(u_hi)*0.45, wd*0.55*u_energy);
  finish(col, uv);
}`,
  silk: `
// broad diagonal folds, gently warped: satin catching light on each crest
float folds(vec2 q, float t){
  q += 0.16*vec2(snoise(q*0.7 + vec2(t, 0.0)), snoise(q*0.7 + vec2(5.0, -t)));
  return sin(q.x*1.9 + q.y*3.1 + 0.9*snoise(q*0.55 + t*0.4));
}
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x)*1.2;
  float t = u_t*0.05 + u_seed;
  float f = folds(p, t);
  float e = 0.012;
  float fx = folds(p + vec2(e, 0.0), t) - f, fy = folds(p + vec2(0.0, e), t) - f;
  vec3 n = normalize(vec3(-fx, -fy, e*2.2));
  float diff = max(dot(n, normalize(vec3(-0.5, 0.6, 0.65))), 0.0);
  float spec = pow(max(dot(reflect(-normalize(vec3(0.3, 0.8, 0.6)), n), vec3(0.0, 0.0, 1.0)), 0.0), 10.0);
  vec3 col = mix(lin(u_bg), lin(u_mid)*0.9, diff*0.85);
  col += lin(u_light)*spec*0.5*u_energy;
  col += lin(u_hi)*pow(spec, 3.0)*0.3*u_energy;
  finish(col, uv);
}`,
  metal: `
vec3 ramp(float x){
  vec3 a = lin(u_deep), b = lin(u_mid), c = lin(u_light), d = lin(u_hi);
  x = clamp(x, 0.0, 1.0);
  if (x < 0.35) return mix(a, b, smoothstep(0.0, 0.35, x));
  if (x < 0.62) return mix(b, c, smoothstep(0.35, 0.62, x));
  if (x < 0.8) return mix(c, d, smoothstep(0.62, 0.8, x));
  return mix(d, c, smoothstep(0.8, 1.0, x));
}
float surf(vec2 q, float t){
  q += 0.45*vec2(fbm3(q*0.7 + t), fbm3(q*0.7 - t + 3.0));
  return sin(q.y*3.2 - q.x*1.4 + 1.2*fbm3(q*0.9 + t*0.6));
}
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x)*1.1;
  float t = u_t*0.045 + u_seed;
  float h = surf(p, t);
  float e = 0.01;
  vec3 n = normalize(vec3(-(surf(p + vec2(e, 0.0), t) - h), -(surf(p + vec2(0.0, e), t) - h), e*1.6));
  // a mirror surface reflecting a soft studio ramp: the reflected direction picks the colour
  float r = 0.5 + 0.5*n.y + 0.18*n.x;
  vec3 col = ramp(r);
  col = max(col*(0.05 + 0.24*u_energy), lin(u_bg)); // darken, don't wash: chrome keeps its contrast
  // keep the top third calmer, where headings sit
  col = mix(col, lin(u_bg), 0.35*smoothstep(0.55, 0.9, uv.y));
  finish(col, uv);
}`,
  aurora: `
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x);
  float t = u_t*0.08 + u_seed;
  vec3 col = lin(u_bg);
  for (int i = 0; i < 3; i++){
    float fi = float(i);
    float y0 = 0.42 - fi*0.2 + 0.06*sin(t*0.6 + fi*2.1);
    float curve = y0 + 0.09*snoise(vec2(p.x*1.1 + fi*3.0, t*0.45 + fi)) + 0.04*sin(p.x*2.4 + t + fi);
    float d = p.y - curve;
    // a curtain: soft lit hem, light fading upward, faint vertical folds
    float body = exp(-max(d, 0.0)*(3.2 + fi*1.5))*smoothstep(-0.07, 0.04, d);
    float folds = 0.75 + 0.25*snoise(vec2(p.x*5.0 + fi*7.0, t*0.5));
    // curtains break up along their length, like real aurora, instead of one band across the frame
    float span = smoothstep(-0.25, 0.55, snoise(vec2(p.x*1.6 + fi*5.0 + t*0.25, fi*3.0)));
    vec3 tint = mix(lin(u_light), lin(u_hi), 0.25*fi);
    col += tint*body*folds*span*(0.34 - fi*0.08)*u_energy*1.6;
  }
  finish(col, uv);
}`,
  rays: `
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x);
  float t = u_t*0.07 + u_seed;
  vec2 src = vec2(-0.15 + 0.05*sin(t*0.5), 1.05);
  vec2 d = p - src; float ang = atan(d.x, -d.y); float dist = length(d);
  float shafts = 0.5 + 0.5*snoise(vec2(ang*9.0, t*0.6)); shafts = pow(shafts, 2.2);
  float fine = 0.5 + 0.5*snoise(vec2(ang*31.0, t*0.9 + 4.0));
  float fall = exp(-dist*1.35)*smoothstep(0.75, 0.0, abs(ang));
  vec3 col = lin(u_bg) + lin(u_mid)*0.5*exp(-dist*1.8);
  col += lin(u_light)*fall*(shafts*0.8 + fine*0.2)*0.55*u_energy;
  col += lin(u_hi)*exp(-dist*5.0)*0.25*u_energy;
  finish(col, uv);
}`,
  contour: `
void main(){
  vec2 uv = gl_FragCoord.xy/u_res; vec2 p = (uv - 0.5)*vec2(1.0, u_res.y/u_res.x);
  float t = u_t*0.04 + u_seed;
  float h = fbm3(p*0.95 + vec2(t*0.6, -t*0.3)) + 0.3*snoise(p*0.5 - t*0.2);
  float k = h*12.0;
  float w = fwidth(k);
  float d1 = min(fract(k), 1.0 - fract(k));
  float line = 1.0 - smoothstep(0.0, w*0.9, d1);
  float k5 = k/5.0; float d5 = min(fract(k5), 1.0 - fract(k5))*5.0;
  float major = 1.0 - smoothstep(0.0, w*1.3, d5);
  vec3 col = mix(lin(u_bg), lin(u_mid)*0.55, smoothstep(-0.5, 0.8, h)*0.5);
  col += lin(u_light)*(line*0.11 + major*0.24)*u_energy;
  finish(col, uv);
}`,
};

const VERT = `#version 300 es
in vec2 a; void main(){gl_Position = vec4(a, 0.0, 1.0);}`;

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

type GLState = {gl: WebGL2RenderingContext; prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null>; kind: ShaderKind};
const build = (canvas: HTMLCanvasElement, kind: ShaderKind): GLState | null => {
  const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false});
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`ShaderBackdrop(${kind}): ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, COMMON + BODY[kind]));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const loc: GLState['loc'] = {};
  for (const n of ['u_res', 'u_t', 'u_energy', 'u_seed', 'u_bg', 'u_deep', 'u_mid', 'u_light', 'u_hi']) loc[n] = gl.getUniformLocation(prog, n);
  return {gl, prog, loc, kind};
};

// kind: the look; energy: highlight strength (0..1); speed: time multiplier; seed: shifts the pattern so two scenes
// using the same kind don't match; res: render scale (default 0.5, upscaled: these are soft, so it's free; contour 1);
// colors: override the theme palette {bg, deep, mid, light, hi} as hex.
export const ShaderBackdrop: React.FC<{
  kind?: ShaderKind;
  energy?: number;
  speed?: number;
  seed?: number;
  res?: number;
  opacity?: number;
  colors?: Partial<Record<'bg' | 'deep' | 'mid' | 'light' | 'hi', string>>;
  style?: React.CSSProperties;
}> = ({kind = 'mesh', energy = 0.5, speed = 1, seed = 0, res: resProp, opacity = 1, colors, style}) => {
  const res = resProp ?? (kind === 'contour' ? 1 : 0.5); // contour lines need full resolution to stay fine
  const C = useKitTheme();
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const st = useRef<GLState | null>(null);
  const w = Math.round(width * res), h = Math.round(height * res);
  const pal = {
    bg: C.type3d.bg, deep: C.type3d.env[4], mid: C.type3d.env[0], light: C.type3d.light, hi: String(C.type3d.ramp[2][1]),
    ...colors,
  };
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!st.current || st.current.kind !== kind) st.current = build(canvas, kind);
    const s = st.current;
    if (!s) return;
    const {gl, loc} = s;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(loc.u_res, w, h);
    gl.uniform1f(loc.u_t, (frame / fps) * speed);
    gl.uniform1f(loc.u_energy, energy);
    gl.uniform1f(loc.u_seed, seed * 13.7);
    gl.uniform3f(loc.u_bg, ...hex(pal.bg));
    gl.uniform3f(loc.u_deep, ...hex(pal.deep));
    gl.uniform3f(loc.u_mid, ...hex(pal.mid));
    gl.uniform3f(loc.u_light, ...hex(pal.light));
    gl.uniform3f(loc.u_hi, ...hex(pal.hi));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });
  return <canvas ref={ref} width={w} height={h} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, ...style}} />;
};
