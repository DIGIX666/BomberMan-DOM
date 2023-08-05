package main

import (
	"fmt"
	"net/http"

	"bomberman-dom/server"
)

func main() {
	// Définir la route pour le gestionnaire de connexions WebSocket
	// http.Handle("/asset/", http.StripPrefix("/asset/", http.FileServer(http.Dir("./asset"))))
	// http.HandleFunc("/ws", server.HandleWebSocketConnection)

	http.Handle("/asset/", http.StripPrefix("/asset/", http.FileServer(http.Dir("./asset"))))
	http.HandleFunc("/ws", server.HandleWebSocketConnection)

	router := http.NewServeMux()
	router.HandleFunc("/", handleLog)
	router.HandleFunc("/room", handleRoom)
	router.HandleFunc("/game", handleGame)

	// Combiner les gestionnaires de routeur et de fichiers statiques
	http.Handle("/", router)
	port := "8080"

	fmt.Println("Serveur WebSocket démarré sur le port", port)
	// Lancer le serveur en écoutant sur le port spécifié
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
