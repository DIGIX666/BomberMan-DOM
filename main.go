package main

import (
	"bomberman/server"
	"fmt"
	"net/http"
)

func main() {
	// Définir la route pour le gestionnaire de connexions WebSocket

	http.Handle("/asset/", http.StripPrefix("/asset/", http.FileServer(http.Dir("./asset"))))

	http.HandleFunc("/ws", server.HandleWebSocketConnection)
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

func handleLog(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./client/log.html")
}

func room(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./client/room.html")
}

func game(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./client/game.html")
}
