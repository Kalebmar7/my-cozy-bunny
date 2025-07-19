const bunny = document.getElementById("bunny");
const moodText = document.getElementById("mood");
const happinessFill = document.getElementById("happinessFill");
const coinCount = document.getElementById("coinCount");
const missionText = document.getElementById("missionText");
const missionProgress = document.getElementById("missionProgress");
const popup = document.getElementById("popup");

let happiness = parseInt(localStorage.getItem("happiness")) || 100;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let savedMission = localStorage.getItem("mission");
let mission = savedMission ? JSON.parse(savedMission) : generateMission();

if (!mission || !mission.type || !mission.description || !mission.count || !mission.reward) {
  mission = generateMission();
}

let missionCounter = parseInt(localStorage.getItem("missionCounter")) || 0;
let currentNeed = localStorage.getItem("currentNeed") || null;
let ignoredCount = 0;

const snackSound = document.getElementById("snackSound");
const happySound = document.getElementById("happySound");
const sadSound = document.getElementById("sadSound");
const backgroundMusic = document.getElementById("backgroundMusic");
backgroundMusic.volume = 0.3;
backgroundMusic.loop = true;
backgroundMusic.play().catch(() => {
  document.body.addEventListener("click", () => {
    backgroundMusic.play();
  });
});

let isPerformingAction = false; // Nuevo estado para controlar acción en progreso

coinCount.textContent = `Coins: ${coins}`;
missionText.textContent = `Misión: ${mission.description}`;
missionProgress.textContent = `Progreso: ${missionCounter}/${mission.count}`;

function saveGame() {
  localStorage.setItem("coins", coins);
  localStorage.setItem("mission", JSON.stringify(mission));
  localStorage.setItem("missionCounter", missionCounter);
  localStorage.setItem("happiness", happiness);
  localStorage.setItem("currentNeed", currentNeed);
}

function generateMission() {
  const missions = [
    { type: "feed", count: 3, description: "Dale de comer 3 veces 🍓", reward: 15 },
    { type: "cuddle", count: 4, description: "Hazle cariño 4 veces 🤗", reward: 20 },
    { type: "brush", count: 2, description: "Cepíllalo 2 veces 🧼", reward: 10 },
  ];
  return missions[Math.floor(Math.random() * missions.length)];
}

function updateHappiness(amount) {
  happiness = Math.min(100, Math.max(0, happiness + amount));
  happinessFill.style.width = `${happiness}%`;

  if (happiness === 0) {
    bunny.src = "images/bunny_fainted.png";
    moodText.textContent = "Mood: 😵 Desmayado";
    sadSound.play();
    currentNeed = null;
    saveGame();
    return;
  }

  // Si está realizando una acción, no cambiar imagen ni texto aquí
  if (isPerformingAction) {
    saveGame();
    return;
  }

  if (currentNeed !== null) {
    switch (currentNeed) {
      case "feed":
        moodText.textContent = "Mood: 🍽️ Tengo hambre";
        bunny.src = "images/bunny_hungry.png";
        break;
      case "cuddle":
        moodText.textContent = "Mood: 🥺 Me siento solo";
        bunny.src = "images/bunny_lonely.png";
        break;
      case "brush":
        moodText.textContent = "Mood: 💨 Estoy sucio";
        bunny.src = "images/bunny_messy.png";
        break;
    }
  } else {
    if (happiness >= 70) {
      moodText.textContent = "Mood: 💖 Feliz";
      bunny.src = "images/bunny_happy.gif";
    } else if (happiness >= 40) {
      moodText.textContent = "Mood: 🙂 Contento";
      bunny.src = "images/bunny_snuggle.png";
    } else if (happiness > 0) {
      moodText.textContent = "Mood: 😠 Frustrado";
      bunny.src = "images/bunny_angry.gif";
    }
  }

  saveGame();
}

function checkMission(actionType) {
  if (mission.type === actionType) {
    missionCounter++;
    if (missionCounter >= mission.count) {
      coins += mission.reward;
      coinCount.textContent = `Coins: ${coins}`;
      showPopup(`🎉 Misión completada! +${mission.reward} monedas`);
      mission = generateMission();
      missionCounter = 0;
    }
    missionText.textContent = `Misión: ${mission.description}`;
    missionProgress.textContent = `Progreso: ${missionCounter}/${mission.count}`;
    saveGame();
  }
}

function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2000);
}

function performAction(type, image, sound, moodMsg) {
  if (isPerformingAction) return; // Evitar que se superpongan acciones

  isPerformingAction = true;
  currentNeed = null;
  ignoredCount = 0;

  bunny.src = image;
  sound.play();
  moodText.textContent = moodMsg;

  updateHappiness(10);
  checkMission(type);
  showPopup(`✅ Bunny feels better after ${type}!`);

  setTimeout(() => {
    isPerformingAction = false;
    updateHappiness(0);
    saveGame();
  }, 3500);
}

document.getElementById("feedBtn").addEventListener("click", () => {
  performAction("feed", "images/bunny_snackie.png", snackSound, "Mood: 😋 Comiendo");
});
document.getElementById("cuddleBtn").addEventListener("click", () => {
  performAction("cuddle", "images/bunny_snuggle.png", happySound, "Mood: 🥰 Querido");
});
document.getElementById("brushBtn").addEventListener("click", () => {
  performAction("brush", "images/bunny_sparkle.png", happySound, "Mood: 💅 Arreglado");
});

// Fondo personalizado
function changeBackground(image, cost) {
  if (coins >= cost) {
    coins -= cost;
    coinCount.textContent = `Coins: ${coins}`;
    document.querySelector(".room").style.backgroundImage = `url('images/${image}')`;
    showPopup("✅ Fondo cambiado!");
    saveGame();
    localStorage.setItem("bgImage", image);
  } else {
    showPopup("❌ No tienes suficientes monedas!");
  }
}
document.getElementById("bg-cherry-btn").addEventListener("click", () => {
  changeBackground("bg_cherry.png", 25);
});
document.getElementById("bg-cottage-btn").addEventListener("click", () => {
  changeBackground("bg_cottage.png", 50);
});
document.getElementById("bg-cafe-btn").addEventListener("click", () => {
  changeBackground("bg_cafe.png", 100);
});

// Cargar fondo guardado al iniciar
const savedBg = localStorage.getItem("bgImage");
if (savedBg) {
  document.querySelector(".room").style.backgroundImage = `url('images/${savedBg}')`;
}

// Reducción de felicidad con el tiempo
setInterval(() => {
  if (happiness > 0 && !isPerformingAction) {
    updateHappiness(-1);
  }
}, 10000);

// Necesidad aleatoria y penalización, igual que antes (puedes agregar si quieres)

initGame();

function initGame() {
  updateHappiness(0);
  coinCount.textContent = `Coins: ${coins}`;
  missionText.textContent = `Misión: ${mission.description}`;
  missionProgress.textContent = `Progreso: ${missionCounter}/${mission.count}`;
  saveGame();
}
