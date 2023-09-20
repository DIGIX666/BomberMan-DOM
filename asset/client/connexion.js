import {
  GameInit,
  Player,

} from "./scripts/game.js";

import {
  GoRoom
} from "./scripts/room.js";


let socket = new WebSocket("ws://localhost:8080/ws")

let player = new Player()


socket.onopen = function (_event) {
  console.log('Connexion WebSocket établie !');
};

socket.onmessage = function (event) {
  console.log('Message reçu du serveur : ' + event.data);
  let dataServer = JSON.parse(event.data)

  GoRoom(dataServer, socket)

  ///////////////////Recevoir les joueurs///////////////////////////////////////////

  if (dataServer.type == "Players") {
    let P1 = document.querySelector(".Player1")
    let P2 = document.querySelector(".Player2")
    let P3 = document.querySelector(".Player3")
    let P4 = document.querySelector(".Player4")
    let Players = []
    console.log("Server In Game:", Server)
    Server.data.allPlayers.forEach(element => {
      Players.push(element)
    });

    console.log("Players tab:", Players)
    P1.innerHTML = Players[0]
    P2.innerHTML = Players[1]
    P3.innerHTML = Players[2]
    P4.innerHTML = Players[3]
    player.namePlayer = Server.data.name
    player.adress = Server.data.clientAdress


  }

  ///////////////////////////////////////////////////////////////////////////////////

  if (dataServer.type == "Game") {
    GameInit(dataServer, socket)

  }

};

socket.onclose = function (_event) {
  console.log('Connexion WebSocket fermée !');
};

socket.onerror = function (error) {
  console.error('Erreur WebSocket : ' + error);
};

export function disconnect() {
  socket.close()
}

export {
  socket
}