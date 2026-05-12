CREATE TABLE travel_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    purpose TEXT NOT NULL,

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    origin_city_id UUID NOT NULL,
    destination_city_id UUID NOT NULL,

    duration_days INT NOT NULL,

    distance_km DOUBLE PRECISION NOT NULL,

    allowance_per_day DOUBLE PRECISION NOT NULL,
    total_allowance DOUBLE PRECISION NOT NULL,

    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED

    approved_by UUID NULL,
    approved_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (origin_city_id) REFERENCES cities(id),
    FOREIGN KEY (destination_city_id) REFERENCES cities(id)
);