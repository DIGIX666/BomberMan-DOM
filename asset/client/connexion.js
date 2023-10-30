import {
  GameInit,
  GamePlay,
  PlayerMoved,
  Player,
  mapData,
  dropBomb,

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
    GameInit(mapData)

  }

  if (dataServer.type == "Play") {
    // GetNameAndAdress(dataServer.data.info)
    player.adress = dataServer.data.info.adress
    player.namePlayer = dataServer.data.info.name
    GamePlay(socket, player,mapData,)

  }

  if (dataServer.type == "PlayerMoved") {

    player.position = dataServer.data.dataInfo.position

    PlayerMoved(socket, player, dataServer.data.dataInfo, mapData)
  }
  
  if (dataServer.type == "dropBomb") {
    player.position = dataServer.data.dataInfo.position

    dropBomb(socket, player, dataServer.data.dataInfo, mapData)
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