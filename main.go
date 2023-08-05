package main

import (
	"fmt"
	"net/http"

	"bomberman/server"
)

func main() {
	// Définir la route pour le gestionnaire de connexions WebSocket

	http.Handle("/asset/", http.StripPrefix("/asset/", http.FileServer(http.Dir("./asset"))))

	router := http.NewServeMux()
	router.HandleFunc("/", handleLog)
	router.HandleFunc("/room", handleRoom)
	router.HandleFunc("/game", handleGame)

	// Combiner les gestionnaires de routeur et de fichiers statiques
	http.Handle("/", router)

	http.HandleFunc("/ws", server.HandleWebSocketConnection)
	port := "8080"
	// Lancer le serveur en écoutant sur le port spécifié
	fmt.Println("Serveur WebSocket démarré sur le port", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
	}
}

func handleLog(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/log.html")
}

func handleRoom(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/room.html")
}

func handleGame(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./asset/game.html")
}
