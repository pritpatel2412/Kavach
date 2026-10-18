'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  // Simple pseudo-random hash for subtle grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Band function creating flowing organic curtains
  float auroraBand(vec2 uv, float speed, float freq, float offset) {
    float t = uTime * speed + offset;
    float wave = sin(uv.x * freq + t) * 0.18 + cos(uv.x * (freq * 1.5) - t * 0.8) * 0.09;
    float dist = abs(uv.y - 0.5 - wave);
    return smoothstep(0.35, 0.0, dist);
  }

  void main() {
    vec2 uv = vUv;
    
    // Deep emerald to vivid lime palette (#0a2a12, #0d3617, #388e3c, #c8f542)
    vec3 colDeepGreen = vec3(0.039, 0.165, 0.071);  // #0a2a12
    vec3 colMidGreen  = vec3(0.082, 0.350, 0.145);  // deep forest
    vec3 colLimeGlow  = vec3(0.784, 0.961, 0.259);  // #c8f542
    vec3 colCyanHint  = vec3(0.180, 0.720, 0.450);

    // Multi-frequency rays / bands
    float b1 = auroraBand(uv, 0.45, 3.2, 0.0);
    float b2 = auroraBand(uv, -0.35, 4.8, 1.7);
    float b3 = auroraBand(uv, 0.25, 6.4, 3.4);

    float combined = b1 * 0.5 + b2 * 0.35 + b3 * 0.25;

    // Soft vertical fade: brightest in upper third, smoothly fading down
    float verticalFade = smoothstep(0.0, 0.85, 1.0 - uv.y) * smoothstep(0.0, 0.25, uv.y + 0.1);

    // Color gradient interpolation
    vec3 color = mix(colDeepGreen, colMidGreen, combined * 0.8);
    color = mix(color, colCyanHint, b2 * 0.5);
    color = mix(color, colLimeGlow, pow(combined, 1.8) * 0.75);

    // Subtle film grain
    float grain = (hash(uv * uResolution + fract(uTime)) - 0.5) * 0.025;
    color += grain;

    float alpha = clamp(combined * verticalFade * 0.9, 0.0, 0.9);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface AuroraCanvasProps {
  className?: string;
  parallaxPercent?: number;
}

export const AuroraCanvas: React.FC<AuroraCanvasProps> = ({
  className = '',
  parallaxPercent = 22,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) {
      return;
    }

    // Compile shaders
    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }
    gl.useProgram(program);

    // Quad geometry
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResLoc = gl.getUniformLocation(program, 'uResolution');

    // Cap DPR at 1.5
    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uResLoc) {
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let animationFrameId: number;
    let isVisible = true;
    let isTabActive = !document.hidden;
    const startTime = performance.now();

    const render = (time: number) => {
      if (isVisible && isTabActive) {
        const elapsed = (time - startTime) * 0.001;
        if (uTimeLoc) {
          gl.uniform1f(uTimeLoc, elapsed);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    // Pause when canvas off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Pause when tab hidden
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Lazy start animation loop
    animationFrameId = requestAnimationFrame(render);

    // ScrollTrigger parallax: yPercent: 22
    let trigger: ScrollTrigger | null = null;
    if (parallaxPercent > 0) {
      trigger = ScrollTrigger.create({
        trigger: canvas.parentElement || canvas,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          gsap.set(canvas, { yPercent: self.progress * parallaxPercent });
        },
      });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      if (trigger) trigger.kill();
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, [parallaxPercent]);

  return (
    <canvas
      ref={canvasRef}
      id="glCanvas"
      data-testid="glCanvas"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        opacity: 0.9,
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
};
