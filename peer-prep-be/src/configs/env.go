package configs

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func EnvMongoURI() string {
    pwd, err := os.Getwd()
    if err != nil {
        panic(err)
    }
    
    // err = godotenv.Load(filepath.Join(pwd, "../.env")) // Use when running on local
    err = godotenv.Load(filepath.Join(pwd, ".env")) // Use when building Docker

    if err != nil {
        log.Fatal("Error loading .env file")
    }
  
    return os.Getenv("MONGODB_URI")
}