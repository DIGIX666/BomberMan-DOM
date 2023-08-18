package server

import (
	"fmt"
	"log"
	"net/http"

	"bomberman/structure"
	"bomberman/userDB"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var (
	activeConnections = make(map[string]*websocket.Conn)
	activeClients     = make(map[string]*websocket.Conn)
)

func HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	// Mettez en place une mise à jour pour permettre la communication WebSocket

	// Mise à niveau de la connexion HTTP vers une connexion WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Erreur lors de la mise à niveau de la connexion HTTP en WebSocket:", err)
		return
	}
	// defer conn.Close()
	activeClients[conn.RemoteAddr().String()] = conn

	fmt.Println("Client connecté au serveur WebSocket.")

	var data structure.DataParam

	// Boucle de gestion des messages du client
	for {
		// Lecture du message reçu du client
		// messageType, message, err := conn.ReadMessage()
		// if err != nil {
		// 	fmt.Println("Erreur lors de la lecture du message:", err)
		// 	break
		// }

		// Afficher le message reçu du client
		// fmt.Printf("Message reçu du client: %s\n", message)

		// Exemple de réponse au client
		// response := []byte("Message bien reçu par le serveur.")
		// // Envoyer la réponse au client
		// // err = conn.WriteMessage(messageType, response)
		// if err != nil {
		// 	fmt.Println("Erreur lors de l'envoi de la réponse:", err)
		// 	break
		// }

		fmt.Printf("data: %v\n", data)
		err := conn.ReadJSON(&data)
		if err != nil {
			fmt.Println("Error Reading JSON")
			break
		}

		switch data.Type {
		case "UserLog":
			activeConnections[data.Data["name"].(string)] = conn
			room(conn, data.Data["name"].(string))
		case "clientInfo":
			manageClientInfo(conn, data)
			players2DB(conn)
		}
	}
}

func room(conn *websocket.Conn, player string) {
	var data structure.DataParam

	if player != "" {

		userDB.StorePlayers(player)
		data.Type = "goRoom"
		data.Data = map[string]interface{}{
			"clientAdress":    conn.RemoteAddr().String(),
			"previousPlayers": userDB.PlayersTab(),
			"playerJoined":    player,
		}
		err := conn.WriteJSON(data)
		if err != nil {
			log.Fatal("erreur writing data function Room")
		}
	}
}

func players2DB(conn *websocket.Conn) {
	var data structure.DataParam

	data.Type = "players"
	data.Data = userDB.GetPlayers()
	if data.Data != nil {
		for _, c := range activeClients {
			err := c.WriteJSON(data)
			if err != nil {
				fmt.Println("erreur writing data function players2DB")
			}
		}
	}
}

func sendPlayerRegister(conn *websocket.Conn) {
	var data structure.DataParam

	// err := conn.WriteMessage(1, []byte(player))
	// if err != nil {
	// 	log.Fatal("Failed to send player to client")
	// }
	data.Type = "players"
	data.Data = userDB.GetPlayers()
	fmt.Printf("data: %v\n", data)
	err := conn.WriteJSON(data)
	if err != nil {
		log.Fatal("erreur writing data function sendPlayerRegister")
	}
}

func manageClientInfo(conn *websocket.Conn, dataReceive structure.DataParam) {
	playersRaw := dataReceive.Data["playersUpdate"].([]interface{})
	// client := dataReceive.Data["client"].(string)

	// Transforme PlayersRaw de type `[]interface{}` en players de type []string

	players := make([]string, len(playersRaw))

	for i, v := range playersRaw {
		players[i] = v.(string)
	}

	var playerUpdate2Client structure.DataParam

	playerUpdate2Client.Type = "newPlayersList"
	playerUpdate2Client.Data = map[string]interface{}{
		"lastPlayer": userDB.PlayersTab()[len(userDB.PlayersTab())-1],
	}

	fmt.Printf("players: %v\n", players)
	fmt.Printf("last Player in DB: %v\n", userDB.PlayersTab()[len(userDB.PlayersTab())-1])

	for _, c := range activeConnections {
		err := c.WriteJSON(playerUpdate2Client)
		if err != nil {
			fmt.Println("erreur writing data function manageClientInfo:")
			log.Fatal(err)
		}
	}
}
