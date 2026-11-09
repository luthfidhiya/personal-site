import { useEffect, useRef } from "react";
import { motionAllowed, useMotion } from "../hooks/useMotion";

// The night air in front of the art: embers and ash simulated on the GPU, and a procedural
// mist that rolls along the ground of the scenes marked [data-fog]. The embers answer the
// page: scrolling blows them like wind, and the cursor pushes them aside.
// three.js loads after first paint, so the hero image is never waiting on it.

const EMBERS = 140;
const ASH = 50;

const pointVert = /* glsl */ `
  attribute float aSize;
  attribute float aHeat;
  attribute float aAlpha;
  varying float vHeat;
  varying float vAlpha;
  uniform float uDpr;
  void main() {
    vHeat = aHeat;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uDpr;
  }
`;

const pointFrag = /* glsl */ `
  varying float vHeat;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    // A bright core inside a soft halo
    float core = smoothstep(0.35, 0.0, d);
    float halo = pow(1.0 - d, 2.2);
    vec3 ash = vec3(0.86, 0.82, 0.76);
    vec3 ember = mix(vec3(0.85, 0.12, 0.13), vec3(1.0, 0.72, 0.42), core);
    vec3 col = mix(ash, ember, vHeat);
    float a = (halo * 0.55 + core * 0.9) * vAlpha;
    gl_FragColor = vec4(col * a, a);
  }
`;

const fogVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fogFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uFog;
  uniform vec2 uRes;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }
  void main() {
    vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * 2.4;
    p.y -= uScroll;
    // Two layers drifting at different speeds, one warping the other: mist that curls, not slides
    vec2 q = vec2(fbm(p + vec2(uTime * 0.035, 0.0)), fbm(p + vec2(5.2, uTime * 0.02)));
    float n = fbm(p + 1.8 * q + vec2(uTime * 0.05, 0.0));
    // Lies low: thick at the bottom of the screen, gone by the middle
    float ground = smoothstep(0.62, 0.0, vUv.y);
    float a = smoothstep(0.35, 0.85, n) * ground * uFog * 0.38;
    vec3 col = mix(vec3(0.43, 0.12, 0.14), vec3(0.78, 0.72, 0.66), q.x);
    gl_FragColor = vec4(col * a, a);
  }
`;

const Atmosphere = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { allowed, reduced } = useMotion();
  const loopRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);

      // Mist: one full-screen quad, drawn first
      const fogMat = new THREE.ShaderMaterial({
        vertexShader: fogVert,
        fragmentShader: fogFrag,
        transparent: true,
        depthTest: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uFog: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      });
      const fog = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fogMat);
      fog.frustumCulled = false;
      scene.add(fog);

      // Particles: embers (hot, quick, flicker) then ash (pale, slow, larger)
      const n = EMBERS + ASH;
      const pos = new Float32Array(n * 3);
      const size = new Float32Array(n);
      const heat = new Float32Array(n);
      const alpha = new Float32Array(n);
      const vx = new Float32Array(n);
      const vy = new Float32Array(n);
      const rise = new Float32Array(n);
      const phase = new Float32Array(n);
      const depth = new Float32Array(n);

      let W = window.innerWidth;
      let H = window.innerHeight;

      const spawn = (i: number, anywhere: boolean) => {
        const isEmber = i < EMBERS;
        depth[i] = 0.35 + Math.random() * 0.65;
        pos[i * 3] = Math.random() * W;
        pos[i * 3 + 1] = anywhere ? Math.random() * H : -10 - Math.random() * 40;
        vx[i] = 0;
        vy[i] = 0;
        rise[i] = (isEmber ? 28 + Math.random() * 50 : 10 + Math.random() * 18) * depth[i];
        size[i] = (isEmber ? 2 + Math.random() * 3.5 : 3 + Math.random() * 4) * (0.6 + depth[i] * 0.6);
        heat[i] = isEmber ? 0.75 + Math.random() * 0.25 : 0;
        phase[i] = Math.random() * 1000;
      };
      for (let i = 0; i < n; i++) spawn(i, true);

      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(pos, 3);
      const heatAttr = new THREE.BufferAttribute(heat, 1);
      const alphaAttr = new THREE.BufferAttribute(alpha, 1);
      posAttr.setUsage(THREE.DynamicDrawUsage);
      heatAttr.setUsage(THREE.DynamicDrawUsage);
      alphaAttr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute("position", posAttr);
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aHeat", heatAttr);
      geo.setAttribute("aAlpha", alphaAttr);
      const pointsMat = new THREE.ShaderMaterial({
        vertexShader: pointVert,
        fragmentShader: pointFrag,
        transparent: true,
        depthTest: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        uniforms: { uDpr: { value: dpr } },
      });
      const points = new THREE.Points(geo, pointsMat);
      points.frustumCulled = false;
      scene.add(points);

      const resize = () => {
        W = window.innerWidth;
        H = window.innerHeight;
        renderer.setSize(W, H, false);
        camera.right = W;
        camera.top = H;
        camera.updateProjectionMatrix();
        fogMat.uniforms.uRes.value.set(W, H);
      };
      resize();

      // Inputs: scroll speed acts as wind, the cursor as a hand moving through the air
      let lastY = window.scrollY;
      let wind = 0;
      const pointer = { x: -9999, y: -9999, dx: 0, dy: 0 };
      const onMove = (e: PointerEvent) => {
        const x = e.clientX;
        const y = H - e.clientY;
        if (pointer.x > -9000) {
          pointer.dx += x - pointer.x;
          pointer.dy += y - pointer.y;
        }
        pointer.x = x;
        pointer.y = y;
      };
      const onLeave = () => {
        pointer.x = pointer.y = -9999;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", resize);

      const fogTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-fog]"));
      const fogAmount = () => {
        let f = 0;
        for (const el of fogTargets) {
          const r = el.getBoundingClientRect();
          const visible = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)) / H;
          f = Math.max(f, visible);
        }
        return f;
      };

      let frame = 0;
      let last = performance.now();
      let time = 0;
      let fogLevel = fogAmount();

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        time += dt;

        const y = window.scrollY;
        // px per second, eased so a flick of the wheel becomes a gust that dies down
        wind += ((y - lastY) / Math.max(dt, 0.001) - wind) * 0.12;
        lastY = y;
        const gust = Math.max(-1600, Math.min(1600, wind));

        const pull = Math.hypot(pointer.dx, pointer.dy);
        for (let i = 0; i < n; i++) {
          const ix = i * 3;
          let x = pos[ix];
          let py = pos[ix + 1];
          const d = depth[i];
          const t = time + phase[i];
          // Rising heat, a lazy sideways sway, and the scroll wind (near particles feel it more)
          const sway = Math.sin(t * 0.9) * 14 + Math.sin(t * 2.3 + d * 7) * 6;
          let ax = 0;
          let ay = 0;
          const ddx = x - pointer.x;
          const ddy = py - pointer.y;
          const dist2 = ddx * ddx + ddy * ddy;
          if (dist2 < 140 * 140) {
            const dist = Math.sqrt(dist2) || 1;
            const force = (1 - dist / 140) * 900 * d;
            ax += (ddx / dist) * force + pointer.dx * 18 * d;
            ay += (ddy / dist) * force + pointer.dy * 18 * d;
          }
          vx[i] = (vx[i] + ax * dt) * (1 - 2.2 * dt);
          vy[i] = (vy[i] + ay * dt) * (1 - 2.2 * dt);
          x += (sway * 0.6 + vx[i]) * dt;
          py += (rise[i] + vy[i] + gust * 0.45 * d) * dt;

          // Embers cool as they climb and flicker while they burn
          if (i < EMBERS) {
            heat[i] = Math.max(0.15, heat[i] - dt * 0.035);
            alpha[i] = (0.35 + 0.65 * heat[i]) * (0.7 + 0.3 * Math.sin(t * 9 + phase[i]));
          } else {
            alpha[i] = 0.18 + 0.12 * Math.sin(t * 0.7);
          }

          if (py > H + 30 || py < -60 || x < -40 || x > W + 40) {
            spawn(i, false);
            // A strong upward gust brings them back in from the top instead
            if (gust < -200) pos[ix + 1] = H + 20;
            continue;
          }
          pos[ix] = x;
          pos[ix + 1] = py;
        }
        pointer.dx *= 0.6;
        pointer.dy *= 0.6;
        if (pull < 0.01) pointer.dx = pointer.dy = 0;

        posAttr.needsUpdate = true;
        heatAttr.needsUpdate = true;
        alphaAttr.needsUpdate = true;

        fogLevel += (fogAmount() - fogLevel) * 0.08;
        fogMat.uniforms.uTime.value = time;
        fogMat.uniforms.uScroll.value = y / H / 2.5;
        fogMat.uniforms.uFog.value = fogLevel;
        renderer.render(scene, camera);
      };

      const start = () => {
        if (frame || !motionAllowed() || document.hidden) return;
        last = performance.now();
        lastY = window.scrollY;
        frame = requestAnimationFrame(tick);
      };
      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
      };
      const onVisibility = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVisibility);
      loopRef.current = { start, stop };
      start();

      cleanup = () => {
        stop();
        loopRef.current = null;
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
        geo.dispose();
        pointsMat.dispose();
        fogMat.dispose();
        fog.geometry.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [reduced]);

  // Pause and resume without tearing the scene down
  useEffect(() => {
    if (allowed) loopRef.current?.start();
    else loopRef.current?.stop();
  }, [allowed]);

  if (reduced) return null;
  return <canvas ref={ref} className="atmosphere" aria-hidden="true" />;
};

export default Atmosphere;
