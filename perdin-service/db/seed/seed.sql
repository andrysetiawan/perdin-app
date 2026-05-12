-- ============================================================
-- Seed data for perdin-service
-- ============================================================
-- Passwords are bcrypt hashes of "password123"
-- ============================================================

-- ── Roles ────────────────────────────────────────────────────────────────────

INSERT INTO roles (id, name) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'admin'),
    ('a1b2c3d4-0001-4000-8000-000000000002', 'hr'),
    ('a1b2c3d4-0001-4000-8000-000000000003', 'employee')
ON CONFLICT (id) DO NOTHING;

-- ── Users ────────────────────────────────────────────────────────────────────
-- password123 = $2a$10$ZpBC2dpwHfphgU82aCSMYuRbPXkdyn5h401qX0au7SpTPIgYwffOe

INSERT INTO users (id, name, email, password) VALUES
    ('b1b2c3d4-0001-4000-8000-000000000001', 'Admin User', 'admin@perdin.com', '$2a$10$ZpBC2dpwHfphgU82aCSMYuRbPXkdyn5h401qX0au7SpTPIgYwffOe'),
    ('b1b2c3d4-0001-4000-8000-000000000002', 'HR Manager', 'hr@perdin.com', '$2a$10$ZpBC2dpwHfphgU82aCSMYuRbPXkdyn5h401qX0au7SpTPIgYwffOe'),
    ('b1b2c3d4-0001-4000-8000-000000000003', 'John Employee', 'john@perdin.com', '$2a$10$ZpBC2dpwHfphgU82aCSMYuRbPXkdyn5h401qX0au7SpTPIgYwffOe'),
    ('b1b2c3d4-0001-4000-8000-000000000004', 'Jane Employee', 'jane@perdin.com', '$2a$10$ZpBC2dpwHfphgU82aCSMYuRbPXkdyn5h401qX0au7SpTPIgYwffOe')
ON CONFLICT (id) DO NOTHING;

-- ── User Roles ───────────────────────────────────────────────────────────────

INSERT INTO user_roles (user_id, role_id) VALUES
    -- Admin
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001'),
    -- HR Manager
    ('b1b2c3d4-0001-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000002'),
    -- John = employee
    ('b1b2c3d4-0001-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000003'),
    -- Jane = employee
    ('b1b2c3d4-0001-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000003')
ON CONFLICT DO NOTHING;

-- ── Cities ───────────────────────────────────────────────────────────────────

INSERT INTO cities (id, name, latitude, longitude, province, island, is_overseas) VALUES
    ('c1c2c3d4-0001-4000-8000-000000000001', 'Jakarta', -6.2088, 106.8456, 'DKI Jakarta', 'Jawa', false),
    ('c1c2c3d4-0001-4000-8000-000000000002', 'Surabaya', -7.2575, 112.7521, 'Jawa Timur', 'Jawa', false),
    ('c1c2c3d4-0001-4000-8000-000000000003', 'Bandung', -6.9175, 107.6191, 'Jawa Barat', 'Jawa', false),
    ('c1c2c3d4-0001-4000-8000-000000000004', 'Medan', 3.5952, 98.6722, 'Sumatera Utara', 'Sumatera', false),
    ('c1c2c3d4-0001-4000-8000-000000000005', 'Makassar', -5.1477, 119.4327, 'Sulawesi Selatan', 'Sulawesi', false),
    ('c1c2c3d4-0001-4000-8000-000000000006', 'Denpasar', -8.6500, 115.2167, 'Bali', 'Bali', false),
    ('c1c2c3d4-0001-4000-8000-000000000007', 'Yogyakarta', -7.7956, 110.3695, 'DI Yogyakarta', 'Jawa', false),
    ('c1c2c3d4-0001-4000-8000-000000000008', 'Balikpapan', -1.2379, 116.8529, 'Kalimantan Timur', 'Kalimantan', false),
    ('c1c2c3d4-0001-4000-8000-000000000009', 'Jayapura', -2.5337, 140.7181, 'Papua', 'Papua', false),
    ('c1c2c3d4-0001-4000-8000-000000000010', 'Singapore', 1.3521, 103.8198, 'Singapore', 'Singapore', true)
ON CONFLICT (id) DO NOTHING;
