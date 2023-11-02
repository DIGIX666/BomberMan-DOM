import {
  GameInit,
  GamePlay,
  PlayerMoved,
  Player,
} from "./scripts/game.js";

import {
  GoRoom,
  updatePlayerName,
} from "./scripts/room.js";


let socket = new WebSocket("ws://localhost:8080/ws")

let player = new Player()

let playerNames = [];

console.log("player tableau",playerNames)

socket.onopen = function (_event) {
  console.log('Connexion WebSocket établie !');
};

socket.onmessage = function (event) {
  console.log('Message reçu du serveur : ' + event.data);
  let dataServer = JSON.parse(event.data)

  GoRoom(dataServer, socket)


  if (dataServer.type == "Game") {
    GameInit()
  }




// Vérifiez si le type de données est "newPlayersList"
if (dataServer.type === "newPlayersList") {
  var playersFromServer = dataServer.data.players;

  // Mettez à jour le tableau des pseudonymes des joueurs avec la liste complète
  playerNames = playersFromServer;
}

// Mettez à jour les éléments HTML correspondants avec les pseudonymes
for (var i = 0; i < playerNames.length; i++) {
  updatePlayerName(i, playerNames[i]);
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