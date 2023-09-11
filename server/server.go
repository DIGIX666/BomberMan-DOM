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

	fmt.Println("Client connecté au serveur WebSocket.")

	var data structure.DataParam

	if len(activeConnections) > 4 {
		activeConnections = make(map[string]*websocket.Conn)
		timerID = []map[string]interface{}{}
		userDB.DropDB()

	}
	if len(activeClients) > 4 {
		activeClients = make(map[string]*websocket.Conn)
		timerID = []map[string]interface{}{}
		userDB.DropDB()
	}
	activeClients[conn.RemoteAddr().String()] = conn

	// Boucle de gestion des messages du client
	for {

		// fmt.Printf("data: %v\n", data)
		err = conn.ReadJSON(&data)
		if err != nil {
			fmt.Println("Error Reading JSON")
			break
		}

		switch data.Type {
		case "UserLog":

			activeConnections[data.Data["name"].(string)] = conn
			if len(activeConnections) <= 4 {
				fmt.Println("nombre de connections:", len(activeConnections))
				room(activeConnections[data.Data["name"].(string)], data.Data["name"].(string))
			}
			if len(activeConnections) == 2 {
				fmt.Println("DURATION 20 !!!!!!!!!")
				startTime = time.Now()
				gameFull = true
				TimerManager(conn, activeClients, activeConnections, true, 20)
				gameFull = false
			}
			if len(activeConnections) == 4 {
				fmt.Println("DURATION 10 !!!!!!!!!")
				startTime = time.Now()
				gameFull = false
				TimerManager(conn, activeClients, activeConnections, false, 10)
				gameFull = true
			}

		case "clientInfo":
			manageClientInfo(conn, data)

		case "timerID":
			manageTimerID(conn, data.Data)

		case "roomTimesUp":
			fmt.Println("Times Up Data:", data.Data["usersReady2Play"])
		case "GameOn":
			fmt.Println("GAME ON !!!")
			managePlayers()

		case "PlayerMoving":

			fmt.Printf("Player %v moving:\n", data.Data["name"])

			playerMoving(conn, data.Data)

		case "GAME OVER":
			println("Player Dead Game Over !!!!")
		}

	}
}

///////////////Manage Players///////////////////

func managePlayers() {
	for player, connection := range activeConnections {

		data := structure.DataParam{
			Type: "Players",
			Data: map[string]interface{}{
				"clientAdress": connection.RemoteAddr().String(),
				"playerName":   player,
				"allPlayers":   userDB.PlayersTab(),
			},
		}
		err := connection.WriteJSON(data)
		if err != nil {
			fmt.Println("Error WriteJSON function managerPlayers")
			panic(err)
		}
	}
}

func playerMoving(conn *websocket.Conn, data map[string]interface{}) {
	data2client := structure.DataParam{
		Type: "PlayerMoved",
		Data: map[string]interface{}{
			"direction": data["direction"],
			"Name":      data["name"],
		},
	}

	for _, c := range activeConnections {
		err := c.WriteJSON(data2client)
		if err != nil {
			println("Error WriteJSON function playerMoving")
			panic(err)
		}
	}
}

///////////////////////////////////////////////////

func manageTimerID(conn *websocket.Conn, data map[string]interface{}) {
	fmt.Println("Data TimerID:", data)
	fmt.Println()

	newMap := make(map[string]interface{})

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
		fmt.Printf("data goRoom send to client: %v\n", data)
		err := conn.WriteJSON(data)
		if err != nil {
			fmt.Println("Error WriteJSON function room:")
			panic(err)
		}

		println("Go Room")
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

func TimerManager(conn *websocket.Conn, activeClients map[string]*websocket.Conn, activeConnections map[string]*websocket.Conn, gameFull bool, duration int) {
	go func(activeConnections map[string]*websocket.Conn, activeClients map[string]*websocket.Conn, gameFull bool, conn *websocket.Conn, duration int) {
		fmt.Println("gameFull:", gameFull)
		for elapsed < duration && gameFull && len(activeConnections) < 4 {
			elapsed := int(time.Since(startTime).Seconds())
			newData := structure.DataParam{
				Type: "Chrono",
				Data: map[string]interface{}{
					"time":      elapsed,
					"nbPlayers": userDB.NumberOfPlayers(),
					"duration":  duration,
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

		// gameFull = false

		if !gameFull && len(activeConnections) == 4 && duration == 10 {

			// stopClockID := 0

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
									"duration":  duration,
									// "time":      elapsed,
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

				elapsed = int(time.Since(startTime).Seconds())

				dataT := structure.DataParam{
					Type: "Chrono",
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

			if elapsed == duration {
				donnee := structure.DataParam{
					Type: "Game",
					Data: nil,
				}
				for _, c := range activeConnections {

					err := c.WriteJSON(donnee)
					if err != nil {
						fmt.Println("Error in WriteJSON in TimerManager:")
						log.Fatal(err)

					}
				}
			}
		}
	}(activeConnections, activeClients, gameFull, conn, duration)
}
