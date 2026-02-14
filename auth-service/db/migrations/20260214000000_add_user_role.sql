-- +goose Up
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'guest';

-- +goose Down
ALTER TABLE users DROP COLUMN role;
