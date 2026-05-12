package city

// CreateCityInput carries the data needed to create a new city.
type CreateCityInput struct {
	Name       string  `json:"name"        validate:"required,min=2,max=100"`
	Latitude   float64 `json:"latitude"    validate:"required,gte=-90,lte=90"`
	Longitude  float64 `json:"longitude"   validate:"required,gte=-180,lte=180"`
	Province   string  `json:"province"    validate:"required,min=2,max=100"`
	Island     string  `json:"island"      validate:"required,min=2,max=100"`
	IsOverseas bool    `json:"is_overseas"`
}

// UpdateCityInput carries the fields to update on an existing city.
// Nil pointer means "leave unchanged".
type UpdateCityInput struct {
	Name       *string  `json:"name"        validate:"omitempty,min=2,max=100"`
	Latitude   *float64 `json:"latitude"    validate:"omitempty,gte=-90,lte=90"`
	Longitude  *float64 `json:"longitude"   validate:"omitempty,gte=-180,lte=180"`
	Province   *string  `json:"province"    validate:"omitempty,min=2,max=100"`
	Island     *string  `json:"island"      validate:"omitempty,min=2,max=100"`
	IsOverseas *bool    `json:"is_overseas"`
}
