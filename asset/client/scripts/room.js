import { socket } from "../connect.js";
import { displayRoom, masquerElementsParClasse } from "./setting-page.js";

let playersIn = []

const FULL_DASH_ARRAY = 283;
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

const TIME_LIMIT = 20;
let timePassed = 0;
// let timeLeft = TIME_LIMIT;
let timeLeft = 0
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

document.addEventListener("DOMContentLoaded", () => {

  socket.onmessage = function (event) {
    let dataServer = JSON.parse(event.data)
    console.log("dataServer:", dataServer)
    if (dataServer.type == "goRoom") {
      displayRoom()
      if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.previousPlayers)) {

        playersIn.push(dataServer.data.previousPlayers)
      }
      playersIn = dataServer.data["previousPlayers"]
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

    if (dataServer.type == "newPlayersList") {

      if (!playersIn.includes(dataServer.data.lastPlayer)) {
        console.log("YOOOOOOOO !!!!!!!!")
        playersIn.push(dataServer.data.lastPlayer)
      }
    }

    if (dataServer.type == "players") {

      // let playersIn = Object.keys(dataServer.data).length-1
      // console.log("playerIn",playersIn)


      console.log("playersIn", playersIn)
      if (playersIn.length >= 2) {

        // startTimer();
        if (dataServer.data.name != "" && !playersIn.includes(dataServer.data.name)) {
          playersIn.push(dataServer.data.name)
        }

        const startTime = new Date().getTime();

        setInterval(() => {
          const elapsedTime = new Date().getTime() - startTime;
          socket.send(elapsedTime.toString());
        }, 1000);

        socket.send(JSON.stringify({
          type: "StartTimer",
          data: null
        }))
      }

    }
    if (playersIn.length == 4) {
      onTimesUp()

      const data = {
        type: "roomTimesUp",
        usersReady2Play: playersIn,
        nbrUsers: playersIn.length,
      }
      socket.send(JSON.stringify(data))
    }

    if (dataServer.type == "Chrono") {

      timePassed = dataServer.data.time
      startTimer()
      console.log("time left:", dataServer.data.time)

    }
  }
})

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
  timerInterval = setInterval(() => {
    // timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    // document.getElementById("base-timer-label").innerHTML = formatTime(
    //   timeLeft
    // );
    document.getElementById("base-timer-label").innerHTML = timeLeft;
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
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

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
