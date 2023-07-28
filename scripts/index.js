let socket = new WebSocket('ws://localhost:8080/ws')

export function WSManager() {

  socket.onopen = function (_event) {
    console.log('Connexion WebSocket établie !');

  };

  socket.onmessage = function (event) {
    console.log('Message reçu du serveur : ' + event.data);
  };

  socket.onclose = function (_event) {
    console.log('Connexion WebSocket fermée !');
  };

  socket.onerror = function (error) {
    console.error('Erreur WebSocket : ' + error);
  };
}

export function disconnect() {
  socket.close();
}