-- +goose Up
-- Add name column and verification columns; remove username (MySQL)
-- Each statement runs separately (no StatementBegin/StatementEnd)
ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL AFTER email;
UPDATE users SET name = COALESCE(username, email) WHERE name IS NULL;
ALTER TABLE users MODIFY name VARCHAR(255) NOT NULL;

ALTER TABLE users
  ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN email_verification_token VARCHAR(255) NULL,
  ADD COLUMN email_verification_token_expires_at DATETIME NULL;

ALTER TABLE users DROP COLUMN username;

-- +goose Down
ALTER TABLE users ADD COLUMN username VARCHAR(255) NULL AFTER id;
UPDATE users SET username = name WHERE username IS NULL;
ALTER TABLE users MODIFY username VARCHAR(255) NOT NULL;

ALTER TABLE users
  DROP COLUMN email_verified,
  DROP COLUMN email_verification_token,
  DROP COLUMN email_verification_token_expires_at,
  DROP COLUMN name;
