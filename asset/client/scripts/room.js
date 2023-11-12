import {
  socket
} from "../connexion.js";
import {
  displayGame,
  displayRoom,
  masquerElementsParClasse
} from "./setting-page.js";

class Player {
  constructor(namePlayer, adress, direction, lives, bombe, positionLeft, positionTop, hitPlayer, canMove, indice) {

    this.namePlayer = namePlayer = ""
    this.adress = adress = ""
    this.direction = direction = ""
    this.lives = lives = 3
    this.bombe = bombe = false
    this.positionLeft = positionLeft = 0
    this.positionTop = positionTop = 0
    this.hitPlayer = hitPlayer = false
    this.canMove = canMove = false
    this.indice = indice = 0

  }
  getIndiceWhenHitPlayer() {
    if (this.hitPlayer) {
        return this.indice;
    } else {
        return -1; // Retourne -1 si hitPlayer n'est pas true
    }
}
}

// let timePassed = 0;
const FULL_DASH_ARRAY = 283;
const TIME_LIMIT = 40;
let timeLeft = null
let timerInterval, IDInterval = null;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};
let remainingPathColor = COLOR_CODES.info.color;
let clientAdress = null
let clientPlayer = null
let count, cpt, count2 = 0

let setIntervalID = []

let player = new Player()


let playersIn = []
export function GoRoom(dataServer, socket) {

  // let timeLeft = TIME_LIMIT;

  if (dataServer.type == "goRoom") {
    displayRoom()
    count = 0
    if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.previousPlayers)) {

      playersIn.push(dataServer.data.previousPlayers)
    }
    player.adress = dataServer.data.clientAdress
    playersIn = dataServer.data["previousPlayers"]
    clientAdress = dataServer.data.clientAdress
    clientPlayer = dataServer.data.playerJoined
    socket.send(JSON.stringify({
      type: "clientInfo",
      data: {
        playersUpdate: playersIn,
        client: dataServer.data.clientAdress
      }
    }))
    document.getElementById("chrono").innerHTML = `
    <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
    <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
    <path 
    id="base-timer-path-remaining"
    stroke-dasharray="283"
    class="base-timer__path-remaining ${remainingPathColor}"
    d="
    M 50, 50
    m -45, 0
    a 45,45 0 1,0 90,0
    a 45,45 0 1,0 -90,0
    "
    ></path>
    </g>
                </svg>
                <span id="base-timer-label" class="base-timer__label">${formatTime(
      timeLeft
    )}</span>
                  </div>
                  `;


  }




 


  if (dataServer.type == "Chrono") {

    // timePassed = dataServer.data.time

    // if (dataServer.data.nbPlayers >= 2 && dataServer.data.nbPlayers <= 4) {
    // if (count == 0) {

    timerInterval = startTimer(dataServer.data.duration)
    setIntervalID.push(timerInterval)
    console.log("timerInterval startTimer:", timerInterval)
    // count++


    socket.send(JSON.stringify({
      type: "timerID",
      data: {
        playerAdress: clientAdress,
        playerName: clientPlayer,
        ID: timerInterval,
      }
    }))
    // }
    // }
  }
  if (dataServer.type == "Chrono2") {

    // if (dataServer.data.readyGame) {
    // clearInterval(dataServer.data.ID)

    if (cpt == 0) {
      // timePassed = 0
      cpt++
    }
    // timePassed = dataServer.data.time
    // if (count2 == 0) {
    // console.log("count:", count)

     timerInterval = startTimerGame(dataServer.data.duration)
    setIntervalID.push(timerInterval)
     console.log("timerInterval startTimerGame:", timerInterval)
    // count2++

    socket.send(JSON.stringify({
      type: "timerID2",
      data: {
        playerAdress: clientAdress,
        playerName: clientPlayer,
        ID: IDInterval,
      }
    }))
    // }
    // }
  }

  if (dataServer.type == "StopTimerGame") {
    clearInterval(timerInterval)
  }

}

function onTimesUp(timerInterval) {
  setTimeout(() => {
    clearInterval(timerInterval);

  }, 1)
}

export function startTimer(timeLimit) {
  let timePassed = 0;
  timeLeft = timeLimit

  timerInterval = setInterval(() => {
    timePassed = timePassed + 1
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);

    console.log("time Left:", timeLeft)

    if (timeLeft === 0) {
      // onTimesUp(timerInterval)
      stopAllSetInterval()
      socket.send(JSON.stringify({
        Type: "roomChronoStop",
        Data: null,
      }))
    }
  }, 1000);


  return timerInterval
}

export function startTimerGame(timeLimit) {
  let timePassed = 0;
  timeLeft = timeLimit

  timerInterval = setInterval(() => {
    timePassed = timePassed + 1
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);
    console.log("time Left:", timeLeft)

    if (timeLeft === 0) {
      // onTimesUp(timerInterval)
      stopAllSetInterval()
      socket.send(JSON.stringify({
        Type: "StartGame",
        Data: null
      }))
      masquerElementsParClasse('room')
      displayGame()
    // Récupérez les pseudos des joueurs de la section "Room"
    const player1Name = document.getElementById("player1").textContent;
    const player2Name = document.getElementById("player2").textContent;
    const player3Name = document.getElementById("player3").textContent;
    const player4Name = document.getElementById("player4").textContent;

    console.log(player1Name);
    console.log(player2Name);
    // Injectez les pseudos récupérés dans les éléments de la section "Game"
    document.getElementById("player1Input").textContent = player1Name;
    document.getElementById("player2Input").textContent = player2Name;
    document.getElementById("player3Input").textContent = player3Name;
    document.getElementById("player4Input").textContent = player4Name;
    }
  }, 1000);
  return timerInterval
}


export function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

export function setRemainingPathColor(timeLeft) {
  const {
    alert,
    warning,
    info
  } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

export function calculateTimeFraction(timeLimit) {
  const rawTimeFraction = timeLeft / timeLimit;
  return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

export function setCircleDasharray(timeLimit) {
  const circleDasharray = `${(
    calculateTimeFraction(timeLimit) * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}

function stopAllSetInterval() {
  setIntervalID.forEach(element => {
    clearInterval(element)
  });
}

// Dans votre code côté client (connexion.js)
export function updatePlayerName(index, name) {
  var playerNameElement = document.getElementById("player" + (index + 1));
    playerNameElement.textContent = name;

    // Ajoutez des logs pour vérifier que les pseudonymes sont mis à jour
    console.log("Mise à jour du joueur " + (index + 1) + " avec le nom : " + name);
}
export { player };