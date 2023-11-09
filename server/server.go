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
	stopLoopRoom      = make(chan bool)
	stopLoopGame      = make(chan bool)
	startTime         time.Time
	nbrPlayer         = 0
	timerID           = []map[string]interface{}{}
	elapsed           = 0
	newMap            = make(map[string]interface{})
	sortir            = make(chan bool)
	count             = 0
	ans               = []map[string]interface{}{}
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
	// defer conn.Close()

	fmt.Println("Client connecté au serveur WebSocket.")

	// activeClients = make(map[string]*websocket.Conn)

	// Boucle de gestion des messages du client

	println("BEFORE LOOP")
	var data structure.DataParam
	for {
		println("Loooping....")
		fmt.Printf("len(activeConnections): %v\n", len(activeConnections))
		if len(activeConnections) > 4 {
			activeConnections = make(map[string]*websocket.Conn)
			timerID = []map[string]interface{}{}

		}
		if len(activeClients) > 4 {
			activeClients = make(map[string]*websocket.Conn)
			timerID = []map[string]interface{}{}
		}

		fmt.Printf("data.Type: %v\n", data.Type)
		fmt.Printf("data: %v\n", data)
		err := conn.ReadJSON(&data)
		if err != nil {
			fmt.Println("Error Reading JSON")
			break
		}

		fmt.Println("after READJSON")

		switch data.Type {
		case "UserLog":

			activeClients[conn.RemoteAddr().String()] = conn
			activeConnections[data.Data["name"].(string)] = conn
			room(conn, data.Data["name"].(string))

		case "clientInfo":
			manageClientInfo(conn, data)

		case "timerID":
			manageTimerID(conn, data.Data)

		case "timerID2":
			timerID = []map[string]interface{}{}
			manageTimerID(conn, data.Data)

		case "roomChronoStop":
			startTime = time.Now()
			// TimerGame(conn, activeClients, 10)
			// TimerRoom(conn, activeConnections, 20, stopLoopRoom)
			StartTimer("Chrono2", activeConnections, 10)

		case "StartGame":
			fmt.Println("GOING goGame")

			// if nbrPlayer == len(activeConnections) {
			// 	goGame(conn)
			// 	nbrPlayer = 0
			// }else{
			// 	nbrPlayer++
			// }
			goGame(conn)
			fmt.Println("OUT OF goGame")

		case "PlayerMoving":
			fmt.Println("Player moving .....")
			MovingPlayer(conn, data.Data)

		case "Player Dropped Bomb":
			println("Player Dropped Bomb")
			Bombed(data.Data)

		case "GameSet":
			StartGameplay(conn, data.Data)

		case "Game Over":
			GameOver(data.Data)

		}
	}
}

func GameOver(data map[string]interface{}) {
	donnee := structure.DataParam{
		Type: "PlayerDead",
		Data: data,
	}
	for _, c := range activeConnections {

		err := c.WriteJSON(donnee)
		if err != nil {
			log.Panicf("Error WriteJSON function GameOver:%v", err)
		}
	}
}

func Bombed(data map[string]interface{}) {
	donnee := structure.DataParam{
		Type: "Bombed",
		Data: data,
	}
	for _, c := range activeConnections {

		err := c.WriteJSON(donnee)
		if err != nil {
			log.Panicf("Error WriteJSON function Bombed:%v", err)
		}
	}
}

func StartGameplay(conn *websocket.Conn, data map[string]interface{}) {
	nameAdress := map[string]interface{}{}

	for k2, c2 := range activeConnections {
		nameAdress[k2] = c2.RemoteAddr().String()
	}

	name, _ := FindKeyByValueInterface(nameAdress, conn.RemoteAddr().String())

	donnee := structure.DataParam{
		Type: "Play",
		Data: map[string]interface{}{
			"info": map[string]string{
				"adress": conn.RemoteAddr().String(),
				"name":   name,
			},
			"map": data["map"],
		},
	}
	err := conn.WriteJSON(donnee)
	if err != nil {
		log.Panicf("Error WriteJSON function StartGameplay:%v", err)
	}
}

func MovingPlayer(conn *websocket.Conn, data map[string]interface{}) {
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

	newMap = map[string]interface{}{}

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
			println("DURATION 30 !!!!!!!!!!")

			fmt.Printf("len(activeConnections): %v\n", len(activeConnections))
			fmt.Printf("activeConnections: %v\n", activeConnections)
			startTime = time.Now()
			// TimerRoom(conn, activeConnections, 20, stopLoopRoom)
			StartTimer("Chrono", activeConnections, 30)
			count++

		}
	}
}

func manageClientInfo(conn *websocket.Conn, dataReceive structure.DataParam) {
	playersRaw := dataReceive.Data["playersUpdate"].([]interface{})
	connectedPlayers := make(map[*websocket.Conn]string)

	players := make([]string, len(playersRaw))

	for i, v := range playersRaw {
		players[i] = v.(string)
	}

	// Récupérez le nom du joueur actuel
	currentPlayerName := userDB.PlayersTab()[len(userDB.PlayersTab())-1]

	// Ajoutez le joueur actuel à la liste des joueurs connectés
	connectedPlayers[conn] = currentPlayerName

	// Ajoutez le joueur actuel à la liste des clients actifs (activeClients)
	activeClients[conn.RemoteAddr().String()] = conn

	var playerUpdate2Client structure.DataParam

	playerUpdate2Client.Type = "newPlayersList"
	playerUpdate2Client.Data = map[string]interface{}{
		"lastPlayer": userDB.PlayersTab()[len(userDB.PlayersTab())-1],
		"players":    userDB.PlayersTab(),
	}

	fmt.Printf("players: %v\n", players)
	fmt.Printf("last Player in DB: %v\n", currentPlayerName)

	for _, c := range activeClients {
		err := c.WriteJSON(playerUpdate2Client)
		if err != nil {
			fmt.Println("erreur writingJSON data function manageClientInfo:")
			log.Fatal(err)
		}
	}
}

func StartTimer(chrono string, activeConnections map[string]*websocket.Conn, duration int) {
	for _, c := range activeConnections {
		c.WriteJSON(structure.DataParam{
			Type: chrono,
			Data: map[string]interface{}{
				"duration": duration,
			},
		})
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
	go func(activeClients map[string]*websocket.Conn, conn *websocket.Conn, duration int) {
		println("StopLoopRoom")
		stopLoopRoom <- true

		println("IN THE ENDGAME !!!!")

		fmt.Printf("activeClients: %v\n", activeClients)
		fmt.Printf("activeConnections: %v\n", activeConnections)

		fmt.Printf("activeConnections: %v\n", activeConnections)
		// fmt.Printf("donnee: %v\n", donnee)
		for key, value := range activeClients {
			for i := 0; i < len(timerID); i++ {
				for k, v := range timerID[i] {
					if key == k {
						fmt.Printf("ID: %v\n", int(v.(float64)))
						fmt.Printf("key: %v\n", key)
						data := structure.DataParam{
							Type: "Chrono2",
							Data: map[string]interface{}{
								"Game":      true,
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

		// elapsed = 0
		for elapsed < duration {

			elapsed = int(time.Since(startTime).Seconds())

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

		data := structure.DataParam{
			Type: "StopTimerGame",
			Data: nil,
		}

		for _, c := range activeConnections {
			err := c.WriteJSON(data)
			if err != nil {
				log.Fatal(err)
			}
		}

		// }
	}(activeClients, conn, duration)
}

func goGame(conn *websocket.Conn) {
	// stopLoopGame <- true
	// close(stopLoopRoom)

	fmt.Printf("activeConnections: %v\n", activeConnections)
	// fmt.Printf("donnee: %v\n", donnee)
	// for key, value := range activeClients {
	// 	for i := 0; i < len(timerID); i++ {
	// 		for k, v := range timerID[i] {
	// 			if key == k {
	// 				fmt.Printf("ID: %v\n", int(v.(float64)))
	// 				fmt.Printf("key: %v\n", key)
	// 				data := structure.DataParam{
	// 					Type: "Chrono2",
	// 					Data: map[string]interface{}{
	// 						// "Game":      true,
	// 						"ID":        int(v.(float64)),
	// 						"duration":  20,
	// 						"nbPlayers": userDB.NumberOfPlayers(),
	// 					},
	// 				}
	// 				err := value.WriteJSON(data)
	// 				if err != nil {
	// 					fmt.Println("Error WriteJSON in TimerManager Last loop")
	// 					log.Fatal(err)
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	joueurs := userDB.PlayersTab()
	mapJoueurs := []string{}

	for _, v := range joueurs {
		fmt.Printf("activeConnections[v]: %v\n", activeConnections[v].RemoteAddr().String())
		mapJoueurs = append(mapJoueurs, activeConnections[v].RemoteAddr().String())
	}

	conn.WriteJSON(structure.DataParam{
		Type: "Game",
		Data: map[string]interface{}{
			"players": mapJoueurs,
		},
	})

	// donnee := structure.DataParam{
	// 	Type: "Game",
	// 	Data: map[string]interface{}{
	// 		"players": userDB.PlayersTab(),

	// 	},
	// }

	// err := conn.WriteJSON(donnee)
	// if err != nil {
	// 	fmt.Println("Error in WriteJSON in goGame:")
	// 	log.Fatal(err)
	// }

	// for _, c := range activeConnections {
	// 	err := c.WriteJSON(donnee)
	// 	if err != nil {
	// 		fmt.Println("Error in WriteJSON in goGame:")
	// 		log.Fatal(err)
	// 	}
	// }
}

func FindKeyByValueInterface(m map[string]interface{}, valueToFind string) (string, bool) {
	for key, value := range m {
		if value == valueToFind {
			return key, true // La clé a été trouvée
		}
	}
	return "", false // La clé n'a pas été trouvée
}
