package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
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
	activeConnections = make(map[string]*websocket.Conn)
	activeClients     = make(map[string]*websocket.Conn)
	startTime         time.Time
	stopLoopRoom      = make(chan bool)
	stopLoopGame      = make(chan bool)
	timerID           = []map[string]interface{}{}
	elapsed           = 0
	newMap            = make(map[string]interface{})
	count             = 0
	wg                sync.WaitGroup
)

func HandleWebSocketConnection(w http.ResponseWriter, r *http.Request) {
	// Mettez en place une mise à jour pour permettre la communication WebSocket

	// Mise à niveau de la connexion HTTP vers une connexion WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Erreur lors de la mise à niveau de la connexion HTTP en WebSocket:", err)
		return
	}
	defer conn.Close()

	fmt.Println("Client connecté au serveur WebSocket.")

	var data structure.DataParam

	// activeClients = make(map[string]*websocket.Conn)

	// Boucle de gestion des messages du client
	for {
		if len(activeConnections) > 4 {
			activeConnections = make(map[string]*websocket.Conn)
			timerID = []map[string]interface{}{}

		}
		if len(activeClients) > 4 {
			activeClients = make(map[string]*websocket.Conn)
			timerID = []map[string]interface{}{}
		}

		fmt.Printf("data: %v\n", data)
		err = conn.ReadJSON(&data)
		if err != nil {
			fmt.Println("Error Reading JSON")
			break
		}

		switch data.Type {
		case "UserLog":

			activeClients[conn.RemoteAddr().String()] = conn
			activeConnections[data.Data["name"].(string)] = conn
			room(conn, data.Data["name"].(string))

		case "clientInfo":
			manageClientInfo(conn, data)

		case "timerID":
			manageTimerID(conn, data.Data)

		case "roomChronoStop":
			startTime = time.Now()
			TimerGame(conn, activeClients, 10)

		case "Start Game":
			goGame(conn)

		case "PlayerMoving":
			println("Player moving .....")
			MovingPlayer(data)

		}
	}
}

func MovingPlayer(data structure.DataParam) {
	data2Client := structure.DataParam{
		Type: "PlayerMoved",
		Data: map[string]interface{}{
			"dataInfo": data,
		},
	}

	for _, c := range activeConnections {
		err := c.WriteJSON(data2Client)
		if err != nil {
			log.Panicf("Error WriteJson function MovingPlayer:%v\n", err)
		}
	}
}

func GetPlayersHandler(w http.ResponseWriter, r *http.Request) {
	players := userDB.GetPlayersFromDB() // Utilisez la nouvelle fonction pour récupérer les pseudonymes

	response := struct {
		Names []string `json:"names"`
	}{
		Names: players,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func manageTimerID(conn *websocket.Conn, data map[string]interface{}) {
	fmt.Println("Data TimerID:", data)
	fmt.Println()

	// dejaID := false
	// deja := false
	newMap = map[string]interface{}{}

	// for _, v := range timerID {
	// 	if v["ID"] == data["ID"] {
	// 		dejaID = true
	// 		break
	// 	}
	// }
	// for _, v := range timerID {
	// 	_, f := FindKeyByValueInterface(v, data["playerAdress"].(string))
	// 	if f {
	// 		deja = true
	// 		break
	// 	}

	// }

	// if data["playerAdress"] != nil && !deja && !dejaID && len(timerID) < len(activeConnections) {

	newMap[data["playerAdress"].(string)] = data["ID"]
	timerID = append(timerID, newMap)

	// }

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

		if len(activeConnections) == 2 && count == 0 {
			println("DURATION 20 !!!!!!!!!!")

			fmt.Printf("len(activeConnections): %v\n", len(activeConnections))
			fmt.Printf("activeConnections: %v\n", activeConnections)
			startTime = time.Now()
			TimerRoom(conn, activeConnections, 20, stopLoopRoom)
			count++

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
			fmt.Println("erreur writingJSON data function manageClientInfo:")
			log.Fatal(err)
		}
	}
}

func TimerRoom(conn *websocket.Conn, activeConnections map[string]*websocket.Conn, duration int, stopLoop chan bool) {
	go func(activeConnections map[string]*websocket.Conn, conn *websocket.Conn, duration int) {
		for elapsed < duration {
			select {

			case <-stopLoopRoom:
				fmt.Println("stoopLoop:", stopLoop)
				println("Loop TimerRoom has stopped")
				return

			default:

				elapsed := int(time.Since(startTime).Seconds())
				newData := structure.DataParam{
					Type: "Chrono",
					Data: map[string]interface{}{
						"time":      elapsed,
						"nbPlayers": userDB.NumberOfPlayers(),
						"duration":  duration,
					},
				}
				for _, c := range activeConnections {

					err := c.WriteJSON(newData)
					if err != nil {
						fmt.Println("Error in WriteJSON in TimerManager:")
						log.Fatal(err)

					}
				}
				time.Sleep(1 * time.Second)
			}
		}
	}(activeConnections, conn, duration)
}

func TimerGame(conn *websocket.Conn, activeClients map[string]*websocket.Conn, duration int) {
	stopLoopRoom <- true
	go func(activeClients map[string]*websocket.Conn, conn *websocket.Conn, duration int) {
		// elapsed = 0

		println("IN THE ENDGAME !!!!")

		fmt.Printf("activeClients: %v\n", activeClients)
		fmt.Printf("activeConnections: %v\n", activeConnections)

		for key, value := range activeClients {
			for i := 0; i < len(timerID); i++ {
				for k, v := range timerID[i] {
					if key == k {
						fmt.Printf("ID: %v\n", int(v.(float64)))
						fmt.Printf("key: %v\n", key)
						data := structure.DataParam{
							Type: "Chrono2",
							Data: map[string]interface{}{
								"readyGame": true,
								"ID":        int(v.(float64)),
								"duration":  duration,
								"nbPlayers": userDB.NumberOfPlayers(),
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

		for elapsed < duration {
			select {

			case <-stopLoopGame:
				fmt.Println("stoopLoop:", stopLoopGame)
				println("Loop TimerRoom has stopped")
				return

			default:

				elapsed := int(time.Since(startTime).Seconds())

				dataT := structure.DataParam{
					Type: "Chrono2",
					Data: map[string]interface{}{
						"readyGame": true,
						"duration":  duration,
						"time":      elapsed,
						"nbPlayers": userDB.NumberOfPlayers(),
					},
				}
				for _, c := range activeConnections {

					err := c.WriteJSON(dataT)
					if err != nil {
						fmt.Println("Error in WriteJSON in TimerManager:")
						log.Fatal(err)
					}
				}
				time.Sleep(1 * time.Second)
			}
		}

		// if elapsed == duration {
		// 	donnee := structure.DataParam{
		// 		Type: "Game",
		// 		Data: nil,
		// 	}
		// 	for _, c := range activeConnections {

		// 		err := c.WriteJSON(donnee)
		// 		if err != nil {
		// 			fmt.Println("Error in WriteJSON in TimerManager:")
		// 			log.Fatal(err)
		// 		}
		// 	}
		// }
	}(activeClients, conn, duration)
}

func goGame(conn *websocket.Conn) {
	stopLoopGame <- true
	donnee := structure.DataParam{
		Type: "Game",
		Data: nil,
	}
	for _, c := range activeConnections {

		err := c.WriteJSON(donnee)
		if err != nil {
			fmt.Println("Error in WriteJSON in goGame:")
			log.Fatal(err)
		}
	}
}

func FindKeyByValueInterface(m map[string]interface{}, valueToFind string) (string, bool) {
	for key, value := range m {
		if value == valueToFind {
			return key, true // La clé a été trouvée
		}
	}
	return "", false // La clé n'a pas été trouvée
}
