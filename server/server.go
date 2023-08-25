package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"bomberman/structure"
	"bomberman/userDB"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var (
	activeClients     = make(map[string]*websocket.Conn)
	activeConnections = make(map[string]*websocket.Conn)
	elapsed           = 0
	startTime         time.Time
	timerID           = []map[string]interface{}{}
	gameFull          = false
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

	if len(activeConnections) > 4 {
		activeConnections = make(map[string]*websocket.Conn)
		timerID = []map[string]interface{}{}

	}
	if len(activeClients) > 4 {
		activeClients = make(map[string]*websocket.Conn)
		timerID = []map[string]interface{}{}
	}

	// Boucle de gestion des messages du client
	for {
		// Lecture du message reçu du client
		// _, message, err := conn.ReadMessage()
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
		err = conn.ReadJSON(&data)
		if err != nil {
			fmt.Println("Error Reading JSON")
			break
		}

		// if string(message) == "Connexion WebSocket fermée !" {
		// 	delete(activeConnections, data.Data["name"].(string))
		// 	// break
		// }

		switch data.Type {
		case "UserLog":
			activeConnections[data.Data["name"].(string)] = conn
			// tunnel4Connections <- activeConnections
			fmt.Println("nombre de connections:", len(activeConnections))
			if len(activeConnections) <= 4 {
				room(conn, data.Data["name"].(string))
			}
			if len(activeConnections) == 2 {
				startTime = time.Now()
				gameFull = true
				TimerManager(conn, activeConnections, gameFull, 40)
				gameFull = false
			}
			if len(activeConnections) == 4 {
				startTime = time.Now()
				gameFull = false
				TimerManager(conn, activeConnections, false, 20)
				gameFull = true

			}

		case "clientInfo":
			manageClientInfo(conn, data)
			// players2DB(conn)

		case "timerID":
			manageTimerID(conn, data.Data)

		case "roomTimesUp":
			fmt.Println("Times Up Data:", data.Data["usersReady2Play"])
		}
	}
}

func manageTimerID(conn *websocket.Conn, data map[string]interface{}) {
	fmt.Println("Data TimerID:", data)
	fmt.Println()

	// for clientAdress := range data {
	// 	timerID[clientAdress] = data[clientAdress]
	// }
	// rightLocalhost := "[::1]"
	newMap := make(map[string]interface{})
	// if strings.Split(data["playerAdress"].(string), ":")[0] == "[::1]" {
	// 	newMap[data["playerAdress"].(string)] = data["ID"]
	// 	timerID = append(timerID, newMap)
	// } else {
	// 	urlNumber := strings.Split(data["playerAdress"].(string), ":")[0]
	// 	rightAdress := rightLocalhost + ":" + urlNumber
	// 	newMap[rightAdress] = data["ID"]
	// 	timerID = append(timerID, newMap)
	// }

	newMap[data["playerAdress"].(string)] = data["ID"]
	timerID = append(timerID, newMap)

	fmt.Printf("tID: %v\n", timerID)
	fmt.Println()
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

func manageClientInfo(conn *websocket.Conn, dataReceive structure.DataParam) {
	playersRaw := dataReceive.Data["playersUpdate"].([]interface{})

	/////////////Transforme PlayersRaw de type `[]interface{}` en players de type []string/////////////////////////////

	players := make([]string, len(playersRaw))

	for i, v := range playersRaw {
		players[i] = v.(string)
	}
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var playerUpdate2Client structure.DataParam

	playerUpdate2Client.Type = "newPlayersList"
	playerUpdate2Client.Data = map[string]interface{}{
		"lastPlayer": userDB.PlayersTab()[len(userDB.PlayersTab())-1],
	}

	fmt.Printf("players: %v\n", players)
	fmt.Printf("last Player in DB: %v\n", userDB.PlayersTab()[len(userDB.PlayersTab())-1])

	for _, c := range activeClients {
		err := c.WriteJSON(playerUpdate2Client)
		if err != nil {
			fmt.Println("erreur writing data function manageClientInfo:")
			log.Fatal(err)
		}
	}
}

func TimerManager(conn *websocket.Conn, activeConnections map[string]*websocket.Conn, gameFull bool, duration int) {
	// var data structure.DataParam
	// dataChannel := make(chan structure.DataParam)
	// startTime := time.Now()

	go func(activeConnections map[string]*websocket.Conn, gameFull bool, conn *websocket.Conn, duration int) {
		fmt.Println("gameFull:", gameFull)
		for elapsed < duration && gameFull {
			elapsed = int(time.Since(startTime).Seconds())
			newData := structure.DataParam{
				Type: "Chrono",
				Data: map[string]interface{}{
					"time":      elapsed,
					"nbPlayers": userDB.NumberOfPlayers(),
				},
			}
			fmt.Printf("userDB.NumberOfPlayers(): %v\n", userDB.NumberOfPlayers())
			for _, c := range activeConnections {

				err := c.WriteJSON(newData)
				if err != nil {
					fmt.Println("Error in WriteJSON in TimerManager:")
					log.Fatal(err)

				}
			}
			time.Sleep(1 * time.Second)
		}

		if !gameFull {
			gameFull = true
			// newData := structure.DataParam{
			// 	Type: "Chrono",
			// 	Data: map[string]interface{}{
			// 		"time": duration,
			// 	},
			// }

			// for _, c := range activeConnections {

			// 	err := c.WriteJSON(newData)
			// 	if err != nil {
			// 		fmt.Println("Error in WriteJSON in TimerManager:")
			// 		log.Fatal(err)

			// 	}
			// }
			fmt.Printf("activeClients: %v\n", activeClients)
			fmt.Printf("activeConnections: %v\n", activeConnections)
			for i := 0; i < len(timerID); i++ {
				for key, value := range activeClients {
					for k, v := range timerID[i] {
						if key == k {
							fmt.Println("FOUND key activeClients:", key)
							fmt.Println("FOUND key timerID:", k)
							data := structure.DataParam{
								Type: "Chrono",
								Data: map[string]interface{}{
									"readyGame": true,
									"ID":        v,
									"time":      20,
								},
							}
							err := value.WriteJSON(data)
							if err != nil {
								fmt.Println("Error WriteJSON in TimerManager Last loop")
								log.Fatal(err)
							}
						}
					}
				}
			}
		}
	}(activeConnections, gameFull, conn, duration)
}

// func players2DB(conn *websocket.Conn) {
// 	var data structure.DataParam

// 	data.Type = "players"
// 	data.Data = userDB.GetPlayers()
// 	if data.Data != nil {
// 		for _, c := range activeClients {
// 			err := c.WriteJSON(data)
// 			if err != nil {
// 				fmt.Println("erreur writing data function players2DB")
// 			}
// 		}
// 	}
// }
