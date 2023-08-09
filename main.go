package main

import (
	"fmt"
	"net/http"

	"bomberman/server"
)

func main() {
	// Définir la route pour le gestionnaire de connexions WebSocket

	http.Handle("/", http.FileServer(http.Dir("./asset")))

	http.HandleFunc("/ws", server.HandleWebSocketConnection)
	port := "8080"
	// Lancer le serveur en écoutant sur le port spécifié
	fmt.Println("Serveur WebSocket démarré sur le port", port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
	}
}
