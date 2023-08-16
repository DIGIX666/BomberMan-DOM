package main

import (
	"fmt"
	"net/http"

	"bomberman/server"
	"bomberman/userDB"
)

func main() {
	userDB.CreateDataBase()
	// Définir la route pour le gestionnaire de connexions WebSocket

	http.Handle("/asset/", http.StripPrefix("/asset/", http.FileServer(http.Dir("./asset"))))

	http.HandleFunc("/ws", server.HandleWebSocketConnection)
	// http.HandleFunc("/", handleApp)
	http.HandleFunc("/", handleLog)
	http.HandleFunc("/room", room)
	http.HandleFunc("/game", game)

	port := "8080"
	// Lancer le serveur en écoutant sur le port spécifié
	fmt.Println("Serveur WebSocket démarré sur le port", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
	}
}

func handleApp(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/app.html")
}

func handleLog(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/log.html")
}

func room(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/room.html")
}

func game(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/game.html")
}
