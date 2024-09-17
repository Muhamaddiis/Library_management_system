package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main(){
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	InitDB()

	portString := os.Getenv("PORT")

	if portString == "" {
		log.Fatal()
	}

	server := NewApiserver(":" + portString)
	server.Run()

	defer DB.Close()
	
}