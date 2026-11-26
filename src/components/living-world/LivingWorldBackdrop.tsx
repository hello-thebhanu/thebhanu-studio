"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Minimal structural type definitions for Three.js r149 loaded from /landing-pages/inner-green-assets/three.min.js
/* eslint-disable @typescript-eslint/no-explicit-any */
type ThreeGlobal = any;

declare global {
  interface Window {
    THREE?: ThreeGlobal;
  }
}

function loadThreeRuntime(): Promise<ThreeGlobal | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.THREE) return Promise.resolve(window.THREE);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-sylva-three="true"]'
    );
    if (existing) {
      if (window.THREE) {
        resolve(window.THREE);
        return;
      }
      existing.addEventListener("load", () => resolve(window.THREE ?? null), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/landing-pages/inner-green-assets/three.min.js";
    script.async = true;
    script.dataset.sylvaThree = "true";
    script.onload = () => resolve(window.THREE ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

interface LivingWorldBackdropProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function LivingWorldBackdrop({ containerRef }: LivingWorldBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isDarkRef = useRef(resolvedTheme === "dark");
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    let disposed = false;
    let rafId = 0;
    let cleanupListeners: (() => void) | null = null;
    let rendererInstance: ThreeGlobal = null;
    let initialized = false;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const startWorld = () => {
      if (initialized || disposed) return;
      initialized = true;

      loadThreeRuntime().then((THREE) => {
        if (disposed || !THREE || !canvasRef.current || !containerRef.current) return;

        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        const lowTierMobile =
          isMobile &&
          ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
            ((navigator as unknown as { deviceMemory?: number }).deviceMemory !== undefined &&
              (navigator as unknown as { deviceMemory?: number }).deviceMemory! <= 4));

        const handleContextLost = (e: Event) => {
          e.preventDefault();
          if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        };
        canvas.addEventListener("webglcontextlost", handleContextLost, false);

        let renderer: ThreeGlobal;
        try {
          renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
          });
        } catch {
          return;
        }

        rendererInstance = renderer;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
      camera.position.set(0, 0, 18);

      const uTime = { value: 0 };
      const uMouse = { value: new THREE.Vector3(999, 999, 0) };
      const uKeyDir = { value: new THREE.Vector3(0.45, 0.78, 0.42).normalize() };
      const uKeyCol = { value: new THREE.Color(0xf6f7ea) };
      const uAmbCol = { value: new THREE.Color(0x526546) };

      const worldGroup = new THREE.Group();
      scene.add(worldGroup);

      // Deterministic PRNG so the living roots grow consistently
      let seed = 0x51a7b39d;
      const rand = (lo: number, hi: number) => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return lo + (hi - lo) * (((t ^ (t >>> 14)) >>> 0) / 4294967296);
      };

      const sstep = (a: number, b: number, x: number) => {
        const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
        return t * t * (3 - 2 * t);
      };
      const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

      // ── 1. Winding Organic Moss Roots (Spanning Hero Bottom -> Contact) ──
      const rootCurves: ThreeGlobal[] = [
        // Left descending main root weaving down through Services -> Contact
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-9.2, 7.6, -2.5),
          new THREE.Vector3(-6.4, 3.8, -1.6),
          new THREE.Vector3(-7.6, -0.5, -2.0),
          new THREE.Vector3(-5.8, -5.2, -1.3),
          new THREE.Vector3(-7.4, -10.0, -2.2),
          new THREE.Vector3(-5.2, -14.8, -1.4),
          new THREE.Vector3(-6.8, -19.8, -2.0),
          new THREE.Vector3(-4.2, -24.5, -1.2),
        ]),
        // Right descending companion root echoing Sylva's right trunk
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(8.8, 7.8, -2.2),
          new THREE.Vector3(6.2, 3.6, -1.5),
          new THREE.Vector3(7.5, -1.4, -2.1),
          new THREE.Vector3(5.6, -6.2, -1.3),
          new THREE.Vector3(7.2, -11.4, -2.0),
          new THREE.Vector3(5.3, -16.2, -1.5),
          new THREE.Vector3(6.6, -21.0, -2.1),
          new THREE.Vector3(3.8, -25.2, -1.4),
        ]),
        // Left upper-mid offshoot tendril
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-6.5, 2.8, -1.7),
          new THREE.Vector3(-4.2, 1.4, -2.6),
          new THREE.Vector3(-2.6, 0.2, -3.4),
        ]),
        // Right mid offshoot tendril near Products/Studio
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(6.3, -6.8, -1.4),
          new THREE.Vector3(3.9, -8.1, -2.5),
          new THREE.Vector3(2.2, -9.2, -3.2),
        ]),
        // Lower-left floor tendril framing Contact
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-5.8, -15.4, -1.5),
          new THREE.Vector3(-3.3, -17.2, -2.4),
          new THREE.Vector3(-1.2, -18.5, -3.1),
        ]),
      ];

      const barkMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uKeyDir: uKeyDir,
          uKeyCol: uKeyCol,
          uAmbCol: uAmbCol,
          uTime: uTime,
        },
        vertexShader: `
          varying vec3 vN;
          varying vec3 vW;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vN = normalize(normalMatrix * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vW = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform vec3 uKeyDir, uKeyCol, uAmbCol;
          varying vec3 vN, vW;
          varying vec2 vUv;
          void main() {
            vec3 N = normalize(vN);
            float moss = smoothstep(-0.25, 0.55, N.y) * 0.72 + 0.28 * sin(vUv.x * 48.0 + vUv.y * 14.0);
            vec3 bark = vec3(0.16, 0.17, 0.13);
            vec3 forest = vec3(0.24, 0.36, 0.19);
            vec3 mossCol = vec3(0.36, 0.49, 0.26);
            vec3 base = mix(bark, mix(forest, mossCol, clamp(moss, 0.0, 1.0)), clamp(moss + 0.15, 0.0, 1.0));
            float diff = max(dot(N, uKeyDir), 0.0);
            vec3 col = base * (uKeyCol * (0.28 + 0.92 * diff) + uAmbCol * (0.55 + 0.45 * N.y));
            gl_FragColor = vec4(col, 0.94);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }
        `,
        transparent: true,
      });

      const rootGeometries: ThreeGlobal[] = [];
      const bladeSamples: { pos: ThreeGlobal; norm: ThreeGlobal }[] = [];

      rootCurves.forEach((curve, idx) => {
        const isMain = idx < 2;
        const tubSegs = isMain ? 96 : 36;
        const radSegs = isMain ? 10 : 7;
        const baseRadius = isMain ? 0.44 : 0.2;
        const geo = new THREE.TubeGeometry(curve, tubSegs, baseRadius, radSegs, false);

        // Taper radius smoothly along main roots and offshoots
        const posAttr = geo.attributes.position;
        const centerTmp = new THREE.Vector3();
        const vTmp = new THREE.Vector3();
        for (let i = 0; i <= tubSegs; i++) {
          const t = i / tubSegs;
          curve.getPointAt(t, centerTmp);
          const taper = isMain
            ? 0.95 - 0.52 * t + 0.14 * Math.sin(t * 14.0 + idx)
            : 1.0 - 0.85 * t;
          for (let j = 0; j <= radSegs; j++) {
            const vi = i * (radSegs + 1) + j;
            vTmp.fromBufferAttribute(posAttr, vi).sub(centerTmp).multiplyScalar(taper).add(centerTmp);
            posAttr.setXYZ(vi, vTmp.x, vTmp.y, vTmp.z);
          }
        }
        geo.computeVertexNormals();
        rootGeometries.push(geo);
        worldGroup.add(new THREE.Mesh(geo, barkMaterial));

        // Sample points on upper/front root faces for instanced moss blades
        const sampleCount = isMain ? (isMobile ? 280 : 760) : isMobile ? 60 : 160;
        const tangent = new THREE.Vector3();
        const upVec = new THREE.Vector3(0, 1, 0);
        const sideA = new THREE.Vector3();
        const sideB = new THREE.Vector3();
        for (let s = 0; s < sampleCount; s++) {
          const t = rand(0.02, 0.98);
          const p = curve.getPointAt(t);
          curve.getTangentAt(t, tangent).normalize();
          sideA.crossVectors(tangent, upVec);
          if (sideA.lengthSq() < 1e-4) sideA.set(1, 0, 0);
          sideA.normalize();
          sideB.crossVectors(sideA, tangent).normalize();

          const angle = rand(-Math.PI * 0.72, Math.PI * 0.72);
          const n = new THREE.Vector3()
            .addScaledVector(sideB, Math.cos(angle))
            .addScaledVector(sideA, Math.sin(angle))
            .normalize();
          const rad = baseRadius * (isMain ? 0.92 - 0.5 * t : 1.0 - 0.82 * t);
          p.addScaledVector(n, rad * 0.96);
          bladeSamples.push({ pos: p, norm: n });
        }
      });

      // ── 2. Instanced Swaying Moss Blades & Wildflower Florets ───────────
      const bladeGeo = new THREE.BufferGeometry();
      const bPos = new Float32Array([
        -0.032, 0, 0, 0.032, 0, 0, -0.022, 0.14, 0.012, 0.022, 0.14, 0.012, 0, 0.34, 0.035,
      ]);
      const bUv = new Float32Array([0, 0, 1, 0, 0.15, 0.45, 0.85, 0.45, 0.5, 1]);
      bladeGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
      bladeGeo.setAttribute("uv", new THREE.BufferAttribute(bUv, 2));
      bladeGeo.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
      bladeGeo.computeVertexNormals();

      const bladeCount = bladeSamples.length;
      const bladeSeeds = new Float32Array(bladeCount * 3);
      for (let i = 0; i < bladeCount; i++) {
        bladeSeeds[i * 3] = rand(0, 6.283);
        bladeSeeds[i * 3 + 1] = rand(0.65, 1.45);
        bladeSeeds[i * 3 + 2] = rand(0, 1);
      }
      bladeGeo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(bladeSeeds, 3));

      const bladeMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: uTime,
          uMouse: uMouse,
          uKeyDir: uKeyDir,
        },
        side: THREE.DoubleSide,
        vertexShader: `
          attribute vec3 aSeed;
          uniform float uTime;
          uniform vec3 uMouse;
          varying float vH;
          varying float vShade;
          void main() {
            vH = uv.y;
            vShade = aSeed.z;
            vec3 p = position;
            p.y *= aSeed.y;
            vec4 localPos = instanceMatrix * vec4(p, 1.0);
            float sway = sin(uTime * 1.4 + aSeed.x + localPos.y * 0.45) * 0.075 * vH * vH;
            localPos.x += sway;
            localPos.z += cos(uTime * 1.1 + aSeed.x) * 0.04 * vH;
            vec4 wp = modelMatrix * localPos;
            // Subtle cursor parting
            vec2 dm = wp.xy - uMouse.xy;
            float dist = length(dm);
            if (uMouse.x < 900.0 && dist < 2.2) {
              float push = (1.0 - dist / 2.2);
              wp.xy += normalize(dm + vec2(1e-4)) * push * push * 0.42 * vH;
            }
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: `
          precision highp float;
          varying float vH;
          varying float vShade;
          void main() {
            vec3 base = vec3(0.18, 0.28, 0.14);
            vec3 mid  = vec3(0.35, 0.50, 0.26);
            vec3 tip  = vec3(0.64, 0.80, 0.47);
            vec3 col = mix(base, mid, smoothstep(0.0, 0.55, vH));
            col = mix(col, tip, smoothstep(0.45, 1.0, vH) * (0.55 + 0.45 * vShade));
            gl_FragColor = vec4(col, 0.92);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }
        `,
      });

      const bladeMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, bladeCount);
      const dummy = new THREE.Object3D();
      const upDir = new THREE.Vector3(0, 1, 0);
      const qAlign = new THREE.Quaternion();
      for (let i = 0; i < bladeCount; i++) {
        const s = bladeSamples[i];
        dummy.position.copy(s.pos);
        qAlign.setFromUnitVectors(upDir, s.norm);
        dummy.quaternion.copy(qAlign);
        dummy.rotateY(rand(0, Math.PI * 2));
        dummy.rotateX(rand(-0.28, 0.28));
        const sc = rand(0.75, 1.45);
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        bladeMesh.setMatrixAt(i, dummy.matrix);
      }
      bladeMesh.instanceMatrix.needsUpdate = true;
      bladeMesh.frustumCulled = false;
      worldGroup.add(bladeMesh);

      // Tiny ivory/lime floret accents along the moss roots
      const floretCount = isMobile ? 48 : 110;
      const floretGeo = new THREE.SphereGeometry(0.042, 6, 5);
      const floretMat = new THREE.MeshBasicMaterial({
        color: 0xeff5e4,
        transparent: true,
        opacity: 0.85,
      });
      const floretMesh = new THREE.InstancedMesh(floretGeo, floretMat, floretCount);
      for (let i = 0; i < floretCount; i++) {
        const s = bladeSamples[(i * 17) % bladeCount];
        dummy.position.copy(s.pos).addScaledVector(s.norm, 0.16);
        dummy.rotation.set(0, 0, 0);
        const fScale = rand(0.65, 1.35);
        dummy.scale.setScalar(fScale);
        dummy.updateMatrix();
        floretMesh.setMatrixAt(i, dummy.matrix);
      }
      floretMesh.instanceMatrix.needsUpdate = true;
      floretMesh.frustumCulled = false;
      worldGroup.add(floretMesh);

      // ── 3. Sylva Swallowtail Butterfly (Scroll-Choreographed Down to Footer) ──
      const wingGeometry = (hind: boolean) => {
        const NS = 28;
        const NU = 9;
        const pos: number[] = [];
        const uv: number[] = [];
        const idx: number[] = [];
        for (let i = 0; i < NS; i++) {
          const sp = i / (NS - 1);
          const span = hind ? 0.78 : 0.95;
          const lead = hind
            ? -0.06 - 0.26 * sp
            : 0.1 + 0.32 * sp - 0.14 * sp * sp;
          let chord = hind
            ? (0.54 + 0.48 * sp) * Math.pow(Math.max(0, 1 - Math.pow(sp, 2.2)), 0.55) * (1 + 0.035 * Math.cos(sp * 22))
            : (0.56 + 0.46 * sp) * Math.pow(Math.max(0, 1 - Math.pow(sp, 2.6)), 0.55);
          chord = Math.max(chord * (0.26 + 0.74 * sstep(0, 0.32, sp)), 0.014);
          for (let j = 0; j < NU; j++) {
            const u = j / (NU - 1);
            const cam = 0.03 * Math.sin(Math.PI * u) * (1 - 0.35 * sp);
            pos.push(0.018 + sp * span, cam, lead - chord * u);
            uv.push(sp, u);
          }
        }
        for (let i = 0; i < NS - 1; i++) {
          for (let j = 0; j < NU - 1; j++) {
            const a = i * NU + j;
            const b = a + NU;
            idx.push(a, b, a + 1, b, b + 1, a + 1);
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        return g;
      };

      const wingTexture = () => {
        const N = 128;
        const cv = document.createElement("canvas");
        cv.width = cv.height = N;
        const ctx = cv.getContext("2d");
        if (!ctx) return new THREE.Texture();
        const img = ctx.createImageData(N, N);
        const d = img.data;
        const h2 = (x: number, y: number) => {
          const a = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
          const b = Math.sin(x * 269.5 + y * 183.3) * 43758.5453123;
          return [(a - Math.floor(a)) * 2 - 1, (b - Math.floor(b)) * 2 - 1];
        };
        const gn = (x: number, y: number) => {
          const ix = Math.floor(x);
          const iy = Math.floor(y);
          const fx = x - ix;
          const fy = y - iy;
          const ux = fx * fx * (3 - 2 * fx);
          const uy = fy * fy * (3 - 2 * fy);
          const g00 = h2(ix, iy);
          const g10 = h2(ix + 1, iy);
          const g01 = h2(ix, iy + 1);
          const g11 = h2(ix + 1, iy + 1);
          const top = g00[0] * fx + g00[1] * fy + (g10[0] * (fx - 1) + g10[1] * fy - (g00[0] * fx + g00[1] * fy)) * ux;
          const bot = g01[0] * fx + g01[1] * (fy - 1) + (g11[0] * (fx - 1) + g11[1] * (fy - 1) - (g01[0] * fx + g01[1] * (fy - 1))) * ux;
          return top + (bot - top) * uy;
        };
        const b255 = (v: number) => Math.max(0, Math.min(255, Math.round((v * 0.5 + 0.5) * 255)));
        for (let yi = 0; yi < N; yi++) {
          const u = yi / (N - 1);
          for (let xi = 0; xi < N; xi++) {
            const sp = xi / (N - 1);
            const o = (yi * N + xi) * 4;
            d[o] = b255(gn(u * 48, sp * 12));
            d[o + 1] = b255(gn(u * 110, sp * 38));
            d[o + 2] = b255(gn(sp * 4.5, u * 3.0));
            d[o + 3] = b255(gn(sp * 6.5 + 4.0, u * 4.5));
          }
        }
        ctx.putImageData(img, 0, 0);
        const tex = new THREE.CanvasTexture(cv);
        tex.flipY = false;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
      };

      const wingBend = { fore: { value: 0 }, hind: { value: 0 } };
      const wTex = wingTexture();
      const wingMat = (hind: boolean, bendUniform: { value: number }) =>
        new THREE.ShaderMaterial({
          uniforms: {
            uKeyDir: uKeyDir,
            uKeyCol: uKeyCol,
            uAmbCol: uAmbCol,
            uBend: bendUniform,
            uHind: { value: hind ? 1 : 0 },
            uTex: { value: wTex },
          },
          side: THREE.DoubleSide,
          extensions: { derivatives: true },
          vertexShader: `
            uniform float uBend;
            varying vec2 vUv; varying vec3 vN; varying vec3 vW;
            void main() {
              vUv = uv;
              vec3 p = position;
              float s = uv.x;
              p.y += uBend * s * s;
              p.z += uBend * s * s * (uv.y - 0.45) * 0.35;
              vN = normalize(normalMatrix * normal);
              vec4 wp = modelMatrix * vec4(p, 1.0);
              vW = wp.xyz;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            precision highp float;
            uniform vec3 uKeyDir, uKeyCol, uAmbCol;
            uniform float uHind;
            uniform sampler2D uTex;
            varying vec2 vUv; varying vec3 vN; varying vec3 vW;
            void main() {
              float s = vUv.x, u = vUv.y;
              vec3 N = normalize(vN);
              if (!gl_FrontFacing) N = -N;
              vec3 V = normalize(cameraPosition - vW);
              float facing = abs(dot(N, V));
              vec3 face = vec3(0.350, 0.580, 0.055);
              vec3 edge = vec3(0.068, 0.210, 0.018);
              vec3 wing = mix(edge, face, pow(facing, 0.65));
              wing *= 0.65 + 0.72 * smoothstep(0.02, 0.46, s) * (1.0 - 0.34 * smoothstep(0.45, 1.0, u));
              vec4 tx = texture2D(uTex, vUv);
              wing *= 0.80 + 0.40 * tx.b;
              wing = mix(wing * vec3(0.46, 1.14, 0.30), wing * vec3(1.34, 1.06, 0.16), tx.a);
              vec3 dark  = vec3(0.032, 0.028, 0.016);
              vec3 cream = vec3(0.550, 0.530, 0.310);
              vec3 amber = vec3(0.420, 0.290, 0.055);
              float border = max(smoothstep(0.60, 0.74, s), smoothstep(0.78, 0.94, u));
              vec3 c = mix(wing, dark, border);
              float vp = pow(u, 0.72) * 5.2 + s * 0.55 + (tx.b - 0.5) * 0.22;
              float vk = abs(fract(vp) - 0.5) * 2.0;
              float aa = fwidth(vp) * 2.0 + 0.045;
              float vw = 0.050 * (1.0 - 0.42 * s);
              float vein = 1.0 - smoothstep(vw, vw + aa, vk);
              c = mix(c, vec3(0.44, 0.41, 0.19), vein * 0.26 * (1.0 - border * 0.85));
              float lunBand = exp(-pow((border - 0.58) / 0.20, 2.0));
              float edgeT = u * 0.62 + s * 0.58;
              float lun = exp(-pow((fract(edgeT * 7.0) - 0.5) * 4.2, 2.0));
              c = mix(c, mix(cream, amber, uHind), border * lunBand * lun * 0.90);
              c *= 0.90 + 0.20 * tx.r;
              float wrap = dot(N, uKeyDir) * 0.5 + 0.5;
              vec3 lit = c * (uKeyCol * (0.38 + 1.05 * wrap) + uAmbCol * (0.5 + 0.5 * N.y) * 1.45);
              float back = pow(max(dot(V, -uKeyDir), 0.0), 2.4);
              lit += mix(vec3(0.86, 0.78, 0.20), vec3(0.34, 0.60, 0.12), border) * back * 0.42;
              gl_FragColor = vec4(lit, 1.0);
              #include <tonemapping_fragment>
              #include <encodings_fragment>
            }
          `,
        });

      const bfGroup = new THREE.Group();
      const foreG = wingGeometry(false);
      const hindG = wingGeometry(true);
      const foreM = wingMat(false, wingBend.fore);
      const hindM = wingMat(true, wingBend.hind);

      const wR1 = new THREE.Mesh(foreG, foreM);
      const wL1 = new THREE.Mesh(foreG, foreM);
      const wR2 = new THREE.Mesh(hindG, hindM);
      const wL2 = new THREE.Mesh(hindG, hindM);
      wL1.scale.x = -1;
      wL2.scale.x = -1;
      wR1.position.set(0.012, 0.012, 0);
      wL1.position.copy(wR1.position);
      wR2.position.set(0.01, 0, 0);
      wL2.position.copy(wR2.position);
      bfGroup.add(wR1, wL1, wR2, wL2);

      const bfBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1c1e14,
        roughness: 0.7,
        metalness: 0.1,
      });
      const bfBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.42, 4, 8), bfBodyMat);
      bfBody.rotation.x = Math.PI / 2;
      bfBody.position.z = -0.18;
      bfGroup.add(bfBody);

      bfGroup.scale.setScalar(isMobile ? 0.52 : 0.64);
      bfGroup.renderOrder = 10;
      bfGroup.traverse((o: ThreeGlobal) => {
        o.frustumCulled = false;
      });
      scene.add(bfGroup);

      // ── 4. Drifting Pollen Motes ────────────────────────────────────────
      const moteCount = isMobile ? 280 : 720;
      const mPos = new Float32Array(moteCount * 3);
      const mSeed = new Float32Array(moteCount * 4);
      for (let i = 0; i < moteCount; i++) {
        mPos[i * 3] = rand(-11, 11);
        mPos[i * 3 + 1] = rand(-7, 7);
        mPos[i * 3 + 2] = rand(-5, 6);
        mSeed[i * 4] = rand(0, 6.283);
        mSeed[i * 4 + 1] = rand(0.3, 1.1);
        mSeed[i * 4 + 2] = rand(0.4, 1.3);
        mSeed[i * 4 + 3] = 0.7 + Math.pow(rand(0, 1), 2.0);
      }
      const moteGeo = new THREE.BufferGeometry();
      moteGeo.setAttribute("position", new THREE.BufferAttribute(mPos, 3));
      moteGeo.setAttribute("seed", new THREE.BufferAttribute(mSeed, 4));

      // Radial glow texture
      const pCanvas = document.createElement("canvas");
      pCanvas.width = pCanvas.height = 64;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.35, "rgba(218,236,192,0.55)");
        grad.addColorStop(1, "rgba(218,236,192,0)");
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, 64, 64);
      }
      const poleTex = new THREE.CanvasTexture(pCanvas);

      const moteMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: uTime,
          uMap: { value: poleTex },
          uSize: { value: isMobile ? 16 : 22 },
          uScale: { value: 1.0 },
          uTint: { value: new THREE.Color(0xffffff) },
          uOpacity: { value: 0.55 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          attribute vec4 seed;
          uniform float uTime, uSize, uScale;
          varying float vFade;
          void main() {
            float ph = seed.x, sp = seed.y, am = seed.z;
            vec3 p = position;
            p.x += sin(uTime * sp * 0.4 + ph) * 0.45 * am;
            p.y += mod(uTime * 0.24 * sp + ph * 2.0, 14.0) - 7.0;
            p.z += cos(uTime * sp * 0.3 + ph) * 0.35 * am;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uSize * uScale * seed.w * (12.0 / max(-mv.z, 1.0));
            vFade = 0.45 + 0.55 * sin(uTime * (0.8 + sp * 1.4) + ph * 3.0);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          precision highp float;
          uniform sampler2D uMap;
          uniform vec3 uTint;
          uniform float uOpacity;
          varying float vFade;
          void main() {
            vec4 t = texture2D(uMap, gl_PointCoord);
            gl_FragColor = vec4(t.rgb * uTint, t.a * vFade * uOpacity);
          }
        `,
      });
      const motes = new THREE.Points(moteGeo, moteMat);
      motes.frustumCulled = false;
      scene.add(motes);

      // ── 5. Scroll & Pointer Tracking + Butterfly Flight Physics ─────────
      let scrollProgress = 0;
      let targetScroll = 0;
      let scrollVelocity = 0;
      let isInView = true;
      let isTabHidden = document.hidden;
      let containerTop = 0;
      let scrollableHeight = 1;

      const measureContainer = () => {
        const rect = container.getBoundingClientRect();
        containerTop = rect.top + window.scrollY;
        scrollableHeight = Math.max(1, rect.height - window.innerHeight);
      };

      const updateScrollProgress = () => {
        targetScroll = clamp01((window.scrollY - containerTop) / scrollableHeight);
      };

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
        measureContainer();
        updateScrollProgress();
      };

      const ndcPointer = { x: 999, y: 999 };
      const rayVec = new THREE.Vector3();
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        ndcPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        ndcPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        rayVec.set(ndcPointer.x, ndcPointer.y, 0.5).unproject(camera);
        rayVec.sub(camera.position).normalize();
        const tPlane = (0 - camera.position.z) / rayVec.z;
        uMouse.value.copy(camera.position).addScaledVector(rayVec, tPlane);
      };

      const onPointerLeave = () => {
        uMouse.value.set(999, 999, 0);
      };

      const onScroll = () => {
        const prev = targetScroll;
        updateScrollProgress();
        scrollVelocity = Math.min(1.5, Math.abs(targetScroll - prev) * 18);
      };

      const stopLoop = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      };

      let startLoopFn: (() => void) | null = null;

      const onVisibility = () => {
        isTabHidden = document.hidden;
        if (isTabHidden) {
          stopLoop();
        } else if (isInView) {
          startLoopFn?.();
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          isInView = entries[0]?.isIntersecting ?? true;
          if (!isInView) {
            stopLoop();
          } else if (!isTabHidden) {
            startLoopFn?.();
          }
        },
        { threshold: 0 }
      );
      observer.observe(container);

      const resizeObserver =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              measureContainer();
              updateScrollProgress();
            })
          : null;
      resizeObserver?.observe(container);

      window.addEventListener("resize", resize);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibility);

      cleanupListeners = () => {
        observer.disconnect();
        resizeObserver?.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        document.removeEventListener("visibilitychange", onVisibility);
      };

      resize();

      // Butterfly flight state across viewport
      const bfPos = new THREE.Vector3(-3.2, 2.2, 2.8);
      const bfVel = new THREE.Vector3(0.4, -0.2, 0);
      const bfGoal = new THREE.Vector3();
      const tmpV = new THREE.Vector3();
      const vFwd = new THREE.Vector3();
      const vRight = new THREE.Vector3();
      const vUp = new THREE.Vector3();
      const upRef = new THREE.Vector3(0, 1, 0);
      const matBasis = new THREE.Matrix4();
      const qTarget = new THREE.Quaternion();
      let flapPhase = 0;
      let lastTime = performance.now();

      const renderOnce = (dt: number, t: number) => {
        uTime.value = t;
        scrollProgress += (targetScroll - scrollProgress) * Math.min(1, dt * 5.2);
        scrollVelocity *= Math.exp(-dt * 4.5);

        // Descend smoothly along the roots from hero edge down to Contact
        worldGroup.position.y = scrollProgress * 19.5;

        // Subtle atmospheric lighting & pollen adaptation for Dark vs Light mode
        if (isDarkRef.current) {
          uAmbCol.value.setRGB(0.32, 0.4, 0.27);
          floretMat.opacity = 0.85;
          moteMat.uniforms.uScale.value = 1.0;
          moteMat.uniforms.uTint.value.setRGB(1, 1, 1);
          moteMat.uniforms.uOpacity.value = 0.55;
          if (moteMat.blending !== THREE.AdditiveBlending) {
            moteMat.blending = THREE.AdditiveBlending;
            moteMat.needsUpdate = true;
          }
          moteGeo.setDrawRange(0, moteCount);
        } else {
          uAmbCol.value.setRGB(0.46, 0.56, 0.38);
          floretMat.opacity = 0.65;
          moteMat.uniforms.uScale.value = 0.56;
          moteMat.uniforms.uTint.value.setRGB(0.42, 0.56, 0.31);
          moteMat.uniforms.uOpacity.value = 0.24;
          if (moteMat.blending !== THREE.NormalBlending) {
            moteMat.blending = THREE.NormalBlending;
            moteMat.needsUpdate = true;
          }
          moteGeo.setDrawRange(0, Math.round(moteCount * 0.62));
        }

        // Scroll-guided S-curve butterfly choreography from Services -> Contact
        const spreadX = isMobile ? 2.1 : 5.4;
        const curveX = Math.sin(scrollProgress * Math.PI * 2.6 - 0.5) * spreadX;
        const curveY = 2.0 - scrollProgress * 3.8 + Math.sin(t * 1.15) * 0.55;
        const curveZ = 2.6 + Math.cos(scrollProgress * Math.PI * 2.0) * 1.3;
        bfGoal.set(curveX, curveY, curveZ);

        // Gentle cursor avoidance
        let spook = 0;
        if (uMouse.value.x < 900) {
          const distToMouse = bfPos.distanceTo(uMouse.value);
          if (distToMouse < 2.6) {
            spook = clamp01(1 - distToMouse / 2.6);
            tmpV.copy(bfPos).sub(uMouse.value).normalize();
            bfGoal.addScaledVector(tmpV, spook * 2.8);
          }
        }

        tmpV.copy(bfGoal).sub(bfPos);
        const dist = tmpV.length();
        const desired = tmpV
          .normalize()
          .multiplyScalar(Math.min(3.8, 0.55 + dist * 1.35 + scrollVelocity * 1.4));
        desired.x += Math.sin(t * 2.6) * 0.35;
        desired.y += Math.sin(t * 3.4 + 1.2) * 0.42;

        bfVel.lerp(desired, 1 - Math.pow(0.05, dt));
        bfPos.addScaledVector(bfVel, dt);
        bfGroup.position.copy(bfPos);

        // Wing beat frequency rises during scroll travel or cursor proximity
        const beat = 6.2 + scrollVelocity * 3.8 + spook * 4.5 + Math.sin(t * 0.8) * 0.7;
        flapPhase += dt * beat * Math.PI * 2;
        const raw = Math.sin(flapPhase);
        const shaped = (raw < 0 ? -1 : 1) * Math.pow(Math.abs(raw), 0.72);
        const phi = ((22 + 46 * shaped) * Math.PI) / 180;
        const flapVel = Math.cos(flapPhase) * beat;

        wR1.rotation.z = phi;
        wL1.rotation.z = -phi;
        wR2.rotation.z = phi * 0.95 - 0.03;
        wL2.rotation.z = -(phi * 0.95 - 0.03);
        wingBend.fore.value = -flapVel * 0.01;
        wingBend.hind.value = -flapVel * 0.013;

        vFwd.copy(bfVel);
        if (vFwd.lengthSq() < 1e-5) vFwd.set(0.2, 0, 1);
        vFwd.normalize();
        vRight.crossVectors(vFwd, upRef);
        if (vRight.lengthSq() < 1e-5) vRight.set(1, 0, 0);
        vRight.normalize();
        vUp.crossVectors(vRight, vFwd).normalize();
        matBasis.makeBasis(vRight, vUp, vFwd);
        qTarget.setFromRotationMatrix(matBasis);
        bfGroup.quaternion.slerp(qTarget, Math.min(1, dt * 6.5));

        renderer.render(scene, camera);
      };

      const animate = (now: number) => {
        if (disposed || isTabHidden || !isInView) {
          rafId = 0;
          return;
        }
        rafId = requestAnimationFrame(animate);
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        if (reducedRef.current) {
          renderOnce(0.016, 1.2);
          return;
        }
        renderOnce(dt, now / 1000);
      };

      startLoopFn = () => {
        if (disposed || rafId || isTabHidden || !isInView) return;
        lastTime = performance.now();
        rafId = requestAnimationFrame(animate);
      };

      renderOnce(0.016, 0.4);
      if (!lowTierMobile) {
        startLoopFn();
      }

      const originalDispose = cleanupListeners;
      cleanupListeners = () => {
        originalDispose?.();
        rootGeometries.forEach((g) => g.dispose());
        barkMaterial.dispose();
        bladeGeo.dispose();
        bladeMat.dispose();
        floretGeo.dispose();
        floretMat.dispose();
        foreG.dispose();
        hindG.dispose();
        foreM.dispose();
        hindM.dispose();
        wTex.dispose();
        bfBody.geometry.dispose();
        bfBodyMat.dispose();
        moteGeo.dispose();
        moteMat.dispose();
        poleTex.dispose();
        renderer.dispose();
      };
    });
    };

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          lazyObserver.disconnect();
          startWorld();
        }
      },
      { rootMargin: "0px" }
    );
    lazyObserver.observe(container);

    return () => {
      disposed = true;
      lazyObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      cleanupListeners?.();
      if (rendererInstance && !cleanupListeners) {
        rendererInstance.dispose();
      }
    };
  }, [containerRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 z-0 -mb-[100vh] h-screen w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full opacity-95 transition-opacity duration-500"
      />
      {/* Top & bottom ambient edge blend so the 3D living-world merges seamlessly */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--bg-primary)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent" />
    </div>
  );
}
