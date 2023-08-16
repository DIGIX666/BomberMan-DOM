package userDB

import (
	"database/sql"
	"fmt"
	"log"

	"bomberman/structure"

	_ "github.com/mattn/go-sqlite3"
)

var Db *sql.DB

func CreateDataBase() {
	var err error
	Db, err = sql.Open("sqlite3", "./bombermanDB.db")
	if err != nil {
		fmt.Println("Erreur ouverture de la base de donnée à la création")
		log.Fatal(err)
	}

	_, err = Db.Exec(`CREATE TABLE IF NOT EXISTS players
	(id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT DEFAULT '',
	score INTEGER DEFAULT 0,
	ranking INTEGER DEFAULT 0

	)`)
	if err != nil {
		log.Println("erreur creation de table players")
		log.Fatal(err)
	}
}

func StorePlayers(player string) {
	_, err := Db.Exec("INSERT INTO players (username) VALUES (?)", player)
	if err != nil {
		fmt.Println("Error in players table Function Exec didn't work in dataBase:")
		log.Fatal(err)
	}
}

func GetPlayers() map[string]interface{} {
	// var ans map[string]interface{}

	// ans := make([]map[string]interface{}, 3)

	var players []structure.UserParam

	rows, err := Db.Query("SELECT * FROM players")
	if err != nil {
		fmt.Println("Error in Feed Function Query didn't work in dataBase:")
		log.Fatal(err)
	}
	defer rows.Close()
	var id int

	for rows.Next() {
		var playerParam structure.UserParam

		err := rows.Scan(&id, &playerParam.Name, &playerParam.Score, &playerParam.Ranking)
		if err != nil {
			fmt.Println("Error in Feed Function Query didn't work in dataBase:")
			log.Fatal(err)
		}

		players = append(players, playerParam)

	}

	ans := make(map[string]interface{}, len(players))

	for _, value := range players {
		ans["name"] = value.Name
		ans["score"] = value.Score
		ans["ranking"] = value.Ranking

	}

	return ans
}
