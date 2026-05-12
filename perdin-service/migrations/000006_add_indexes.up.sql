CREATE INDEX idx_travel_requests_user_id
ON travel_requests (user_id);

CREATE INDEX idx_travel_requests_status
ON travel_requests (status);

CREATE INDEX idx_travel_requests_start_date
ON travel_requests (start_date DESC);