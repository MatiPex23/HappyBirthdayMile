/**
 * PLAYER.JS - Reproductor de Vinilo Romántico
 * Manejo de tocadiscos, rotación de vinilo, brazo fonocaptor, notas flotantes
 * y reproducción de audio dual (HTML5 Audio + Web Audio API Synth Fallback).
 */

const PLAYLIST = [
  {
    id: 1,
    title: "Canción Nuestra",
    subtitle: "Canon de Nuestro Amor",
    cover: "assets/images/covers/cover1.svg",
    src: "assets/audio/song1.mp3",
    synthNotes: [293.66, 369.99, 440.00, 587.33, 220.00, 277.18, 329.63, 440.00]
  },
  {
    id: 2,
    title: "Noche en la Distancia",
    subtitle: "Vals Lima - Huánuco",
    cover: "assets/images/covers/cover2.svg",
    src: "assets/audio/song2.mp3",
    synthNotes: [261.63, 329.63, 392.00, 523.25, 220.00, 261.63, 329.63, 440.00]
  },
  {
    id: 3,
    title: "Orgullo y Prejuicio",
    subtitle: "Sonata Romántica Regency",
    cover: "assets/images/covers/cover3.svg",
    src: "assets/audio/song3.mp3",
    synthNotes: [349.23, 440.00, 523.25, 698.46, 329.63, 392.00, 493.88, 659.25]
  }
];

class VinylPlayer {
  constructor() {
    this.currentIndex = 0;
    this.isPlaying = false;
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioContext = null;
    this.synthInterval = null;
    this.noteEmitterInterval = null;

    // DOM Elements
    this.disc = document.getElementById('vinyl-disc');
    this.tonearm = document.getElementById('turntable-arm');
    this.centerCover = document.getElementById('vinyl-center-img');
    this.notesContainer = document.getElementById('floating-notes-box');
    this.btnPlay = document.getElementById('btn-play-toggle');
    this.btnPrev = document.getElementById('btn-prev-track');
    this.btnNext = document.getElementById('btn-next-track');
    this.progressBar = document.getElementById('progress-bar-fill');
    this.progressContainer = document.getElementById('progress-bar-wrap');
    this.currentTimeEl = document.getElementById('player-time-current');
    this.totalTimeEl = document.getElementById('player-time-total');
    this.volumeSlider = document.getElementById('volume-slider');
    this.trackItems = document.querySelectorAll('.track-item');

    this.init();
  }

  init() {
    this.loadTrack(0);
    this.bindEvents();
  }

  bindEvents() {
    if (this.btnPlay) {
      this.btnPlay.addEventListener('click', () => this.togglePlay());
    }

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => this.prevTrack());
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.nextTrack());
    }

    // Clic en la playlist
    this.trackItems.forEach((item, idx) => {
      item.addEventListener('click', () => {
        if (this.currentIndex === idx) {
          this.togglePlay();
        } else {
          this.loadTrack(idx);
          this.play();
        }
      });
    });

    // Barra de progreso y tiempo
    this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
    this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audioElement.addEventListener('ended', () => this.nextTrack());

    // Clic en barra de progreso para buscar (seek)
    if (this.progressContainer) {
      this.progressContainer.addEventListener('click', (e) => {
        const rect = this.progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (this.audioElement.duration) {
          this.audioElement.currentTime = (clickX / width) * this.audioElement.duration;
        }
      });
    }

    // Volumen
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        this.audioElement.volume = parseFloat(e.target.value);
      });
    }

    // Fallback si el archivo de audio falla
    this.audioElement.addEventListener('error', () => {
      console.warn('Audio local no disponible o bloqueado; activando sintetizador Web Audio API de respaldo.');
      this.startSynthPlayback();
    });
  }

  loadTrack(index) {
    this.currentIndex = index;
    const track = PLAYLIST[index];

    // Actualizar carátula del centro del vinilo
    if (this.centerCover) {
      this.centerCover.src = track.cover;
    }

    // Actualizar estados visuales de la lista
    this.trackItems.forEach((item, idx) => {
      const badge = item.querySelector('.track-play-badge');
      if (idx === index) {
        item.classList.add('is-active');
        if (badge) badge.textContent = this.isPlaying ? '❚❚' : '▶';
      } else {
        item.classList.remove('is-active');
        if (badge) badge.textContent = '▶';
      }
    });

    // Cargar fuente de audio
    this.audioElement.src = track.src;
    this.audioElement.load();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying = true;
    
    // Animar tocadiscos: girar vinilo y posar brazo
    if (this.disc) this.disc.classList.add('is-spinning');
    if (this.tonearm) this.tonearm.classList.add('arm-playing');
    if (this.btnPlay) this.btnPlay.textContent = '❚❚';

    // Iniciar emisión de notas musicales flotantes
    this.startNoteEmitter();

    // Actualizar indicador de la playlist
    const activeItem = document.querySelector('.track-item.is-active .track-play-badge');
    if (activeItem) activeItem.textContent = '❚❚';

    // Intentar reproducir el elemento de audio HTML5
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay bloqueado o archivo no decodificado; reproduciendo con Web Audio API.');
        this.startSynthPlayback();
      });
    }
  }

  pause() {
    this.isPlaying = false;

    // Detener giro y retirar brazo
    if (this.disc) this.disc.classList.remove('is-spinning');
    if (this.tonearm) this.tonearm.classList.remove('arm-playing');
    if (this.btnPlay) this.btnPlay.textContent = '▶';

    this.stopNoteEmitter();
    this.stopSynthPlayback();

    const activeItem = document.querySelector('.track-item.is-active .track-play-badge');
    if (activeItem) activeItem.textContent = '▶';

    this.audioElement.pause();
  }

  prevTrack() {
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) newIndex = PLAYLIST.length - 1;
    this.loadTrack(newIndex);
    if (this.isPlaying) this.play();
  }

  nextTrack() {
    let newIndex = (this.currentIndex + 1) % PLAYLIST.length;
    this.loadTrack(newIndex);
    if (this.isPlaying) this.play();
  }

  updateProgress() {
    if (!this.audioElement.duration) return;
    const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
    if (this.progressBar) this.progressBar.style.width = `${progress}%`;
    if (this.currentTimeEl) this.currentTimeEl.textContent = this.formatTime(this.audioElement.currentTime);
  }

  updateDuration() {
    if (this.totalTimeEl && this.audioElement.duration) {
      this.totalTimeEl.textContent = this.formatTime(this.audioElement.duration);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // =========================================================================
  // Emisor de Notas Musicales Flotantes
  // =========================================================================
  startNoteEmitter() {
    this.stopNoteEmitter();
    const symbols = ['♪', '♫', '♩', '♬', '♥', '✦'];

    this.noteEmitterInterval = setInterval(() => {
      if (!this.isPlaying || !this.notesContainer) return;

      const note = document.createElement('span');
      note.className = 'floating-note';
      note.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      // Dispersión suave
      const offsetX = (Math.random() - 0.5) * 70;
      const rot = (Math.random() - 0.5) * 45;
      note.style.setProperty('--note-x', `${offsetX}px`);
      note.style.setProperty('--note-rot', `${rot}deg`);
      note.style.color = Math.random() > 0.4 ? '#f472b6' : '#fef08a';

      this.notesContainer.appendChild(note);
      setTimeout(() => note.remove(), 2500);
    }, 450);
  }

  stopNoteEmitter() {
    if (this.noteEmitterInterval) {
      clearInterval(this.noteEmitterInterval);
      this.noteEmitterInterval = null;
    }
  }

  // =========================================================================
  // Sintetizador Web Audio API de Respaldo (Sonata Romántica / Caja de Música)
  // =========================================================================
  startSynthPlayback() {
    this.stopSynthPlayback();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!this.audioContext) this.audioContext = new AudioCtx();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const track = PLAYLIST[this.currentIndex];
    const notes = track.synthNotes || [293.66, 369.99, 440.00, 587.33];
    let noteIdx = 0;

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const freq = notes[noteIdx % notes.length];
      this.playSynthChime(freq);
      noteIdx++;
    }, 480);
  }

  stopSynthPlayback() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  playSynthChime(frequency) {
    if (!this.audioContext) return;
    try {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Envolvente de caja de música suave
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {
      // Ignorar errores menores de audio context
    }
  }
}

// Inicializar reproductor al cargar
let playerInstance;
document.addEventListener('DOMContentLoaded', () => {
  playerInstance = new VinylPlayer();
});

// Exportar helper para sonidos cute
window.AudioEngine = {
  playPopSound: () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  },

  playCelebrationSound: () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }
};
