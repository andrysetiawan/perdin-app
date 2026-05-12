package postgres

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CityRepository struct {
	pool *pgxpool.Pool
}

func NewCityRepository(pool *pgxpool.Pool) *CityRepository {
	return &CityRepository{pool: pool}
}

func (r *CityRepository) GetByID(ctx context.Context, id string) (*entity.City, error) {

	query := `
	SELECT id, name, latitude, longitude, province, island, is_overseas
	FROM cities
	WHERE id = $1
	`

	var city entity.City
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&city.ID,
		&city.Name,
		&city.Latitude,
		&city.Longitude,
		&city.Province,
		&city.Island,
		&city.IsOverseas,
	)
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (r *CityRepository) GetAll(ctx context.Context, pagination pagination.Request) ([]*entity.City, int64, error) {

	// Count
	var total int64

	countQuery := `
	SELECT COUNT(*)
	FROM cities
	`

	err := r.pool.QueryRow(
		ctx,
		countQuery,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data
	query := `
	SELECT id, name, latitude, longitude, province, island, is_overseas
	FROM cities
	ORDER BY name
	LIMIT $1 OFFSET $2
	`

	rows, err := r.pool.Query(ctx, query, pagination.Limit, pagination.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var cities []*entity.City

	for rows.Next() {
		var city entity.City
		err := rows.Scan(
			&city.ID,
			&city.Name,
			&city.Latitude,
			&city.Longitude,
			&city.Province,
			&city.Island,
			&city.IsOverseas,
		)
		if err != nil {
			return nil, 0, err
		}
		cities = append(cities, &city)
	}

	return cities, total, nil
}

func (r *CityRepository) Create(ctx context.Context, city *entity.City) (*entity.City, error) {
	query := `
	INSERT INTO cities (id, name, latitude, longitude, province, island, is_overseas)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query,
		city.ID,
		city.Name,
		city.Latitude,
		city.Longitude,
		city.Province,
		city.Island,
		city.IsOverseas,
	)
	if err != nil {
		return nil, err
	}
	return city, nil
}

func (r *CityRepository) Update(ctx context.Context, city *entity.City) (*entity.City, error) {
	query := `
	UPDATE cities
	SET name = $1, latitude = $2, longitude = $3, province = $4, island = $5, is_overseas = $6
	WHERE id = $7
	`
	_, err := r.pool.Exec(ctx, query,
		city.Name,
		city.Latitude,
		city.Longitude,
		city.Province,
		city.Island,
		city.IsOverseas,
		city.ID,
	)
	if err != nil {
		return nil, err
	}
	return city, nil
}

func (r *CityRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM cities WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
