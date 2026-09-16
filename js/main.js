/**
 * MAIN.JS - Lógica de Inicio (El Regalo Escurridizo) & Partículas Atmosféricas
 * Especificación SDD: Web Interactiva "Sorpresa de Cumpleaños"
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initGiftBoxStage();
});

/* ==========================================================================
   1. Partículas de Fondo (Corazones, Pétalos y Destellos)
   ========================================================================== */
let bgCanvas, ctx;
let particles = [];
const PARTICLE_COUNT = 36;

function initBackgroundCanvas() {
  bgCanvas = document.getElementById('bg-canvas');
  if (!bgCanvas) return;
  ctx = bgCanvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Crear partículas iniciales
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle(true));
  }

  requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
  if (!bgCanvas) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function createParticle(randomY = false) {
  const types = ['heart', 'petal', 'star'];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    type,
    x: Math.random() * (bgCanvas ? bgCanvas.width : window.innerWidth),
    y: randomY ? Math.random() * (bgCanvas ? bgCanvas.height : window.innerHeight) : (bgCanvas ? bgCanvas.height + 20 : 800),
    size: Math.random() * 12 + 8,
    speedY: -(Math.random() * 0.7 + 0.3),
    speedX: (Math.random() - 0.5) * 0.6,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    opacity: Math.random() * 0.18 + 0.08, // Opacidad baja 15-25% según SDD
    color: Math.random() > 0.4 ? '#f472b6' : '#fda4af'
  };
}

function animateParticles() {
  if (!ctx || !bgCanvas) return;
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.y * 0.005) * 0.3;
    p.rotation += p.rotSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    if (p.type === 'heart') {
      drawHeart(ctx, 0, 0, p.size, p.color);
    } else if (p.type === 'petal') {
      drawPetal(ctx, 0, 0, p.size, p.color);
    } else {
      drawStar(ctx, 0, 0, p.size * 0.7, '#fef08a');
    }

    ctx.restore();

    // Reciclar si sale de la pantalla
    if (p.y < -30 || p.x < -30 || p.x > bgCanvas.width + 30) {
      particles[i] = createParticle(false);
    }
  }

  requestAnimationFrame(animateParticles);
}

function drawHeart(c, x, y, size, color) {
  c.fillStyle = color;
  c.beginPath();
  const topCurveHeight = size * 0.3;
  c.moveTo(x, y + topCurveHeight);
  // Curva izquierda
  c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  // Base izquierda
  c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
  // Base derecha
  c.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  // Curva derecha
  c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  c.closePath();
  c.fill();
}

function drawPetal(c, x, y, size, color) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, size * 0.4, size * 0.8, Math.PI / 4, 0, Math.PI * 2);
  c.fill();
}

function drawStar(c, cx, cy, spikesRadius, color) {
  const spikes = 4;
  const outerRadius = spikesRadius;
  const innerRadius = spikesRadius * 0.35;
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  c.fillStyle = color;
  c.beginPath();
  c.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    c.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    c.lineTo(x, y);
    rot += step;
  }
  c.lineTo(cx, cy - outerRadius);
  c.closePath();
  c.fill();
}

/* ==========================================================================
   2. Fase 1: El Regalo Escurridizo
   ========================================================================== */
function initGiftBoxStage() {
  const introStage = document.getElementById('intro-stage');
  const dashboardStage = document.getElementById('dashboard-stage');
  const giftContainer = document.getElementById('gift-container');
  const giftSubtitle = document.getElementById('gift-subtitle');

  if (!giftContainer || !introStage) return;

  let attemptCount = 0;
  let isTransitioning = false;

  const escapeMessages = [
    "¡Intenta abrir tu sorpresa! Haz clic en la cajita...",
    "¡Uy, casi! ¿Muy lent@? ¡Intenta otra vez! 🏃💨",
    "¡Es más rápido de lo que parece! Un intento más... 🎁✨",
    "¡Lo tienes acorralado! Haz clic ahora para abrir tu sorpresa 💖"
  ];

  // Función para mover el regalo dentro de límites seguros de la pantalla
  function escapeGift() {
    if (attemptCount >= 2) return; // Al 3er intento se queda quieto

    attemptCount++;
    giftSubtitle.textContent = escapeMessages[attemptCount];

    // Dimensiones del contenedor y de la ventana
    const giftRect = giftContainer.getBoundingClientRect();
    const boxW = giftRect.width || 140;
    const boxH = giftRect.height || 140;
    
    // Rango de desplazamiento seguro
    const maxOffset = Math.min(window.innerWidth * 0.28, 160);
    
    // Calcular coordenadas aleatorias evitando quedar en el centro
    const angle = Math.random() * Math.PI * 2;
    const distance = (Math.random() * 0.5 + 0.5) * maxOffset;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    giftContainer.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

    // Si ya alcanzó el 2do escape, el 3er intento se queda quieto
    if (attemptCount === 2) {
      setTimeout(() => {
        giftContainer.classList.add('ready-to-open');
        giftSubtitle.textContent = escapeMessages[3];
      }, 400);
    }
  }

  // Interacción con mouse / hover
  giftContainer.addEventListener('mouseenter', () => {
    if (attemptCount < 2) {
      escapeGift();
    }
  });

  // Interacción táctil en móviles
  giftContainer.addEventListener('touchstart', (e) => {
    if (attemptCount < 2) {
      e.preventDefault();
      escapeGift();
    }
  }, { passive: false });

  // Intento de clic
  giftContainer.addEventListener('click', () => {
    if (attemptCount < 2) {
      escapeGift();
      return;
    }

    if (isTransitioning) return;
    isTransitioning = true;

    // Intento 3: Apertura
    openGiftAnimation();
  });

  function openGiftAnimation() {
    // Animación de tapa volando
    const lid = giftContainer.querySelector('.gift-lid');
    if (lid) {
      lid.style.animation = 'giftOpenLid 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }

    // Disparar explosión de confeti y corazones
    const rect = giftContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerConfettiExplosion(centerX, centerY);

    // Sonido sutil si el sintetizador está listo
    if (window.AudioEngine && window.AudioEngine.playCelebrationSound) {
      window.AudioEngine.playCelebrationSound();
    }

    // Transición suave hacia Fase 2
    setTimeout(() => {
      introStage.classList.add('stage-hidden');
      dashboardStage.classList.add('stage-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Iniciar el viaje de la carta de Lima a Huánuco si está listo
      if (window.initTravelPath) {
        window.initTravelPath();
      }
    }, 900);
  }
}

/* ==========================================================================
   3. Sistema de Confeti y Corazones para la Explosión
   ========================================================================== */
function triggerConfettiExplosion(startX, startY) {
  const count = 70;
  const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fde047', '#d4af37', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle-particle';
    const isHeart = Math.random() > 0.6;
    el.textContent = isHeart ? '♥' : (Math.random() > 0.5 ? '✦' : '★');
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.fontSize = `${Math.random() * 16 + 12}px`;
    el.style.opacity = '1';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 220 + 80;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 40; // Leve impulso hacia arriba

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.animation = `sparkleBurst ${Math.random() * 0.6 + 0.8}s cubic-bezier(0.16, 1, 0.3, 1) forwards`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}
