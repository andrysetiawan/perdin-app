package postgres

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/query"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TravelRepository struct {
	pool *pgxpool.Pool
}

func NewTravelRepository(pool *pgxpool.Pool) *TravelRepository {
	return &TravelRepository{pool: pool}
}

func (r *TravelRepository) GetByID(ctx context.Context, id string) (*entity.Travel, error) {
	q := `
		SELECT
			t.id, t.user_id, u.name, t.purpose,
			t.start_date, t.end_date,
			t.origin_city_id, oc.name,
			t.destination_city_id, dc.name,
			t.duration_days, t.distance_km,
			t.allowance_per_day, t.total_allowance,
			t.status
		FROM travel_requests t
		LEFT JOIN users u ON u.id = t.user_id
		LEFT JOIN cities oc ON oc.id = t.origin_city_id
		LEFT JOIN cities dc ON dc.id = t.destination_city_id
		WHERE t.id = $1
	`

	var travel entity.Travel
	err := r.pool.QueryRow(ctx, q, id).Scan(
		&travel.ID,
		&travel.UserID,
		&travel.UserName,
		&travel.Purpose,
		&travel.StartDate,
		&travel.EndDate,
		&travel.OriginCityID,
		&travel.OriginCityName,
		&travel.DestinationCityID,
		&travel.DestCityName,
		&travel.DurationDays,
		&travel.DistanceKM,
		&travel.AllowancePerDay,
		&travel.TotalAllowance,
		&travel.Status,
	)
	if err != nil {
		return nil, err
	}

	return &travel, nil
}

func (r *TravelRepository) GetAll(ctx context.Context, pag pagination.Request, filter query.TravelFilter) ([]*entity.Travel, int64, error) {
	whereClause := " WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if filter.UserID != "" {
		whereClause += " AND t.user_id = $" + strconv.Itoa(argIndex)
		args = append(args, filter.UserID)
		argIndex++
	}

	if filter.Status != "" {
		whereClause += " AND t.status = $" + strconv.Itoa(argIndex)
		args = append(args, filter.Status)
		argIndex++
	}

	// Count
	countQuery := "SELECT COUNT(*) FROM travel_requests t" + whereClause
	var total int64
	err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data
	dataQuery := `
		SELECT
			t.id, t.user_id, u.name, t.purpose,
			t.start_date, t.end_date,
			t.origin_city_id, oc.name,
			t.destination_city_id, dc.name,
			t.duration_days, t.distance_km,
			t.allowance_per_day, t.total_allowance,
			t.status
		FROM travel_requests t
		LEFT JOIN users u ON u.id = t.user_id
		LEFT JOIN cities oc ON oc.id = t.origin_city_id
		LEFT JOIN cities dc ON dc.id = t.destination_city_id
	` + whereClause + `
		ORDER BY t.created_at DESC
		LIMIT $` + strconv.Itoa(argIndex) + `
		OFFSET $` + strconv.Itoa(argIndex+1)

	args = append(args, pag.Limit, pag.Offset())

	rows, err := r.pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var travels []*entity.Travel
	for rows.Next() {
		var travel entity.Travel
		err := rows.Scan(
			&travel.ID,
			&travel.UserID,
			&travel.UserName,
			&travel.Purpose,
			&travel.StartDate,
			&travel.EndDate,
			&travel.OriginCityID,
			&travel.OriginCityName,
			&travel.DestinationCityID,
			&travel.DestCityName,
			&travel.DurationDays,
			&travel.DistanceKM,
			&travel.AllowancePerDay,
			&travel.TotalAllowance,
			&travel.Status,
		)
		if err != nil {
			return nil, 0, err
		}
		travels = append(travels, &travel)
	}

	return travels, total, nil
}

func (r *TravelRepository) Create(ctx context.Context, travel *entity.Travel) (*entity.Travel, error) {
	q := `
		INSERT INTO travel_requests (
			id, user_id, purpose, start_date, end_date,
			origin_city_id, destination_city_id,
			duration_days, distance_km,
			allowance_per_day, total_allowance,
			status
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	`

	_, err := r.pool.Exec(ctx, q,
		travel.ID,
		travel.UserID,
		travel.Purpose,
		travel.StartDate,
		travel.EndDate,
		travel.OriginCityID,
		travel.DestinationCityID,
		travel.DurationDays,
		travel.DistanceKM,
		travel.AllowancePerDay,
		travel.TotalAllowance,
		travel.Status,
	)
	if err != nil {
		return nil, err
	}

	// Re-fetch to populate city names.
	return r.GetByID(ctx, travel.ID)
}

func (r *TravelRepository) Update(ctx context.Context, travel *entity.Travel) (*entity.Travel, error) {
	q := `
		UPDATE travel_requests
		SET
			user_id = $1,
			purpose = $2,
			start_date = $3,
			end_date = $4,
			origin_city_id = $5,
			destination_city_id = $6,
			duration_days = $7,
			distance_km = $8,
			allowance_per_day = $9,
			total_allowance = $10,
			status = $11,
			approved_by = $12,
			approved_at = $13
		WHERE id = $14
	`

	_, err := r.pool.Exec(ctx, q,
		travel.UserID,
		travel.Purpose,
		travel.StartDate,
		travel.EndDate,
		travel.OriginCityID,
		travel.DestinationCityID,
		travel.DurationDays,
		travel.DistanceKM,
		travel.AllowancePerDay,
		travel.TotalAllowance,
		travel.Status,
		nilIfEmpty(travel.ApprovedBy),
		nilIfZeroTime(travel.ApprovedAt),
		travel.ID,
	)
	if err != nil {
		return nil, err
	}

	// Re-fetch to populate city names.
	return r.GetByID(ctx, travel.ID)
}

func (r *TravelRepository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM travel_requests WHERE id = $1`, id)
	return err
}

func nilIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func nilIfZeroTime(t interface{ IsZero() bool }) interface{} {
	if t.IsZero() {
		return nil
	}
	return t
}
