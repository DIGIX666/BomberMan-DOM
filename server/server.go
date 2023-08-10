package server

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	// Mettez en place une mise à jour pour permettre la communication WebSocket

	// Mise à niveau de la connexion HTTP vers une connexion WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Erreur lors de la mise à niveau de la connexion HTTP en WebSocket:", err)
		return
	}
	// defer conn.Close()

	fmt.Println("Client connecté au serveur WebSocket.")

	// Boucle de gestion des messages du client
	for {
		// Lecture du message reçu du client
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Erreur lors de la lecture du message:", err)
			break
		}

		// Afficher le message reçu du client
		fmt.Printf("Message reçu du client: %s\n", message)

		// Exemple de réponse au client
		response := []byte("Message bien reçu par le serveur.")
		// Envoyer la réponse au client
		err = conn.WriteMessage(messageType, response)
		if err != nil {
			fmt.Println("Erreur lors de l'envoi de la réponse:", err)
			break
		}
	}
}
