package service

import "perdin-service/internal/domain/entity"

const (
	NoAllowance       = 0
	SameProvince      = 200000
	SameIsland        = 250000
	DifferentIsland   = 300000
	OverseasAllowance = 50 // USD
)

func CalculateAllowance(
	distance float64,
	origin entity.City,
	destination entity.City,
) float64 {

	// Overseas rule
	if destination.IsOverseas {
		return OverseasAllowance
	}

	// 0 - 60 km
	if distance <= 60 {
		return NoAllowance
	}

	// Same province
	if origin.Province == destination.Province {
		return SameProvince
	}

	// Same island
	if origin.Island == destination.Island {
		return SameIsland
	}

	// Different island
	return DifferentIsland
}
