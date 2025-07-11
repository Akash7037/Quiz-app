// ✅ Firebase Config + SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNH6nI4GuixGJ5RMZQSe1ukqo2jsCGU_c",
  authDomain: "quiz-battle-duo.firebaseapp.com",
  databaseURL: "https://quiz-battle-duo-default-rtdb.firebaseio.com",
  projectId: "quiz-battle-duo",
  storageBucket: "quiz-battle-duo.firebasestorage.app",
  messagingSenderId: "829046874067",
  appId: "1:829046874067:web:b70ed6ca8efcfc862d1926"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔢 Generate 6-digit room code
function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let playerRole = ""; // "player1" or "player2"
let roomCode = "";

// ✅ Create Room
window.createRoom = function () {
  roomCode = generateRoomCode();
  playerRole = "player1";

  const roomRef = ref(db, "rooms/" + roomCode);
  set(roomRef, {
    player1: { hp: 100 },
    player2: { hp: 100 },
    questionIndex: 0,
    currentQuestion: "",
    state: "waiting"
  });

  document.getElementById("playerStatus").textContent = "You are: Player 1 (Room: " + roomCode + ")";
  document.getElementById("room-section").style.display = "none";
  document.getElementById("game").style.display = "block";

  console.log("Room created: " + roomCode);
};

// ✅ Join Room
window.joinRoom = function () {
  roomCode = document.getElementById("roomCodeInput").value.trim();
  if (!roomCode || roomCode.length !== 6) {
    alert("Enter a valid 6-digit room code");
    return;
  }

  playerRole = "player2";
  const roomRef = ref(db, "rooms/" + roomCode + "/player2");

  update(roomRef, { hp: 100 }).then(() => {
    document.getElementById("playerStatus").textContent = "You are: Player 2 (Room: " + roomCode + ")";
    document.getElementById("room-section").style.display = "none";
    document.getElementById("game").style.display = "block";

    console.log("Joined Room: " + roomCode);
  });
};
