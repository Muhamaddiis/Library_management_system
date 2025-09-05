# 📚 Library Management System (Go + + React + PostgreSQL + JWT)

A backend REST API for managing a library system, built in **Go** with **PostgreSQL**.  
The system supports user authentication, book management, borrowing/returning books, fines, and role-based access.  
Authentication is handled using **JWT tokens stored in cookies**.

---
![Homepage](./Assets/Home.png)
![Library Dashboard](./Assets/Dashboard.png)


## 🚀 Features

- **Authentication & Authorization**
  - User signup & login
  - JWT-based authentication
  - Roles: `user` and `admin`

- **Books**
  - Add, update, delete books
  - Get all books or a single book
  - Track book availability

- **Borrowing & Returning**
  - Borrow books (updates availability)
  - Return books
  - Automatic fine calculation for late returns

- **Fines**
  - Track unpaid/paid fines
  - Update fine status

- **Users**
  - Get all users or single user
  - Update user details (role/email/username)
  - `/me` endpoint for authenticated user info

---

## 🛠 Tech Stack

- **Go** – main backend framework  
- **PostgreSQL** – relational database  
- **JWT** – authentication & session management  
- **bcrypt** – password hashing  
- **CORS middleware** – frontend-backend communication  
- **dotenv** – environment variables  

---

## 📂 Project Structure

```
.
├── main.go         # Entry point & API server
├── .env            # Environment variables
├── go.mod          # Go module file
└── README.md       # Documentation
```

---

## ⚙️ Setup & Installation

### 1. Clone repository
```bash
git clone https://github.com/yourusername/library-system-go.git
cd library-system-go
```

### 2. Install dependencies
```bash
go mod tidy
```

### 3. Configure `.env`
Create a `.env` file in the project root:
```
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgres://username:password@localhost:5432/librarydb?sslmode=disable
```

### 4. Database setup
Run PostgreSQL and create required tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    availability BOOLEAN DEFAULT TRUE,
    image TEXT
);

CREATE TABLE borrowings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    book_id INT REFERENCES books(id),
    borrow_date TIMESTAMP,
    return_date TIMESTAMP,
    due_date TIMESTAMP,
    renewed BOOLEAN DEFAULT FALSE
);

CREATE TABLE fines (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    book_id INT REFERENCES books(id),
    fine_amount NUMERIC(10,2),
    fine_date DATE,
    status VARCHAR(20) DEFAULT 'Unpaid'
);
```

### 5. Run server
```bash
go run main.go
```

Server will start on:
```
http://localhost:8080
```

---

## 📡 API Endpoints

### Auth
- `POST /signup` → Register new user
- `POST /login` → Login (returns JWT token + cookie)
- `GET /me` → Get authenticated user info

### Books
- `GET /books` → Get all books
- `GET /books/{id}` → Get book by ID
- `POST /books` → Add new book
- `PUT /books/{id}` → Update book
- `DELETE /books/{id}` → Delete book

### Borrowing
- `POST /borrow/{id}` → Borrow a book
- `POST /return/{id}` → Return a book
- `GET /borrowings` → List borrowings

### Fines
- `GET /fines` → Get all fines
- `GET /fines/{id}` → Get fines by user ID
- `PATCH /fines/{id}` → Update fine payment status

### Users
- `GET /users` → Get all users
- `GET /users/{id}` → Get user by ID
- `PUT /updateUser/{id}` → Update user details

---

## 🔒 Authentication Notes

- JWT tokens are stored in **HTTP-only cookies**.
- Protected routes (`/borrow`, `/return`, `/me`) require valid authentication.

---

## 🎯 Future Improvements

- Add **pagination** for books and users  
- Role-based restrictions (`admin` vs `user`)  
- Add support for **book renewals**  
- Dockerize for easier deployment  

---

## 👨‍💻 Author
Built with ❤️ in Go by Muhamaddiis.  
