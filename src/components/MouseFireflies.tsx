import { useEffect, useRef } from 'react';

type RGB = [number, number, number];
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  bornAt: number;
  phase: number;
  flickerSpeed: number;
  colorBorn: RGB;
  colorDie: RGB;
}

// 物理参数（按 Superhuman 抓取的真实值移植）
const PHYS = {
  spawnRate: 5,
  maxParticles: 400,
  lifeMs: 2800,
  birthRadius: 28,
  sizeMin: 1.6, sizeMax: 6.5,
  repulseRadius: 30,
  repulseForce: 0.012,
  attractForce: 0.016,
  jitter: 0.20,
  damping: 0.985,
  maxV: 2.2,
  bounceFactor: -0.8,
  flickerBase: 0.6,
  flickerAmp: 0.4,
  flickerSpeedMin: 1.0,
  flickerSpeedMax: 3.0,
};

// 配色：Superhuman 同款（暖金白 → 近纯白）
const PALETTE: { born: RGB; die: RGB }[] = [
  { born: [243, 180, 142], die: [255, 242, 230] },
];

export default function MouseFireflies() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 移动端 / 触屏 / 用户偏好减少动画 → 不渲染粒子
    if (
      typeof window === 'undefined' ||
      'ontouchstart' in window ||
      window.matchMedia?.('(hover: none)').matches ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let mouseX = 0, mouseY = 0;
    let mouseInside = false;
    let visibility = 0;
    let lastFrameTime = performance.now();
    let lastSpawnAcc = 0;
    let particles: Particle[] = [];
    let rafId = 0;

    function spawnParticle(now: number) {
      if (particles.length >= PHYS.maxParticles) return;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * PHYS.birthRadius;
      const colorPair = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      particles.push({
        x: mouseX + Math.cos(a) * r,
        y: mouseY + Math.sin(a) * r,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: PHYS.sizeMin + Math.random() * (PHYS.sizeMax - PHYS.sizeMin),
        bornAt: now,
        phase: Math.random() * Math.PI * 2,
        flickerSpeed: PHYS.flickerSpeedMin + Math.random() * (PHYS.flickerSpeedMax - PHYS.flickerSpeedMin),
        colorBorn: colorPair.born,
        colorDie: colorPair.die,
      });
    }

    function updateParticles(now: number, dt: number) {
      if (mouseInside) {
        lastSpawnAcc += PHYS.spawnRate * dt;
        while (lastSpawnAcc >= 1) {
          spawnParticle(now);
          lastSpawnAcc -= 1;
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const age = now - p.bornAt;
        if (age >= PHYS.lifeMs) { particles.splice(i, 1); continue; }

        p.vx += (Math.random() - 0.5) * PHYS.jitter;
        p.vy += (Math.random() - 0.5) * PHYS.jitter;

        if (mouseInside) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 0.1) {
            if (dist > PHYS.repulseRadius) {
              p.vx += (dx / dist) * PHYS.attractForce;
              p.vy += (dy / dist) * PHYS.attractForce;
            } else {
              p.vx -= (dx / dist) * PHYS.repulseForce;
              p.vy -= (dy / dist) * PHYS.repulseForce;
            }
          }
        }

        p.vx *= PHYS.damping;
        p.vy *= PHYS.damping;

        const v = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (v > PHYS.maxV) {
          p.vx = (p.vx / v) * PHYS.maxV;
          p.vy = (p.vy / v) * PHYS.maxV;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= PHYS.bounceFactor; }
        if (p.x > w) { p.x = w; p.vx *= PHYS.bounceFactor; }
        if (p.y < 0) { p.y = 0; p.vy *= PHYS.bounceFactor; }
        if (p.y > h) { p.y = h; p.vy *= PHYS.bounceFactor; }

        p.phase += p.flickerSpeed * dt;
      }
    }

    function renderParticles(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const age = now - p.bornAt;
        const ageRatio = Math.min(1, age / PHYS.lifeMs);

        const lifeAlpha = ageRatio < 0.7 ? 1 : (1 - (ageRatio - 0.7) / 0.3);
        const bornAlpha = ageRatio < 0.1 ? ageRatio / 0.1 : 1;
        const flicker = PHYS.flickerBase + PHYS.flickerAmp * Math.sin(p.phase);

        const alpha = flicker * lifeAlpha * bornAlpha * visibility;
        if (alpha < 0.01) continue;

        const r = Math.floor(p.colorBorn[0] + (p.colorDie[0] - p.colorBorn[0]) * ageRatio);
        const g = Math.floor(p.colorBorn[1] + (p.colorDie[1] - p.colorBorn[1]) * ageRatio);
        const b = Math.floor(p.colorBorn[2] + (p.colorDie[2] - p.colorBorn[2]) * ageRatio);

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;
      const targetVis = mouseInside ? 1 : 0;
      visibility += (targetVis - visibility) * 0.06;
      updateParticles(now, dt);
      renderParticles(now);
      rafId = requestAnimationFrame(loop);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const inside = mx >= 0 && mx <= rect.width && my >= 0 && my <= rect.height;
      if (inside) {
        mouseX = mx;
        mouseY = my;
        mouseInside = true;
      } else {
        mouseInside = false;
      }
    }

    function handleMouseLeaveDoc() {
      mouseInside = false;
    }

    resizeCanvas();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mouseleave', handleMouseLeaveDoc);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mouseleave', handleMouseLeaveDoc);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
