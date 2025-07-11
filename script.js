import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getDatabase, ref, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNH6nI4GuixGJ5RMZQSe1ukqo2jsCGU_c",
  authDomain: "quiz-battle-duo.firebaseapp.com",
  databaseURL: "https://quiz-battle-duo-default-rtdb.firebaseio.com",
  projectId: "quiz-battle-duo",
  storageBucket: "quiz-battle-duo.appspot.com",
  messagingSenderId: "829046874067",
  appId: "1:829046874067:web:b70ed6ca8efcfc862d1926"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let playerRole="", roomCode="", yourHP=100, enemyHP=100;

function genRoom() {
  return Math.floor(100000+Math.random()*900000).toString();
}

// Create room
window.createRoom = () => {
  roomCode = genRoom();
  playerRole="player1";
  const diff = document.getElementById('difficulty').value;
  set(ref(db, 'rooms/'+roomCode), {
    player1:{hp:100}, player2:{hp:100},
    state:'waiting', difficulty:diff
  });
  startGame();
  statusDisplay();
};

// Join room
window.joinRoom = () => {
  roomCode = document.getElementById('roomCodeInput').value.trim();
  if(roomCode.length!==6) return alert("Invalid code!");
  playerRole="player2";
  update(ref(db,'rooms/'+roomCode+'/player2'),{hp:100});
  startGame();
  statusDisplay();
};

function statusDisplay(){
  document.getElementById('room-section').style.display='none';
  document.getElementById('game').style.display='block';
  document.getElementById('playerStatus').textContent = `You: ${playerRole.toUpperCase()} (Room: ${roomCode})`;
  listenRoom();
}

// Listen DB updates
function listenRoom(){
  onValue(ref(db,'rooms/'+roomCode),snap=>{
    const data = snap.val();
    if(!data) return;
    if(data.currentQ && data.options){
      showQuestion(data.currentQ,data.options);
    }
    const pid = playerRole==='player1'?'player1':'player2';
    const opp = playerRole==='player1'?'player2':'player1';
    yourHP = data[pid].hp; enemyHP = data[opp].hp;
    document.getElementById('yourHP').value = yourHP;
    document.getElementById('enemyHP').value = enemyHP;
    if(yourHP<=0||enemyHP<=0){
      document.getElementById('msg').textContent = enemyHP<=0?"🏆 You Win!":"💀 You Lose!";
    }
  });
}

// Fetch & set question
async function askQuestion(){
  const diff = (playerRole==='player1')?
    document.getElementById('difficulty').value:'';
  const res = await fetch(`https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${diff}`);
  const d = (await res.json()).results[0];
  const q = decodeHTML(d.question),
        opts = [...d.incorrect_answers.map(decodeHTML), decodeHTML(d.correct_answer)];
  opts.sort(()=>Math.random()-0.5);
  update(ref(db,'rooms/'+roomCode),{
    currentQ:q, options:opts, correct:d.correct_answer
  });
}

// Decode HTML codes
function decodeHTML(txt){
  const t = document.createElement('textarea');
  t.innerHTML = txt; return t.value;
}

// Start game
function startGame(){
  document.getElementById('msg').textContent="";
  askQuestion();
}

// Display question
function showQuestion(q, options){
  document.getElementById('question').textContent = q;
  const ans = document.getElementById('answers');
  ans.innerHTML="";
  options.forEach(opt=>{
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = ()=> answer(opt);
    ans.appendChild(btn);
  });
}

// Handle answer
function answer(chosen){
  onValue(ref(db,'rooms/'+roomCode+'/correct'),snap=>{
    const corr = snap.val();
    const pid = playerRole==='player1'?'player1':'player2';
    const opp = playerRole==='player1'?'player2':'player1';
    let dmg= (chosen===corr)?20:10;
    update(ref(db,'rooms/'+roomCode+'/'+opp),{hp: Math.max(0,(playerRole==='player1'?enemyHP:yourHP)-dmg)});
    document.getElementById('msg').textContent = (chosen===corr)?"✔️ Hit!":"❌ Miss!";
    setTimeout(askQuestion,1000);
  },{onlyOnce:true});
}
