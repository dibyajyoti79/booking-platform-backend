package utils

import (
	"AuthService/contextkeys"
	"AuthService/models"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"
)

func ProxyToService(targetBaseUrl string, pathPrefix string) http.HandlerFunc {
	target, err := url.Parse(targetBaseUrl)
	if err != nil {
		fmt.Println("Error parsing target URL:", err)
		return nil
	}

	proxy := httputil.NewSingleHostReverseProxy(target)
	originalDirector := proxy.Director

	proxy.Director = func(r *http.Request) {
		originalDirector(r)

		originalPath := r.URL.Path
		strippedPath := strings.TrimPrefix(originalPath, pathPrefix)

		r.URL.Host = target.Host
		r.URL.Path = target.Path + strippedPath
		r.Host = target.Host

		if user, ok := r.Context().Value(contextkeys.ContextKeyUser).(*models.User); ok {
			r.Header.Set("X-User-ID", strconv.FormatInt(user.Id, 10))
			r.Header.Set("X-User-Email", user.Email)
			r.Header.Set("X-User-Role", user.Role)
		}
	}

	return proxy.ServeHTTP
}
