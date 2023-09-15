import {
  socket
} from "../connexion.js";
import {
  displayGame,
  displayRoom
} from "./setting-page.js";

let timePassed = 0;
const FULL_DASH_ARRAY = 283;
const TIME_LIMIT = 40;
let timeLeft = null
let timerInterval = null;
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
let count,cpt = 0

export function GoRoom(dataServer, socket) {



  let playersIn = []

  // let timeLeft = TIME_LIMIT;

  if (dataServer.type == "goRoom") {
    displayRoom()
    count = 0
    if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.previousPlayers)) {

      playersIn.push(dataServer.data.previousPlayers)
    }
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
    // playersIn = dataServer.data.playersJoined.name

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
  console.log("dataServer:", dataServer)


  if (dataServer.type == "newPlayersList") {

    if (!playersIn.includes(dataServer.data.lastPlayer)) {
      playersIn.push(dataServer.data.lastPlayer)
    }
  }

  if (dataServer.type == "Chrono") {

    timePassed = dataServer.data.time
   
    if (dataServer.data.nbPlayers >= 2 && dataServer.data.nbPlayers <= 4) {
      if (count == 0) {
        console.log("count:", count)

        timerInterval = startTimer(dataServer.data.duration)
        count++
        console.log("client Adress:", clientAdress)
        console.log("client Player:", clientPlayer)
        console.log("duration:", dataServer.data.duration)

        socket.send(JSON.stringify({
          type: "timerID",
          data: {
            playerAdress: clientAdress,
            playerName: clientPlayer,
            ID: timerInterval,
          }
        }))
      }
    }
  }
  if (dataServer.type == "Chrono2") {

    if (dataServer.data.readyGame) {
      console.log("READY GAME")
      clearInterval(dataServer.data.ID)
      console.log("CLEAR ID:", dataServer.data.ID)
      console.log("IN Ready game duration:", dataServer.data.duration)
      if(cpt==0){
        timePassed = 0
        cpt++
      }
      timePassed = dataServer.data.time
      startTimerGame(dataServer.data.duration)

    }
  }
  // if (timeLeft === 0) {
  //   clearInterval(timerInterval)
  // }

}

function onTimesUp(timerInterval) {
  setTimeout(() => {
    clearInterval(timerInterval);

  }, 1)
}

export function startTimer(timeLimit) {

  timerInterval = setInterval(() => {
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);

    if (timeLeft == 0) {
      clearInterval(timerInterval)
      socket.send(JSON.stringify({
        Type: "roomChronoStop",
        Data: null,
      }))
    }
    console.log("time Left:", timeLeft)

  }, 1000);

  return timerInterval
}

export function startTimerGame(timeLimit) {

  let timerInterval = setInterval(() => {
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      clearInterval(timerInterval)
      displayGame()
    }
    console.log("time Left:", timeLeft)

  }, 1000);
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