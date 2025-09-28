// === Variables ===
let players = [], currentIndex = 0;
let scores = {};
const cartes = ["As","2","3","4","5","6","7","8","9","10","Valet","Dame","Roi"];
let carteCachee = null;

// Bataille
let cartesJoueur1 = [], cartesJoueur2 = [], joueurBataille1 = "", joueurBataille2 = "";

// Bus
let busPlayer = null, busStep = 1, busDeck = [], busCards = [];

// === Démarrage ===
function startGame() {
  const input = document.getElementById('playersInput').value.trim();
  if (!input) { 
    showNotification("⚠️ Veuillez entrer des noms de joueurs !", "error"); 
    return; 
  }
  players = input.split(',').map(p => p.trim()).filter(p => p !== "");
  scores = {};
  players.forEach(p => scores[p] = 0);
  updateScoreboard();
  if (players.length < 2) { 
    showNotification("⚠️ Minimum 2 joueurs requis", "error"); 
    return; 
  }
  document.getElementById('setup').style.display = "none";
  document.getElementById('gameLayout').style.display = "grid";
  showPlayer();
  showNotification("🎉 Partie lancée avec succès !", "success");
}

function showPlayer() {
  document.getElementById('currentPlayer').innerHTML = `🎯 Tour de <span class="highlight">${players[currentIndex]}</span>`;
  document.getElementById('result').innerHTML = "";
  document.getElementById('nextBtn').style.display = "none";
  carteCachee = null;
}

function nextPlayer() { 
  currentIndex = (currentIndex + 1) % players.length; 
  showPlayer(); 
}

function addSips(player, n) {
  if (!scores[player]) scores[player] = 0;
  scores[player] += n;
  updateScoreboard();
}

function updateScoreboard() {
  const board = document.getElementById('scoreboard');
  board.innerHTML = "<h3>🍺 Scoreboard</h3>";
  for (let p in scores) {
    board.innerHTML += `
      <div class="score-item">
        <span class="score-name">${p}</span>
        <span class="score-value">${scores[p]} 🍺</span>
      </div>`;
  }
}

// === Dé ===
function rollDice() {
  const diceEl = document.getElementById("dice");
  const rollBtn = document.getElementById("rollBtn");
  
  // Désactiver le bouton et changer le texte
  rollBtn.disabled = true; 
  rollBtn.textContent = "⏳ Lancement...";
  rollBtn.classList.remove('pulse');
  
  // Générer le résultat final
  const finalRoll = Math.floor(Math.random() * 6) + 1;
  
  // Démarrer l'animation fluide
  diceEl.classList.add('rolling');
  
  // Après l'animation, positionner sur le bon résultat
  setTimeout(() => {
    diceEl.classList.remove('rolling');
    tournerDe(diceEl, finalRoll);
    
    // Attendre un peu pour voir le résultat
    setTimeout(() => {
      afficherResultat(finalRoll);
      rollBtn.textContent = "🎲 Lancer le dé";
      rollBtn.disabled = false;
      rollBtn.classList.add('pulse');
    }, 300);
  }, 2000);
}

function tournerDe(diceEl, n) {
  let rx = 0, ry = 0; 
  
  // Positions exactes pour chaque face du cube
  if (n === 1) { rx = 0; ry = 0; }           // face avant
  else if (n === 2) { rx = 0; ry = -90; }   // face droite  
  else if (n === 3) { rx = 0; ry = 180; }   // face arrière
  else if (n === 4) { rx = 0; ry = 90; }    // face gauche
  else if (n === 5) { rx = -90; ry = 0; }   // face haut
  else if (n === 6) { rx = 90; ry = 0; }    // face bas
  
  // Appliquer la transformation avec transition douce
  diceEl.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1)';
  diceEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
}

function afficherResultat(roll) {
  let msg = ""; 
  const joueur = players[currentIndex];
  
  if (roll === 1) { 
    msg = `<div class="bonus-text">💀 ${joueur} boit 10 gorgées !</div>`; 
    addSips(joueur, 10); 
  }
  else if (roll === 2) { 
    msg = `<div class="bonus-text">🍺 ${joueur} boit 5 gorgées !</div>`; 
    addSips(joueur, 5); 
  }
  else if (roll === 3) { 
    msg = `🥤 ${joueur} boit 1 gorgée !`; 
    addSips(joueur, 1); 
  }
  else if (roll === 4) { 
    let adversaire;
    do {
      adversaire = players[Math.floor(Math.random() * players.length)];
    } while (adversaire === joueur);

    msg = `<div class="bonus-text">⚔️ Chi-Fu-Tease !</div>
           <p>${joueur} affronte ${adversaire} 🔥</p>
           <p>Le perdant boira 3 gorgées 🍺</p><br>
           <button class="btn btn-secondary" onclick="perdChiFuTease('${joueur}','${adversaire}')">👎 ${joueur} a perdu</button>
           <button class="btn btn-secondary" onclick="perdChiFuTease('${adversaire}','${joueur}')">👎 ${adversaire} a perdu</button>`;
  }
  else if (roll === 5) { 
    msg = `<div class="bonus-text">🎁 ${joueur} distribue 5 gorgées !</div>
           <p>Choisis qui doit les boire :</p><br>`;
    players.forEach(p => {
      if (p !== joueur) {
        msg += `<button class="btn btn-secondary" onclick="distribuerGorgees('${joueur}','${p}')">🍻 ${p}</button>`;
      }
    });
  }
  else if (roll === 6) { 
    carteCachee = cartes[Math.floor(Math.random() * cartes.length)];
    msg = `<div class="card-text">🃏 ${joueur} pioche une carte mystère</div><br>
           <button class="btn btn-secondary" onclick="voirCarte()">👁️ Révéler la carte</button>`;
  }
  
  document.getElementById('result').innerHTML = msg;
  
  // Bonus aléatoire
  if (Math.random() < 0.1) setTimeout(lancerPileOuFace, 1500);
  
  document.getElementById('nextBtn').style.display = "inline-block";
}

function voirCarte() { 
  if (carteCachee) {
    document.getElementById('result').innerHTML += `<br><div class="card-text">🎴 La carte est : <span class="highlight">${carteCachee}</span></div>`; 
  }
}

// === Pile ou Face → Bonus ===
function lancerPileOuFace() {
  document.getElementById('coinModal').style.display = 'flex'; 
  const coin = document.getElementById('coin');
  setTimeout(() => {
    const heads = Math.random() < 0.5; 
    coin.style.transform = 'rotateY(1800deg)';
    setTimeout(() => {
      if (heads) { 
        document.getElementById('coinResult').innerHTML = `
          <p><strong>PILE → Bataille ⚔️</strong></p>
          <button class="btn btn-secondary" onclick="fermerPileOuFace(true)">⚔️ Commencer la Bataille</button>`; 
      } else { 
        document.getElementById('coinResult').innerHTML = `
          <p><strong>FACE → Bus 🚌</strong></p>
          <button class="btn btn-secondary" onclick="fermerPileOuFace(false)">🚌 Monter dans le Bus</button>`; 
      }
    }, 1200);
  }, 500);
}

function fermerPileOuFace(isBataille) {
  document.getElementById('coinModal').style.display = 'none'; 
  document.getElementById('coin').style.transform = 'rotateY(0deg)';
  document.getElementById('coinResult').innerHTML = '';
  if (isBataille) jouerBataille(); 
  else startBusGame(currentIndex);
}

// === Distribution de gorgées ===
function distribuerGorgees(donneur, receveur) {
  addSips(receveur, 5);
  document.getElementById('result').innerHTML = 
    `<div class="bonus-text">🎁 ${donneur} a distribué 5 gorgées à ${receveur} 🍺</div>`;
  document.getElementById('nextBtn').style.display = "inline-block";
}

// === Chi-Fu-Tease ===
function perdChiFuTease(perdant, gagnant) {
  addSips(perdant, 3);
  document.getElementById('result').innerHTML = 
    `<div class="bonus-text">🏆 ${gagnant} remporte le Chi-Fu-Tease !</div>
     <p>🍺 ${perdant} boit 3 gorgées</p>`;
  document.getElementById('nextBtn').style.display = "inline-block";
}

// === Bataille ===
function jouerBataille() {
  let i1 = Math.floor(Math.random() * players.length), i2; 
  do { i2 = Math.floor(Math.random() * players.length); } while (i2 === i1);
  joueurBataille1 = players[i1]; 
  joueurBataille2 = players[i2];
  cartesJoueur1 = tirerCartes(3); 
  cartesJoueur2 = tirerCartes(3);
  document.getElementById('result').innerHTML = `
    <div class="bonus-text">⚔️ Bataille !</div>
    <p>${joueurBataille1} vs ${joueurBataille2}</p>
    <button class="btn btn-secondary" onclick="revelerBataille()">🔍 Révéler les cartes</button>`;
}

function revelerBataille() {
  let res = `<div class="bonus-text">⚔️ RÉSULTAT DE LA BATAILLE ⚔️</div><br>`;
  document.getElementById('result').innerHTML = res;
  const zone = document.getElementById('result');
  let delay = 0;

  // révélation alternée des cartes
  for (let i = 0; i < 3; i++) {
    delay += 1500;
    setTimeout(() => { 
      zone.innerHTML += `<p>🃏 ${joueurBataille1} tire : <span class="card-text">${cartesJoueur1[i]}</span></p>`; 
    }, delay);

    delay += 1500;
    setTimeout(() => { 
      zone.innerHTML += `<p>🃏 ${joueurBataille2} tire : <span class="card-text">${cartesJoueur2[i]}</span></p>`; 
    }, delay);
  }

  // calcul du vainqueur après les 6 cartes
  delay += 2000;
  setTimeout(() => {
    const max1 = valeurMax(cartesJoueur1);
    const max2 = valeurMax(cartesJoueur2);

    if (max1 > max2) {
      zone.innerHTML += `<br><div class="bonus-text">🏆 ${joueurBataille1} gagne !</div><p>${joueurBataille2} boit 10 gorgées 🍻</p>`;
      addSips(joueurBataille2, 10);
    } 
    else if (max2 > max1) {
      zone.innerHTML += `<br><div class="bonus-text">🏆 ${joueurBataille2} gagne !</div><p>${joueurBataille1} boit 10 gorgées 🍻</p>`;
      addSips(joueurBataille1, 10);
    } 
    else {
      zone.innerHTML += `<br><div class="bonus-text">🤝 Égalité !</div><p>Tout le monde boit 3 gorgées 🍻</p>`;
      players.forEach(p => addSips(p, 3));
    }

    document.getElementById('nextBtn').style.display = "inline-block";
  }, delay);
}

// === Bus (4 étapes) ===
function startBusGame(idx) { 
  busPlayer = players[idx]; 
  busStep = 1; 
  busDeck = genererDeck(); 
  busCards = []; 
  showBusStep(); 
}

function genererDeck() { 
  const couleurs = ["♠️","♥️","♦️","♣️"]; 
  let d = []; 
  cartes.forEach(v => couleurs.forEach(c => d.push({valeur:v,couleur:c}))); 
  return d; 
}

function tirerCarteBusUnique() { 
  return busDeck.splice(Math.floor(Math.random() * busDeck.length), 1)[0]; 
}

function showBusStep() {
  let msg = `<div class="bonus-text">🚌 Bus - ${busPlayer}</div><p>Étape ${busStep}/4</p><br>`;
  
  if (busStep === 1) { 
    msg += `<p>Rouge ou Noir ?</p>
            <button class="btn btn-secondary" onclick="playBus('rouge')">♥️♦️ Rouge</button>
            <button class="btn btn-secondary" onclick="playBus('noir')">♠️♣️ Noir</button>`; 
  }
  else if (busStep === 2) { 
    msg += `<p>Plus ou Moins que <span class="card-text">${busCards[0].valeur}${busCards[0].couleur}</span> ?</p>
            <button class="btn btn-secondary" onclick="playBus('plus')">⬆️ Plus</button>
            <button class="btn btn-secondary" onclick="playBus('moins')">⬇️ Moins</button>`; 
  }
  else if (busStep === 3) { 
    msg += `<p>Intérieur ou Extérieur des valeurs <span class="card-text">${busCards[0].valeur}, ${busCards[1].valeur}</span> ?</p>
            <button class="btn btn-secondary" onclick="playBus('interieur')">↔️ Intérieur</button>
            <button class="btn btn-secondary" onclick="playBus('exterieur')">↔️ Extérieur</button>`; 
  }
  else if (busStep === 4) { 
    msg += `<p>Choisis la couleur finale :</p>`; 
    ["♠️","♥️","♦️","♣️"].forEach(c => msg += `<button class="btn btn-secondary" onclick="playBus('${c}')">${c}</button>`); 
  }
  
  document.getElementById('result').innerHTML = msg;
}

function playBus(choice) {
  const card = tirerCarteBusUnique();
  busCards.push(card);
  let ok = false, msg = `<p>Carte tirée : <span class="card-text">${card.valeur}${card.couleur}</span></p>`;

  if (busStep === 1) {
    const isRed = (card.couleur === "♥️" || card.couleur === "♦️");
    if ((choice === "rouge" && isRed) || (choice === "noir" && !isRed)) {
      ok = true;
      msg += "<p>✔️ Correct !</p>";
    } else {
      msg += "<p>❌ Incorrect ! Retour étape 1</p>";
      addSips(busPlayer, 1);
    }
  }
  else if (busStep === 2) {
    const v1 = valeurCarteIndividuelle(busCards[0].valeur),
          v2 = valeurCarteIndividuelle(card.valeur);
    if ((choice === "plus" && v2 > v1) || (choice === "moins" && v2 < v1)) {
      ok = true;
      msg += "<p>✔️ Correct !</p>";
    } else {
      msg += "<p>❌ Incorrect ! Retour étape 1</p>";
      addSips(busPlayer, 2);
    }
  }
  else if (busStep === 3) {
    const v1 = valeurCarteIndividuelle(busCards[0].valeur),
          v2 = valeurCarteIndividuelle(busCards[1].valeur),
          v3 = valeurCarteIndividuelle(card.valeur),
          min = Math.min(v1,v2), max = Math.max(v1,v2);
    if ((choice === "interieur" && v3 > min && v3 < max) ||
        (choice === "exterieur" && (v3 < min || v3 > max))) {
      ok = true;
      msg += "<p>✔️ Correct !</p>";
    } else {
      msg += "<p>❌ Incorrect ! Retour étape 1</p>";
      addSips(busPlayer, 3);
    }
  }
  else if (busStep === 4) {
    if (card.couleur === choice) {
      ok = true;
      msg += `<div class="bonus-text">🏆 ${busPlayer} a terminé le Bus ! 🎉</div>`;
    } else {
      msg += "<p>❌ Raté ! Retour étape 1</p>";
      addSips(busPlayer, 4);
    }
  }

  if (ok) {
    busStep++;
    if (busStep > 4) {
      document.getElementById('result').innerHTML = msg;
      document.getElementById('nextBtn').style.display = "inline-block";
      return;
    } else {
      document.getElementById('result').innerHTML = msg;
      setTimeout(showBusStep, 1500);
    }
  } else {
    busStep = 1;
    busCards = [];
    document.getElementById('result').innerHTML = msg;
    setTimeout(showBusStep, 2000);
  }
}

// === Fonctions utilitaires ===
function tirerCartes(n) { 
  const d = [...cartes]; 
  let t = []; 
  for (let i = 0; i < n; i++) { 
    let idx = Math.floor(Math.random() * d.length); 
    t.push(d[idx]); 
    d.splice(idx, 1); 
  } 
  return t; 
}

function valeurCarteIndividuelle(c) { 
  const v = {"As":14,"Roi":13,"Dame":12,"Valet":11,"10":10,"9":9,"8":8,"7":7,"6":6,"5":5,"4":4,"3":3,"2":2}; 
  return v[c]; 
}

function valeurMax(cs) { 
  return Math.max(...cs.map(c => valeurCarteIndividuelle(c))); 
}

// Notifications
function showNotification(msg, type="info") { 
  const n = document.createElement("div"); 
  n.className = `notification ${type}`; 
  n.innerHTML = msg; 
  document.body.appendChild(n); 
  setTimeout(() => n.remove(), 4000); 
}