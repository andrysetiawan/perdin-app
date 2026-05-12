DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS trigger_travel_requests_updated_at ON travel_requests;

DROP FUNCTION IF EXISTS set_updated_at;