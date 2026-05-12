package entity

import "time"

type City struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Latitude   float64   `json:"latitude"`
	Longitude  float64   `json:"longitude"`
	Province   string    `json:"province"`
	Island     string    `json:"island"`
	IsOverseas bool      `json:"is_overseas"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
