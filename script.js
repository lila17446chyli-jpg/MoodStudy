/**
 * ==========================================
 * 1. CONFIGURACIÓN Y ESTADO DE LA APP (DATA)
 * ==========================================
 */
const CONFIG = {
  moods: {
    estresado: {
      title: "Momento de calmar la mente 🧘‍♂️",
      playlist: "https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP?si=ctuijTLaTZuNH9kpBjQA-g",
      studyTime: 15,
      breakTime: 5,
      tip: "Usa el método de Micropasos. Olvídate del proyecto completo, concéntrate solo en avanzar una pequeña tarea por 15 minutos. Haz tres respiraciones profundas antes de darle Start."
    },
    cansado: {
      title: "Poco a poco, sin presionar ☕",
      playlist: "https://open.spotify.com/playlist/6zCID88oNjNv9zx6puDHKj?si=cM6tZ5XmQCK5IYfADW8EUg",
      studyTime: 20,
      breakTime: 10,
      tip: "Aplica un Pomodoro Modificado: Estudia 20 minutos y descansa 10 (en lugar de los 5 habituales). Si sientes pestañeo, levántate por un vaso de agua o estírate durante el descanso."
    },
    motivado: {
      title: "¡A romperla! ⚡",
      playlist: "https://open.spotify.com/playlist/5uOyNWfMd7BX8d9D2x72OP?si=xn7rZCmdRduIo9x5XgpMKQ",
      studyTime: 50,
      breakTime: 10,
      tip: "Técnica de Bloques de Tiempo (Time Blocking). Tienes la energía al 100%, así que aprovecha este impulso para resolver la tarea más compleja o pesada de tu lista de hoy."
    },
    chill: {
      title: "Fluyendo a tu propio ritmo 🌊",
      playlist: "https://open.spotify.com/playlist/37i9dQZF1DXa9xHlDa5fc6?si=ZS_T5XsxRw6vR3xrwNxUjg",
      studyTime: 30,
      breakTime: 5,
      tip: "Técnica de Flujo Libre. Como estás en un estado mental tranquilo y sin presión, ponte una meta intermedia de 30 minutos. Estudia de forma orgánica, disfrutando el proceso de aprendizaje."
    }
  }
};

// Estado global de la aplicación
let appState = {
  currentMood: null,
  isDark: false,
  timer: {
    minutes: 0,
    seconds: 0,
    instance: null,
    isRunning: false,
    currentPhase: 'study' 
  }
};

/**
 * ==========================================
 * 2. MÓDULO DEL TEMPORIZADOR (LÓGICA)
 * ==========================================
 */
const TimerModule = {
  init(minutes) {
    this.stop();
    appState.timer.minutes = minutes;
    appState.timer.seconds = 0;
    appState.timer.currentPhase = 'study';
    this.updateDisplay();
  },

  toggle() {
    if (appState.timer.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    appState.timer.isRunning = true;
    UIController.elements.timerBtn.innerText = "Pausar";
    
    appState.timer.instance = setInterval(() => {
      if (appState.timer.seconds === 0) {
        if (appState.timer.minutes === 0) {
          this.handlePhaseEnd();
          return;
        }
        appState.timer.minutes--;
        appState.timer.seconds = 59;
      } else {
        appState.timer.seconds--;
      }
      this.updateDisplay();
    }, 1000);
  },

  stop() {
    clearInterval(appState.timer.instance);
    appState.timer.isRunning = false;
    UIController.elements.timerBtn.innerText = "Iniciar";
  },

  handlePhaseEnd() {
    this.stop();
    const moodData = CONFIG.moods[appState.currentMood];
    
    if (appState.timer.currentPhase === 'study') {
      alert("¡Bloque de estudio terminado! Es hora de descansar.");
      appState.timer.currentPhase = 'break';
      appState.timer.minutes = moodData.breakTime;
      UIController.elements.timerCardTitle.innerText = "⏱️ Tiempo de Descanso";
    } else {
      alert("¡El descanso terminó! ¿Listo para otra sesión?");
      appState.timer.currentPhase = 'study';
      appState.timer.minutes = moodData.studyTime;
      UIController.elements.timerCardTitle.innerText = "⏱️ Temporizador de Estudio";
    }
    
    this.updateDisplay();
  },

  updateDisplay() {
    const min = String(appState.timer.minutes).padStart(2, '0');
    const sec = String(appState.timer.seconds).padStart(2, '0');
    UIController.elements.timerDisplay.innerText = `${min}:${sec}`;
  }
};

/**
 * ==========================================
 * 3. CONTROLADOR DE INTERFAZ (UI & EVENTOS)
 * ==========================================
 */
const UIController = {
  elements: {
    appContainer: document.getElementById('app'),
    homeScreen: document.getElementById('home-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),
    dashboardTitle: document.getElementById('dashboard-title'),
    spotifyLink: document.getElementById('spotify-link'),
    timerDisplay: document.getElementById('timer-display'),
    timerBtn: document.getElementById('timer-control'),
    timerCardTitle: document.querySelector('#timer-card h3'),
    tipText: document.getElementById('tip-text'),
    moodButtons: document.querySelectorAll('.mood-btn'),
    backButton: document.getElementById('back-btn'),
    themeToggle: document.getElementById('theme-toggle')
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    this.elements.moodButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mood = e.currentTarget.getAttribute('data-mood');
        this.switchMood(mood);
      });
    });

    this.elements.backButton.addEventListener('click', () => this.resetToHome());
    this.elements.timerBtn.addEventListener('click', () => TimerModule.toggle());
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
  },

  switchMood(mood) {
    appState.currentMood = mood;
    const data = CONFIG.moods[mood];

    this.elements.appContainer.className = `mood-${mood} ${appState.isDark ? 'dark-mode' : 'light-mode'}`;

    this.elements.dashboardTitle.innerText = data.title;
    this.elements.spotifyLink.href = data.playlist;
    this.elements.tipText.innerText = data.tip;
    this.elements.timerCardTitle.innerText = "⏱️ Temporizador de Estudio";

    TimerModule.init(data.studyTime);

    this.elements.homeScreen.classList.add('hidden');
    this.elements.dashboardScreen.classList.remove('hidden');
  },

  resetToHome() {
    TimerModule.stop();
    appState.currentMood = null;
    
    this.elements.homeScreen.classList.remove('hidden');
    this.elements.dashboardScreen.classList.add('hidden');
    this.elements.appContainer.className = appState.isDark ? 'dark-mode' : 'light-mode';
  },

  toggleTheme() {
    appState.isDark = !appState.isDark;
    
    if (appState.currentMood) {
      this.elements.appContainer.className = `mood-${appState.currentMood} ${appState.isDark ? 'dark-mode' : 'light-mode'}`;
    } else {
      this.elements.appContainer.className = appState.isDark ? 'dark-mode' : 'light-mode';
    }
  }
};

// Arrancar la app
document.addEventListener('DOMContentLoaded', () => {
  UIController.init();
});