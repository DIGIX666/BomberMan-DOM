import {
  GameInit,
  GamePlay,
  PlayerMoved,
} from "./scripts/game.js";

import {
  GoRoom,
  updatePlayerName,
  player,
} from "./scripts/room.js";


let playerNames = [];
console.log("player tableau", playerNames)


let socket = new WebSocket("ws://localhost:8080/ws")
let indice = 0
let lastTime = 0;
let frameCount = 0;

socket.onopen = function (_event) {
  console.log('Connexion WebSocket établie !');
};

requestAnimationFrame(function (timestamp) {

  socket.onmessage = function (event) {
    console.log('Message reçu du serveur : ' + event.data);
    let dataServer = JSON.parse(event.data)

    GoRoom(dataServer, socket)


    ///////////////////Recevoir les joueurs///////////////////////////////////////////

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

    ///////////////////////////////////////////////////////////////////////////////////

    if (dataServer.type == "Attribution") {

      // if (dataServer.data.adress == player.adress) {
      //   indice = dataServer.data.indice
      //   console.log("indice:", indice)
      //   console.log("player:", player)
      // }
    }

    if (dataServer.type == "Game") {


      console.log("map players:", dataServer.data.players)

      let arr = dataServer.data.players

      for (let index = 0; index < arr.length; index++) {

        console.log("arr adress:", arr[index])
        if (arr[index] == player.adress) {
          console.log("index:", index)
          indice = index
          player.indice = index
          GameInit(arr, indice)
          arr = []

        }
      }
      // if (dataServer.data.adress == player.adress) {
      //   indice = dataServer.data.indice
      //   console.log("indice:", indice)
      //   console.log("player:", player)
      //   GameInit(dataServer.data.players, indice)
      // }
    }

    if (dataServer.type == "Play") {
      console.log("indice before GamePlay:", indice)
      player.adress = dataServer.data.info.adress
      player.namePlayer = dataServer.data.info.name
      GamePlay(socket, player, dataServer.data.map, indice)
    }

    if (dataServer.type == "Bombed") {

      // player.bomb = true;
      player.lives = dataServer.data.currentLife
      PlayerMoved(socket, player, dataServer.data);

    }

    if (dataServer.type == "PlayerMoved") {

      player.position = dataServer.data.dataInfo.position
      PlayerMoved(socket, player, dataServer.data.dataInfo);
    }

    // if (dataServer.type == "PlayerHit") {

    //   // player.lives = dataServer.data.currentLife;
    //   // PlayerMoved(socket, player, dataServer.data);

    //   if (dataServer.data.hit) {
    //     console.log("REDUCE LIFE !!!!!!")
    //     reduceLife(player, dataServer.data.indice)
    //     player.hitPlayer = false
    //   }

    // }

  };
  frameCount++;

  if (timestamp - lastTime >= 1000) {
    const fps = frameCount;
    console.log("FPS: " + fps);
    frameCount = 0;
    lastTime = timestamp;
  }
})

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