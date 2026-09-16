/**
 * LETTERS.JS - Cartas con Sello de Lacre, Mapa Lima-Huánuco, Easter Eggs y Citas
 * Especificación SDD: Web Interactiva "Sorpresa de Cumpleaños"
 */

/* ==========================================================================
   1. Base de Datos de Cartas (Fácilmente Editable)
   ========================================================================== */
const LETTERS_DATA = {
  carta1: {
    title: "Hoy 16 de Setiembre",
    date: "Con todo mi amor",
    body: `
      <p>Mile, sé muy bien que no soy un gran escritor o algo parecido, pero quiero dedicarte todo lo que siento. Es algo sincero que sale de mi corazón.</p>
      <p>Lo primero es desearte un feliz cumpleaños; sinceramente nunca supe qué tanto te agrada celebrarlo, pero para mí es una fecha muy importante y te deseo lo mejor, pequeña.</p>
      <p>Tantos años conociéndote me hacen desear que pases lo mejor en este día tan especial. Sé que nuestra interacción últimamente ha sido muy poca, pero créeme que esa no es excusa para quererte cada día de mi vida.</p>
      <p>Sé que el futuro es muy incierto, pero me alegra de todo corazón que te hayas presentado una vez más en mi vida. Pienso mantener mi compromiso de quedarme, sin importar la dificultad que pases, porque sé que tú lo vales, de verdad. Te quiero mucho, y espero que sientas mi cercanía a pesar de la distancia, porque lo que más deseo en el mundo es estar cerca de ti.</p>
    `,
    signature: "Te adoro, Mile♥"
  },
  carta2: {
    title: "Con sinceridad :3",
    date: "Eternamente en mi corazón",
    body: `
      <p>La distancia no borra lo que guarda el alma. Mile, te quiero, y siento que hago esta segunda carta para decirte que te entiendo. Sé que hay días que te pueden pesar mucho y siempre voy a validar tu necesidad de distanciarte.</p>
      <p>Te extraño, pero eso no quita que reconozca y respete tu espacio. Espero que hoy te sientas muy en paz y tranquila contigo misma.No te sientas obligada a estar al 100% ni te presiones por mí.</p>
      <p>Ve a tu propio ritmo y ten mucha calma en tu proceso.</p>
      <pYo voy a seguir aquí, acompañándote en silencio cuando necesites tu espacio, y listo para estar contigo cuando tengas ganas de hablar. Tómate este cumpleaños solo para ti, para descansar y respirar. Te adoro."</p>
    `,
    signature: "Por siempre y para siempre ♥"
  }
};

/* ==========================================================================
   2. Citas de Orgullo y Prejuicio (Jane Austen)
   ========================================================================== */
const PRIDE_PREJUDICE_QUOTES = [
  {
    quote: "Ha hechizado usted mi cuerpo y mi alma, y la amo... la amo, la amo. Y nunca más quisiera separarme de usted.",
    author: " ILoeYou<3"
  },
  {
    quote: "En vano he luchado. No quiero hacerlo más. Mis sentimientos no pueden contenerse. Debe usted permitirme que le diga cuán ardientemente la admiro y la amo.",
    author: " ILoeYou<3"
  },
  {
    quote: "Mis afectos y deseos no han cambiado, pero una sola palabra suya me silenciará para siempre.",
    author: " ILoeYou<3"
  },
  {
    quote: "La distancia es una nada cuando uno tiene un motivo tan grande.",
    author: " ILoeYou<3"
  },
  {
    quote: "Usted me enseñó una lección: mediante usted aprendí a ser mejor, a valorar cada instante y a entregarlo todo.",
    author: " ILoeYou<3"
  },
  {
    quote: "Hasta este momento, nunca me había conocido a mí mismo... hasta que descubrí lo que significaba amarte.",
    author: " ILoeYou<3"
  }
];

/* ==========================================================================
   3. Inicialización de Componentes
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initWaxSealLetters();
  initTravelRoute();
  initCuteEasterEggs();
  initQuoteGenerator();
});

/* ==========================================================================
   4. Lógica de Cartas con Sello de Lacre & Modal de Papiro
   ========================================================================== */
function initWaxSealLetters() {
  const envelopes = document.querySelectorAll('.envelope-item');
  const modal = document.getElementById('papyrus-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const papyrusTitle = document.getElementById('papyrus-letter-title');
  const papyrusDate = document.getElementById('papyrus-letter-date');
  const papyrusBody = document.getElementById('papyrus-letter-body');
  const papyrusSig = document.getElementById('papyrus-letter-sig');

  if (!modal) return;

  envelopes.forEach(envelope => {
    envelope.addEventListener('click', () => {
      const letterKey = envelope.getAttribute('data-letter');
      const letterData = LETTERS_DATA[letterKey];
      if (!letterData) return;

      // Romper lacre visualmente
      envelope.classList.add('is-opened');

      // Sonido cute al romper lacre
      if (window.AudioEngine && window.AudioEngine.playPopSound) {
        window.AudioEngine.playPopSound();
      }

      // Cargar datos en el pergamino
      if (papyrusTitle) papyrusTitle.textContent = letterData.title;
      if (papyrusDate) papyrusDate.textContent = letterData.date;
      if (papyrusBody) papyrusBody.innerHTML = letterData.body;
      if (papyrusSig) papyrusSig.textContent = letterData.signature;

      // Abrir modal con retraso sutil para apreciar la rotura del sello
      setTimeout(() => {
        modal.classList.add('is-active');
        const scrollContainer = modal.querySelector('.papyrus-scroll-container');
        if (scrollContainer) scrollContainer.scrollTop = 0;
      }, 350);
    });
  });

  // Cerrar modal
  function closeModal() {
    modal.classList.remove('is-active');
  }

  if (modalClose) {
    modalClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. Lógica de la Ruta Animada Lima a Huánuco
   ========================================================================== */
function initTravelRoute() {
  window.initTravelPath = updateTravelPath;
  window.addEventListener('resize', updateTravelPath);
  updateTravelPath();
}

function updateTravelPath() {
  const container = document.getElementById('travel-map-box');
  const pathEl = document.getElementById('travel-route-path');
  const letterEl = document.getElementById('traveling-letter-icon');
  const limaNode = document.getElementById('node-lima');
  const huanucoNode = document.getElementById('node-huanuco');

  if (!container || !pathEl || !letterEl || !limaNode || !huanucoNode) return;

  const containerRect = container.getBoundingClientRect();
  const limaRect = limaNode.getBoundingClientRect();
  const huanucoRect = huanucoNode.getBoundingClientRect();

  // Coordenadas relativas al contenedor
  const startX = (limaRect.left - containerRect.left) + limaRect.width / 2;
  const startY = (limaRect.top - containerRect.top) + 35;

  const endX = (huanucoRect.left - containerRect.left) + huanucoRect.width / 2;
  const endY = (huanucoRect.top - containerRect.top) + 35;

  // Punto de control para curva romántica hacia arriba
  const midX = (startX + endX) / 2;
  const midY = Math.max(15, Math.min(startY, endY) - 55);

  const pathData = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
  pathEl.setAttribute('d', pathData);

  // Asignar offset-path dinámico al sobre que viaja
  letterEl.style.offsetPath = `path("${pathData}")`;
  letterEl.style.webkitOffsetPath = `path("${pathData}")`;
}

/* ==========================================================================
   6. Micro-interacciones: Chocolataditas Cute & Ositos
   ========================================================================== */
function initCuteEasterEggs() {
  const chocos = document.querySelectorAll('.chocolatada-egg');
  const teddies = document.querySelectorAll('.teddy-egg');
  const popAudio = document.getElementById('audio-pop-effect');

  const cuteMessages = [
    "¡Un sorbo de amor puro! 🍫💖",
    "¡Ñam, chocolatadita para recargar ternura! ✨",
    "¡Te adoro más que a los postres! 🧸",
    "¡Choco-abrazo a la distancia! 💌",
    "¡Dulzura al 100%! 🍯"
  ];

  chocos.forEach(choco => {
    choco.addEventListener('click', (e) => {
      // 1. Sonido pop adorable
      if (popAudio) {
        popAudio.currentTime = 0;
        popAudio.play().catch(() => {
          if (window.AudioEngine) window.AudioEngine.playPopSound();
        });
      } else if (window.AudioEngine) {
        window.AudioEngine.playPopSound();
      }

      // 2. Animación de rebote
      const icon = choco.querySelector('.egg-icon') || choco;
      icon.classList.remove('is-popping');
      void icon.offsetWidth; // Trigger reflow
      icon.classList.add('is-popping');

      // 3. Destellos estrellados desde el centro del clic
      const rect = choco.getBoundingClientRect();
      createSparkleShower(rect.left + rect.width / 2, rect.top + rect.height / 2);

      // 4. Mensaje flotante tipo tooltip
      const msg = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
      showCuteFloatingToast(rect.left + rect.width / 2, rect.top - 10, msg);
    });
  });

  teddies.forEach(teddy => {
    teddy.addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.playPopSound();
      const icon = teddy.querySelector('.egg-icon') || teddy;
      icon.classList.remove('is-popping');
      void icon.offsetWidth;
      icon.classList.add('is-popping');

      const rect = teddy.getBoundingClientRect();
      createSparkleShower(rect.left + rect.width / 2, rect.top + rect.height / 2, '#fb7185');
      showCuteFloatingToast(rect.left + rect.width / 2, rect.top - 10, "¡Abrazo de oso cumpleañero! 🧸💕");
    });
  });
}

function createSparkleShower(x, y, baseColor) {
  const count = 14;
  const symbols = ['★', '✦', '♥', '✨'];
  const colors = baseColor ? [baseColor, '#ffffff', '#fde047'] : ['#f472b6', '#fde047', '#38bdf8', '#ffffff'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'sparkle-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = colors[Math.floor(Math.random() * colors.length)];
    el.style.fontSize = `${Math.random() * 14 + 10}px`;

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 80 + 30;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 25;

    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.animation = 'sparkleBurst 0.7s ease-out forwards';

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }
}

function showCuteFloatingToast(x, y, text) {
  const toast = document.createElement('div');
  toast.className = 'cute-bubble-toast';
  toast.textContent = text;
  toast.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    transform: translate(-50%, -100%);
    background: rgba(22, 14, 28, 0.9);
    border: 1px solid rgba(244, 114, 182, 0.4);
    color: #fff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    z-index: 9999;
    pointer-events: none;
    animation: toastSlideUp 0.3s ease, gentleFloat 1.2s ease-in-out infinite;
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -130%)';
    setTimeout(() => toast.remove(), 450);
  }, 2200);
}

/* ==========================================================================
   7. Generador de Frases (Orgullo y Prejuicio)
   ========================================================================= */
function initQuoteGenerator() {
  const fabBtn = document.getElementById('fab-quote-btn');
  const quoteToast = document.getElementById('quote-toast');
  const toastClose = document.getElementById('toast-quote-close');
  const quoteText = document.getElementById('toast-quote-text');
  const quoteAuthor = document.getElementById('toast-quote-author');
  const btnNextQuote = document.getElementById('btn-next-quote');

  if (!fabBtn || !quoteToast) return;

  let currentQuoteIdx = -1;

  function renderRandomQuote() {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * PRIDE_PREJUDICE_QUOTES.length);
    } while (nextIdx === currentQuoteIdx && PRIDE_PREJUDICE_QUOTES.length > 1);

    currentQuoteIdx = nextIdx;
    const item = PRIDE_PREJUDICE_QUOTES[currentQuoteIdx];

    if (quoteText) quoteText.textContent = `"${item.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = `— ${item.author}`;
  }

  fabBtn.addEventListener('click', () => {
    const isVisible = quoteToast.classList.contains('is-visible');
    if (isVisible) {
      quoteToast.classList.remove('is-visible');
    } else {
      renderRandomQuote();
      quoteToast.classList.add('is-visible');
      if (window.AudioEngine) window.AudioEngine.playPopSound();
    }
  });

  if (toastClose) {
    toastClose.addEventListener('click', () => {
      quoteToast.classList.remove('is-visible');
    });
  }

  if (btnNextQuote) {
    btnNextQuote.addEventListener('click', () => {
      renderRandomQuote();
      if (window.AudioEngine) window.AudioEngine.playPopSound();
    });
  }
}
