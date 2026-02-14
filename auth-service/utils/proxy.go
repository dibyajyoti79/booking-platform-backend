package utils

import (
	"AuthService/contextkeys"
	"AuthService/models"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
)

// Header names forwarded to upstream (use same constants in downstream services).
const (
	HeaderXUserID    = "X-User-ID"
	HeaderXUserEmail = "X-User-Email"
	HeaderXUserRole  = "X-User-Role"
)

func ProxyToService(serviceBaseURL string) http.HandlerFunc {
	target, err := url.Parse(serviceBaseURL)
	if err != nil {
		log.Printf("[proxy] invalid service URL %q: %v", serviceBaseURL, err)
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"status":"error","message":"Proxy misconfigured"}`))
		}
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	origDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		origDirector(r)
		addUserHeaders(r)
	}
	return proxy.ServeHTTP
}

func addUserHeaders(r *http.Request) {
	if user, ok := r.Context().Value(contextkeys.ContextKeyUser).(*models.User); ok {
		r.Header.Set(HeaderXUserID, strconv.FormatInt(user.Id, 10))
		r.Header.Set(HeaderXUserEmail, user.Email)
		r.Header.Set(HeaderXUserRole, user.Role)
	}
}
