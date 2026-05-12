package dto

import (
	"perdin-service/internal/domain/entity"
)

type CityResponse struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	Province   string  `json:"province"`
	Island     string  `json:"island"`
	IsOverseas bool    `json:"is_overseas"`
}

func ToCityResponse(
	city *entity.City,
) CityResponse {

	return CityResponse{
		ID:         city.ID,
		Name:       city.Name,
		Latitude:   city.Latitude,
		Longitude:  city.Longitude,
		Province:   city.Province,
		Island:     city.Island,
		IsOverseas: city.IsOverseas,
	}
}

func ToCityResponses(
	cities []*entity.City,
) []CityResponse {

	result := make([]CityResponse, len(cities))

	for i, city := range cities {
		result[i] = ToCityResponse(city)
	}

	return result
}
