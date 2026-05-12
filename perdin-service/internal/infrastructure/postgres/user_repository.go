package postgres

import (
	"context"
	"encoding/json"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entity.User, error) {
	query := `
		SELECT
			u.id, u.name, u.email, u.password,
			COALESCE(
				json_agg(
					json_build_object(
						'id', ro.id,
						'name', ro.name
					)
				) FILTER (WHERE ro.id IS NOT NULL),
				'[]'
			) AS roles
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ro ON ro.id = ur.role_id
		WHERE u.id = $1
		GROUP BY u.id
	`

	var user entity.User
	var rolesJson []byte
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.Name, &user.Email, &user.Password, &rolesJson,
	)
	if err != nil {
		return nil, err
	}

	// Unmarshal roles JSON
	if err := json.Unmarshal(rolesJson, &user.Roles); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	query := `
		SELECT
			u.id, u.name, u.email, u.password,
			COALESCE(
				json_agg(
					json_build_object(
						'id', ro.id,
						'name', ro.name
					)
				) FILTER (WHERE ro.id IS NOT NULL),
				'[]'
			) AS roles
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ro ON ro.id = ur.role_id
		WHERE u.email = $1
		GROUP BY u.id
	`

	var user entity.User
	var rolesJson []byte
	err := r.pool.QueryRow(ctx, query, email).Scan(
		&user.ID, &user.Name, &user.Email, &user.Password, &rolesJson,
	)
	if err != nil {
		return nil, err
	}

	// Unmarshal roles JSON
	if err := json.Unmarshal(rolesJson, &user.Roles); err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetAll(ctx context.Context, pag pagination.Request) ([]*entity.User, int64, error) {
	// Count
	var total int64
	countQuery := `SELECT COUNT(*) FROM users`
	err := r.pool.QueryRow(ctx, countQuery).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Data
	query := `
		SELECT
			u.id, u.name, u.email,
			COALESCE(
				json_agg(
					json_build_object(
						'id', ro.id,
						'name', ro.name
					)
				) FILTER (WHERE ro.id IS NOT NULL),
				'[]'
			) AS roles
		FROM users u
		LEFT JOIN user_roles ur ON ur.user_id = u.id
		LEFT JOIN roles ro ON ro.id = ur.role_id
		GROUP BY u.id
		ORDER BY u.name
		LIMIT $1 OFFSET $2
	`

	rows, err := r.pool.Query(ctx, query, pag.Limit, pag.Offset())
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var users []*entity.User
	for rows.Next() {
		var user entity.User
		var rolesJson []byte
		if err := rows.Scan(&user.ID, &user.Name, &user.Email, &rolesJson); err != nil {
			return nil, 0, err
		}
		// Unmarshal roles JSON
		if err := json.Unmarshal(rolesJson, &user.Roles); err != nil {
			return nil, 0, err
		}
		users = append(users, &user)
	}

	return users, total, nil
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	query := `
		INSERT INTO users (id, name, email, password)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.pool.Exec(ctx, query, user.ID, user.Name, user.Email, user.Password)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) (*entity.User, error) {
	query := `
		UPDATE users
		SET name = $1, email = $2
		WHERE id = $3
	`
	_, err := r.pool.Exec(ctx, query, user.Name, user.Email, user.ID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) UpdatePassword(ctx context.Context, id, hashedPassword string) error {
	query := `UPDATE users SET password = $1 WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, hashedPassword, id)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *UserRepository) AssignRole(ctx context.Context, userID, roleID string) error {
	query := `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.pool.Exec(ctx, query, userID, roleID)
	return err
}

func (r *UserRepository) RemoveRole(ctx context.Context, userID, roleID string) error {
	query := `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`
	_, err := r.pool.Exec(ctx, query, userID, roleID)
	return err
}
