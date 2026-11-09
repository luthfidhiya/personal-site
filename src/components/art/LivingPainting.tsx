import { useEffect, useRef } from "react";
import { useMotion } from "../../hooks/useMotion";

// A painting brought to life on the GPU (a cinemagraph): the picture stays as it was
// painted, and only chosen regions move. Water flows down the falls and ripples in the
// pool, grass and bamboo bend in the wind, lanterns flicker, the moon breathes, mist drifts
// and sparks rise. Coordinates are fractions of the image (x right, y down).
//
// It runs only while the scene is on screen and motion is allowed; otherwise the canvas
// is hidden and the still <img> underneath is what the visitor sees.

type Rect = [number, number, number, number]; // x0, y0, x1, y1
type Light = [number, number, number, number]; // x, y, radius, strength

export interface PaintingFx {
  /** Water falling: the region streams downward */
  flow?: Rect;
  /** Still water: the region ripples */
  ripple?: Rect;
  /** Wind: the region bends, tops moving most */
  sway?: Rect;
  swayAmp?: number;
  /** Parts of the sway region that must hold still (figures) */
  hold?: Rect[];
  /** Flickering lamps */
  lights?: Light[];
  /** A slow pulse of red light (the moon) */
  glow?: Light;
  /** Mist rolling along the bottom */
  fog?: number;
  /** Sparks: how many, and whether they rise (embers) or wander (fireflies, dust) */
  sparks?: number;
  rise?: boolean;
  sparkColor?: [number, number, number];
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform vec2 uFocus;
uniform float uTime;
uniform vec4 uFlow;
uniform vec4 uRipple;
uniform vec4 uSway;
uniform float uSwayAmp;
uniform vec4 uHold[3];
uniform vec4 uLights[6];
uniform vec4 uGlow;
uniform float uFog;
uniform float uSparks;
uniform float uRise;
uniform vec3 uSparkColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
// 1 inside the rect, fading out over a soft edge
float inRect(vec2 uv, vec4 r, float soft) {
  if (r.z <= r.x) return 0.0;
  vec2 a = smoothstep(r.xy - soft, r.xy + soft, uv);
  vec2 b = 1.0 - smoothstep(r.zw - soft, r.zw + soft, uv);
  return a.x * a.y * b.x * b.y;
}

void main() {
  // object-fit: cover, with the crop held at uFocus
  float sr = uRes.x / uRes.y;
  float ir = uImg.x / uImg.y;
  vec2 scale = sr > ir ? vec2(1.0, ir / sr) : vec2(sr / ir, 1.0);
  vec2 uv = (vUv - 0.5) * scale + 0.5 + (uFocus - 0.5) * (1.0 - scale);
  float t = uTime;
  vec2 suv = uv;

  // Wind
  float hold = 0.0;
  for (int i = 0; i < 3; i++) hold = max(hold, inRect(uv, uHold[i], 0.02));
  float sway = inRect(uv, uSway, 0.03) * (1.0 - hold);
  if (sway > 0.0) {
    float h = clamp((uSway.w - uv.y) / max(uSway.w - uSway.y, 0.001), 0.0, 1.0);
    float gust = sin(t * 1.1 + uv.x * 7.0) * 0.6 + sin(t * 0.47 + uv.x * 2.3) * 0.4 + (noise(vec2(uv.x * 6.0, t * 0.6)) - 0.5) * 0.8;
    suv.x += gust * uSwayAmp * h * h * sway;
  }

  // Falling water
  float flow = inRect(uv, uFlow, 0.012);
  float streak = 0.0;
  if (flow > 0.0) {
    float n = fbm(vec2(uv.x * 55.0, uv.y * 5.0 - t * 2.6));
    suv.y += (n - 0.5) * 0.02 * flow;
    suv.x += (noise(vec2(uv.x * 30.0, uv.y * 20.0 - t * 4.0)) - 0.5) * 0.004 * flow;
    streak = pow(fbm(vec2(uv.x * 80.0, uv.y * 3.0 - t * 3.4)), 3.0) * flow;
  }

  // Still water
  float rip = inRect(uv, uRipple, 0.02);
  if (rip > 0.0) {
    suv.x += sin(uv.y * 240.0 - t * 1.8) * 0.0016 * rip;
    suv.y += sin(uv.x * 70.0 + t * 1.2) * 0.0012 * rip;
  }

  vec3 col = texture2D(uTex, clamp(suv, 0.0, 1.0)).rgb;
  col += vec3(1.0, 0.75, 0.72) * streak * 0.35;
  if (rip > 0.0) col += vec3(0.9, 0.25, 0.25) * pow(noise(vec2(uv.x * 40.0 + t * 0.4, uv.y * 120.0)), 6.0) * 0.25 * rip;

  // Flickering lamps
  vec2 asp = vec2(ir, 1.0);
  for (int i = 0; i < 6; i++) {
    vec4 L = uLights[i];
    if (L.w <= 0.0) continue;
    float d = length((uv - L.xy) * asp);
    float f = 0.65 + 0.35 * noise(vec2(t * 3.1 + float(i) * 7.0, float(i)));
    col += vec3(1.0, 0.42, 0.22) * L.w * f * smoothstep(L.z, 0.0, d);
  }

  // The moon breathing
  if (uGlow.w > 0.0) {
    float d = length((uv - uGlow.xy) * asp);
    float pulse = 0.5 + 0.5 * sin(t * 0.7);
    col += vec3(0.9, 0.12, 0.12) * uGlow.w * pulse * smoothstep(uGlow.z * 1.7, uGlow.z * 0.7, d);
  }

  // Mist along the ground
  if (uFog > 0.0) {
    float m = fbm(vec2(uv.x * 3.0 + t * 0.05, uv.y * 6.0 - t * 0.02));
    col = mix(col, vec3(0.32, 0.08, 0.1), uFog * m * smoothstep(0.55, 1.0, uv.y));
  }

  // Sparks: embers rising or motes wandering
  if (uSparks > 0.0) {
    float n = uSparks;
    vec2 p = vec2(uv.x * n, uv.y * n * 0.6 + (uRise > 0.5 ? t * 0.9 : sin(t * 0.3) * 0.4));
    vec2 cell = floor(p);
    vec2 f = fract(p);
    float r = hash(cell);
    if (r > 0.72) {
      vec2 pos = vec2(hash(cell + 3.1), hash(cell + 7.7));
      pos.x += sin(t * (0.6 + r) + r * 20.0) * 0.25;
      pos.y += uRise > 0.5 ? 0.0 : cos(t * (0.5 + r) + r * 9.0) * 0.25;
      float d = length(f - pos);
      float tw = 0.55 + 0.45 * sin(t * (2.0 + r * 3.0) + r * 40.0);
      col += uSparkColor * smoothstep(0.09, 0.0, d) * tw;
    }
  }

  gl_FragColor = vec4(col, 1.0);
}`;

interface Props {
  src: string;
  width: number;
  height: number;
  focus: [number, number];
  fx: PaintingFx;
}

const LivingPainting = ({ src, width, height, focus, fx }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { allowed } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !allowed) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const compile = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const rect = (r?: [number, number, number, number]) => r ?? [0, 0, 0, 0];
    gl.uniform2f(u("uImg"), width, height);
    gl.uniform2f(u("uFocus"), focus[0], focus[1]);
    gl.uniform4fv(u("uFlow"), rect(fx.flow));
    gl.uniform4fv(u("uRipple"), rect(fx.ripple));
    gl.uniform4fv(u("uSway"), rect(fx.sway));
    gl.uniform1f(u("uSwayAmp"), fx.swayAmp ?? 0.006);
    const holds = [...(fx.hold ?? []), [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]].slice(0, 3).flat();
    gl.uniform4fv(u("uHold"), holds);
    const lights = [...(fx.lights ?? []), ...Array(6).fill([0, 0, 0, 0])].slice(0, 6).flat();
    gl.uniform4fv(u("uLights"), lights);
    gl.uniform4fv(u("uGlow"), rect(fx.glow));
    gl.uniform1f(u("uFog"), fx.fog ?? 0);
    gl.uniform1f(u("uSparks"), fx.sparks ?? 0);
    gl.uniform1f(u("uRise"), fx.rise ? 1 : 0);
    gl.uniform3fv(u("uSparkColor"), fx.sparkColor ?? [1, 0.55, 0.3]);
    const uTime = u("uTime");
    const uRes = u("uRes");

    const tex = gl.createTexture();
    let ready = false;
    let disposed = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ready = true;
      schedule();
    };
    img.src = src;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    let frame = 0;
    let visible = false;
    const start = performance.now();
    const draw = () => {
      frame = 0;
      if (!ready || !visible) return;
      resize();
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.live = "";
      frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && visible && ready) frame = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) schedule();
    });
    io.observe(canvas);

    return () => {
      disposed = true;
      img.onload = null;
      cancelAnimationFrame(frame);
      io.disconnect();
      delete canvas.dataset.live;
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [allowed, src, width, height, focus, fx]);

  return <canvas ref={ref} className="living" aria-hidden="true" />;
};

export default LivingPainting;
