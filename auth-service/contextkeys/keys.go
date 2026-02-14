package contextkeys

// Key type for request context (avoids collisions with other packages).
type Key string

// ContextKeyUser is the key for the authenticated user (*models.User) in context.
const ContextKeyUser Key = "user"
