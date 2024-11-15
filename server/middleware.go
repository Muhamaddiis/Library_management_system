package main

import (
	"net/http"

	"github.com/dgrijalva/jwt-go"
)



func adminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authoriazation")
		if tokenString == "" {
			http.Error(w, "Missing Token", http.StatusUnauthorized)
		}
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})
		if err != nil || !token.Valid{
			http.Error(w, "Invalid Token", http.StatusUnauthorized)
			return
		}
		if claims.Role != "admin"{
			http.Error(w, "Unautharized access", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func jwtMiddleware(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Missing Token", http.StatusUnauthorized)
			return
		}
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Invalid Token", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	}
}