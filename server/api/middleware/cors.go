package middleware

import (
  "github.com/wgentry2/ers-ngrx/server/internal/logger"
  "net/http"
)

func Cors(next http.HandlerFunc) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    configureHeaders(&w, r)
    logger.WithContext(r.Context()).Infof("%s request to %s originating from %s", r.Method, r.RequestURI, r.RemoteAddr)
    if r.Method == http.MethodOptions {
      return
    }
    next(w, r)
  }
}

func configureHeaders(w *http.ResponseWriter, r *http.Request) {
  (*w).Header().Set("Access-Control-Allow-Headers", "Accept, Keep-Alive, User-Agent, X-Requested-With, If-Modified-Since, Cache-Control, Content-Type, Authorization, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Credentials, Access-Control-Allow-Headers")
  (*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
  (*w).Header().Set("Access-Control-Allow-Credentials", "true")
  (*w).Header().Set("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, OPTIONS")
}
