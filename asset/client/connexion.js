import {
  GameInit,
  GamePlay,
  PlayerMoved,
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


  ///////////////////////////////////////////////////////////////////////////////////

  if (dataServer.type == "Game") {
    GameInit(dataServer.data.players)

  }

  if (dataServer.type == "Play") {
    // GetNameAndAdress(dataServer.data.info)
    player.adress = dataServer.data.info.adress
    player.namePlayer = dataServer.data.info.name
    GamePlay(socket,player,dataServer.data.map)

  }

  if (dataServer.type == "Bombed") {

    player.bomb = true;
    player.lives = dataServer.data.currentLife;
    PlayerMoved(socket, player, dataServer, dataServer.data.updateMap);

  }

  if (dataServer.type == "PlayerMoved") {

    player.position = dataServer.data.dataInfo.position

    PlayerMoved(socket, player, dataServer.data.dataInfo, dataServer.data.dataInfo.map);
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