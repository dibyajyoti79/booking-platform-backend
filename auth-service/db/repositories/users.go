package db

import (
	"AuthService/models"
	"database/sql"
	"fmt"
	"time"
)

type UserRepository interface {
	GetByID(id string) (*models.User, error)
	Create(user *models.User) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	GetByVerificationToken(token string) (*models.User, error)
	UpdateVerificationToken(id int64, token string, expiresAt time.Time, hashedPassword string) error
	MarkEmailVerified(id int64) error
	UpdateRole(id int64, role string) error
	GetAll() ([]*models.User, error)
	DeleteByID(id int64) error
}

type UserRepositoryImpl struct {
	db *sql.DB
}

func NewUserRepository(_db *sql.DB) UserRepository {
	return &UserRepositoryImpl{
		db: _db,
	}
}

func (u *UserRepositoryImpl) Create(user *models.User) (*models.User, error) {
	query := `INSERT INTO users (name, email, password, role, email_verified, email_verification_token, email_verification_token_expires_at)
	          VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := u.db.Exec(query,
		user.Name, user.Email, user.Password, user.Role,
		user.EmailVerified, user.EmailVerificationToken, user.EmailVerificationTokenExpiresAt)

	if err != nil {
		return nil, err
	}

	lastInsertID, rowErr := result.LastInsertId()
	if rowErr != nil {
		return nil, rowErr
	}

	user.Id = lastInsertID
	return user, nil
}

func (u *UserRepositoryImpl) GetAll() ([]*models.User, error) {
	query := "SELECT id, name, email, role, created_at, updated_at FROM users"
	rows, err := u.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		if err := rows.Scan(&user.Id, &user.Name, &user.Email, &user.Role, &user.CreatedAt, &user.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (u *UserRepositoryImpl) GetByEmail(email string) (*models.User, error) {
	query := `SELECT id, name, email, password, role, email_verified, email_verification_token, email_verification_token_expires_at, created_at, updated_at
	          FROM users WHERE email = ?`
	row := u.db.QueryRow(query, email)
	user := &models.User{}
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Password, &user.Role,
		&user.EmailVerified, &user.EmailVerificationToken, &user.EmailVerificationTokenExpiresAt,
		&user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}
	return user, nil
}

func (u *UserRepositoryImpl) DeleteByID(id int64) error {
	query := "DELETE FROM users WHERE id = ?"
	result, err := u.db.Exec(query, id)

	if err != nil {
		fmt.Println("Error deleting user:", err)
		return err
	}

	rowsAffected, rowErr := result.RowsAffected()
	if rowErr != nil {
		fmt.Println("Error getting rows affected:", rowErr)
		return rowErr
	}
	if rowsAffected == 0 {
		fmt.Println("No rows were affected, user not deleted")
		return nil
	}
	fmt.Println("User deleted successfully, rows affected:", rowsAffected)
	return nil
}

func (u *UserRepositoryImpl) GetByID(id string) (*models.User, error) {
	query := "SELECT id, name, email, role, email_verified, created_at, updated_at FROM users WHERE id = ?"
	row := u.db.QueryRow(query, id)
	user := &models.User{}
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Role, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}
	return user, nil
}

func (u *UserRepositoryImpl) GetByVerificationToken(token string) (*models.User, error) {
	query := `SELECT id, name, email, role, email_verified, email_verification_token_expires_at
	          FROM users WHERE email_verification_token = ?`
	row := u.db.QueryRow(query, token)
	user := &models.User{}
	var expiresAt sql.NullTime
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Role, &user.EmailVerified, &expiresAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, err
	}
	if expiresAt.Valid {
		user.EmailVerificationTokenExpiresAt = &expiresAt.Time
	}
	return user, nil
}

func (u *UserRepositoryImpl) UpdateVerificationToken(id int64, token string, expiresAt time.Time, hashedPassword string) error {
	query := `UPDATE users SET email_verification_token = ?, email_verification_token_expires_at = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := u.db.Exec(query, token, expiresAt, hashedPassword, id)
	return err
}

func (u *UserRepositoryImpl) MarkEmailVerified(id int64) error {
	query := `UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_token_expires_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := u.db.Exec(query, id)
	return err
}

func (u *UserRepositoryImpl) UpdateRole(id int64, role string) error {
	query := `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := u.db.Exec(query, role, id)
	return err
}
