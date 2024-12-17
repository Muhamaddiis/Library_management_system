package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
)



func adminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			http.Error(w, "Missing Token", http.StatusUnauthorized)
			return
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
			http.Error(w, "Unauthorized access", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func jwtMiddleware(next http.Handler) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Retrieve the Authorization header
        tokenString := r.Header.Get("Authorization")
        if tokenString == "" {
            http.Error(w, "Missing Token", http.StatusUnauthorized)
            return
        }

        // Ensure the token includes "Bearer " prefix
        if !strings.HasPrefix(tokenString, "Bearer ") {
            http.Error(w, "Invalid Token Format", http.StatusUnauthorized)
            return
        }

        // Remove the "Bearer " prefix to get the token
        tokenString = strings.TrimPrefix(tokenString, "Bearer ")

        // Parse the token and validate claims
        claims := &Claims{}
        token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
            // Ensure the signing method is correct
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return secretKey, nil
        })

        // Handle token parsing errors or invalid tokens
        if err != nil || !token.Valid {
            http.Error(w, "Invalid Token", http.StatusUnauthorized)
            return
        }

        // Token is valid, pass control to the next handler
        next.ServeHTTP(w, r)
    }
}
