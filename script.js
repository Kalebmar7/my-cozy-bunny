const bunny = document.getElementById("bunny");
const moodText = document.getElementById("mood");
const happinessFill = document.getElementById("happinessFill");
const popup = document.getElementById("popup");
const coinDisplay = document.getElementById("coinCount");

const snackSound = document.getElementById("snackSound");
const happySound = document.getElementById("happySound");
const sadSound = document.getElementById("sadSound");

const missionText = document.getElementById("missionText");
const missionProgress = document.getElementById("missionProgress");

// Estados iniciales
let happiness = 100; // barra (0-100)
let coins = 0;
let currentNeed = null; // "feed", "brush", "cuddle" o null
let ignoredTimer = 0;

// Misiones disponibles
const missions = [
  { description: "Alimenta al conejo 3 veces", action: "feed", target: 3, progress: 0 },
  { description: "Cepíllalo 2 veces", action: "brush", target: 2, progress: 0 },
  { description: "Dale cariño 2 veces", action: "cuddle", target: 2, progress: 0 },
];

// Misión actual (empezamos con la primera)
let missionIndex = 0;

const bunnyMoods = {
  happy: "images/bunny_happy.gif",
  snackie: "images/bunny_snackie.png",
  sparkle: "images/bunny_sparkle.png",
  snuggle: "images/bunny_snuggle.png",
  hungry: "images/bunny_hungry.png",
  messy: "images/bunny_messy.png",
  lonely: "images/bunny_lonely.png",
  angry: "images/bunny_angry.gif",
  fainted: "images/bunny_fainted.png"
};

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

function safeSetImage(filename) {
  bunny.onerror = () => {
    bunny.src = bunnyMoods.happy;
  };
  bunny.src = filename;
}

function updateMoodBar() {
  happinessFill.style.width = `${happiness}%`;

  if (happiness === 0) {
    moodText.textContent = "Mood: 😵 Desmayado";
    safeSetImage(bunnyMoods.fainted);
    showPopup("¡Oh no! Tu conejo se ha desmayado...");
    return;
  }

  if (currentNeed !== null) {
    // Mostrar necesidad y emoción según necesidad actual
    switch (currentNeed) {
      case "feed":
        moodText.textContent = "Mood: 🍽️ Tengo hambre";
        safeSetImage(bunnyMoods.hungry);
        break;
      case "cuddle":
        moodText.textContent = "Mood: 🥺 Me siento solo";
        safeSetImage(bunnyMoods.lonely);
        break;
      case "brush":
        moodText.textContent = "Mood: 💨 Estoy sucio";
        safeSetImage(bunnyMoods.messy);
        break;
    }
  } else {
    // Sin necesidad activa, mostrar estado según felicidad
    if (happiness >= 70) {
      moodText.textContent = "Mood: 💖 Feliz";
      safeSetImage(bunnyMoods.happy);
    } else if (happiness >= 40) {
      moodText.textContent = "Mood: 🙂 Contento";
      safeSetImage(bunnyMoods.snuggle);
    } else if (happiness > 0) {
      moodText.textContent = "Mood: 😠 Frustrado";
      safeSetImage(bunnyMoods.angry);
    }
  }
}

function updateCoins() {
  coinDisplay.textContent = `Coins: ${coins}`;
}

function updateMissionUI() {
  if (missionIndex >= missions.length) {
    missionText.textContent = "🎉 ¡Todas las misiones completadas!";
    missionProgress.textContent = "";
    return;
  }

  const mission = missions[missionIndex];
  missionText.textContent = mission.description;
  missionProgress.textContent = `Progreso: ${mission.progress} / ${mission.target}`;
}

function checkMission(action) {
  if (missionIndex >= missions.length) return;

  const mission = missions[missionIndex];
  if (action === mission.action) {
    mission.progress++;
    updateMissionUI();

    if (mission.progress >= mission.target) {
      coins += 20; // recompensa
      showPopup(`🎉 ¡Misión "${mission.description}" cumplida! +20 monedas`);
      missionIndex++;
      // Reinicia misiones para que sean vueltas (loop)
      if (missionIndex >= missions.length) {
        missionIndex = 0;
        missions.forEach(m => m.progress = 0);
      }
      updateMissionUI();
      updateCoins();
    }
  }
}

function fulfillNeed(type) {
  switch (type) {
    case "feed":
      safeSetImage(bunnyMoods.snackie);
      moodText.textContent = "Mood: Yum! 🍓";
      playSound(snackSound);
      break;
    case "cuddle":
      safeSetImage(bunnyMoods.snuggle);
      moodText.textContent = "Mood: Loved 💕";
      playSound(happySound);
      break;
    case "brush":
      safeSetImage(bunnyMoods.sparkle);
      moodText.textContent = "Mood: Sparkly Clean ✨";
      playSound(happySound);
      break;
  }

  bunny.classList.add("bounce");
  setTimeout(() => bunny.classList.remove("bounce"), 500);
  showPopup(`✅ Bunny feels better after ${type}!`);
  currentNeed = null;
  ignoredTimer = 0;
  happiness = Math.min(100, happiness + 20);
  updateCoins();
  checkMission(type);

  // Esperar 2 segundos antes de actualizar la barra y estado normal
  setTimeout(() => {
    updateMoodBar();
  }, 2000);
}

// Pérdida gradual de felicidad
setInterval(() => {
  if (happiness > 0) {
    happiness -= 2;
    updateMoodBar();
  }
}, 15000);

// Generar necesidad aleatoria solo si no hay una activa
setInterval(() => {
  if (currentNeed === null && Math.random() < 0.3) { // 30% chance cada 30s
    const needs = ["feed", "cuddle", "brush"];
    currentNeed = needs[Math.floor(Math.random() * needs.length)];

    switch (currentNeed) {
      case "feed":
        safeSetImage(bunnyMoods.hungry);
        moodText.textContent = "Mood: 🍽️ Hungry";
        showPopup("🍽️ Bunny is hungry!");
        break;
      case "cuddle":
        safeSetImage(bunnyMoods.lonely);
        moodText.textContent = "Mood: 🥺 Lonely";
        showPopup("🥺 Bunny feels lonely...");
        break;
      case "brush":
        safeSetImage(bunnyMoods.messy);
        moodText.textContent = "Mood: 💨 Scruffy";
        showPopup("💨 Bunny feels scruffy. Brush me?");
        break;
    }
    happiness = Math.max(0, happiness - 10);
    updateMoodBar();
  }
}, 30000);

// Penalización si ignoran la necesidad
setInterval(() => {
  if (currentNeed !== null) {
    ignoredTimer++;
    if (ignoredTimer >= 3) {
      safeSetImage(bunnyMoods.angry);
      moodText.textContent = "Mood: 😠 Frustrado";
      showPopup("😠 Bunny is upset... you’re ignoring me!");
      happiness = Math.max(0, happiness - 15);
      updateMoodBar();
      ignoredTimer = 0;
      currentNeed = null;
    }
  }
}, 30000);

// Botones para acciones
document.getElementById("feedBtn").addEventListener("click", () => fulfillNeed("feed"));
document.getElementById("cuddleBtn").addEventListener("click", () => fulfillNeed("cuddle"));
document.getElementById("brushBtn").addEventListener("click", () => fulfillNeed("brush"));

// Función para cambiar fondo y guardar selección
function changeBackground(themeClass) {
  const room = document.querySelector(".room");
  room.classList.remove("bg-cherry", "bg-cottage", "bg-cafe");
  room.classList.add(themeClass);
  localStorage.setItem("bunnyBackground", themeClass);
}

// Cargar fondo guardado al inicio
const savedTheme = localStorage.getItem("bunnyBackground");
if(savedTheme){
  changeBackground(savedTheme);
} else {
  // Si no hay fondo guardado, dejamos el fondo pastel original (sin clase extra)
  const room = document.querySelector(".room");
  room.classList.remove("bg-cherry", "bg-cottage", "bg-cafe");
}

// Botones para fondos con costo
document.getElementById("bg-cherry-btn").addEventListener("click", () => {
  if(coins >= 25){
    coins -= 25;
    updateCoins();
    changeBackground("bg-cherry");
    showPopup("🌸 Cherry Blossom theme applied!");
  } else {
    showPopup("❌ No tienes suficientes monedas para este fondo.");
  }
});

document.getElementById("bg-cottage-btn").addEventListener("click", () => {
  if(coins >= 50){
    coins -= 50;
    updateCoins();
    changeBackground("bg-cottage");
    showPopup("🧺 Bunny Cottage theme applied!");
  } else {
    showPopup("❌ No tienes suficientes monedas para este fondo.");
  }
});

document.getElementById("bg-cafe-btn").addEventListener("click", () => {
  if(coins >= 100){
    coins -= 100;
    updateCoins();
    changeBackground("bg-cafe");
    showPopup("🍰 Cozy Café theme applied!");
  } else {
    showPopup("❌ No tienes suficientes monedas para este fondo.");
  }
});

const backgroundMusic = document.getElementById("backgroundMusic");

function playBackgroundMusic() {
  backgroundMusic.play().catch(() => {
    console.log("Reproducción automática bloqueada, esperando interacción.");
  });
}

document.body.addEventListener("click", playBackgroundMusic, { once: true });
document.body.addEventListener("touchstart", playBackgroundMusic, { once: true });

// Inicializar UI
updateMoodBar();
updateCoins();
updateMissionUI();
