package postgres

import (
	"context"
	"perdin-service/internal/domain/entity"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RoleRepository struct {
	pool *pgxpool.Pool
}

func NewRoleRepository(pool *pgxpool.Pool) *RoleRepository {
	return &RoleRepository{pool: pool}
}

func (r *RoleRepository) GetByID(ctx context.Context, id string) (*entity.Role, error) {
	query := `SELECT id, name FROM roles WHERE id = $1`

	var role entity.Role
	err := r.pool.QueryRow(ctx, query, id).Scan(&role.ID, &role.Name)
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) GetByName(ctx context.Context, name string) (*entity.Role, error) {
	query := `SELECT id, name FROM roles WHERE name = $1`

	var role entity.Role
	err := r.pool.QueryRow(ctx, query, name).Scan(&role.ID, &role.Name)
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RoleRepository) GetAll(ctx context.Context) ([]*entity.Role, error) {
	query := `SELECT id, name FROM roles ORDER BY name`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []*entity.Role
	for rows.Next() {
		var role entity.Role
		if err := rows.Scan(&role.ID, &role.Name); err != nil {
			return nil, err
		}
		roles = append(roles, &role)
	}
	return roles, nil
}

func (r *RoleRepository) Create(ctx context.Context, role *entity.Role) (*entity.Role, error) {
	query := `INSERT INTO roles (id, name) VALUES ($1, $2)`
	_, err := r.pool.Exec(ctx, query, role.ID, role.Name)
	if err != nil {
		return nil, err
	}
	return role, nil
}

func (r *RoleRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM roles WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
