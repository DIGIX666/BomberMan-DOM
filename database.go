package main

import (
	"database/sql"
	"fmt"
	"log"
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
