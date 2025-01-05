# Letterboxd API

Welcome to the non-official Letterboxd API documentation. This API allows you to register, login, and interact with your friends and movies.

## Features

### User Management
- **Register**: Create a new user account.
- **Login**: Authenticate a user and return a JWT token.
- **Get user details**: Retrieve the current authenticated user's details.
- **Update user details**: Update the current authenticated user's details.
- **Delete user**: Delete a user (self or any user if admin).

### Movie Management
- **Get movies**: Retrieve a list of movies.
- **Delete a movie**: Delete a movie (admin only).
- **Search movies**: Retrieve a list of movies based on a search query.
- **Get movie details**: Retrieve details of a specific movie.

### Review Management
- **Get reviews for a movie**: Retrieve a list of reviews for a specific movie.
- **Get unverified reviews**: Retrieve a list of unverified reviews to verify (admin only).
- **Verify a review**: Verify a review (admin only).
- **Add a review**: Add a review to a movie.
- **Delete a review**: Delete a review (self or all reviews of a movie if admin).
- **Update a review**: Update a review for a movie.

### Friend Management
- **Get following users**: Retrieve a list of users you are following.
- **Get followers**: Retrieve a list of your followers.
- **Add a friend**: Add a new friend.
- **Remove a friend**: Remove a friend.

### List Management
- **Create a list**: Create a new list.
- **Delete a list**: Delete a list (self or any if admin).
- **Get lists for a user**: Retrieve lists created by a specific user.
- **Get lists for a movie**: Retrieve lists that a movie is in.
- **Add a movie to a list**: Add a movie to a list.
- **Remove a movie from a list**: Remove a movie from a list.
- **Get movies in a list**: Retrieve movies in a specific list.

## API Endpoints

### User Endpoints
- `POST /u/register`: Register a new user.
- `POST /u/login`: Authenticate a user and return a JWT token.
- `GET /u/me`: Retrieve the current authenticated user's details.
- `PUT /u/`: Update the current authenticated user's details.
- `POST /u/delete`: Delete a user.

### Movie Endpoints
- `GET /movies`: Retrieve a list of movies.
- `GET /movies/search`: Retrieve a list of movies based on a search query.
- `GET /movies/{movieId}`: Retrieve details of a specific movie.
- `DELETE /movies/{movieId}`: Delete a movie (admin only).

### Review Endpoints
- `GET /movies/reviews`: Retrieve a list of reviews for a specific movie.
- `GET /movies/reviews/unverified`: Retrieve a list of unverified reviews (admin only).
- `POST /movies/reviews/verify`: Verify a review (admin only).
- `POST /movies/reviews/delete`: Delete a review (admin only for all reviews of a movie).
- `PUT /movies/review`: Update a review for a movie.
- `POST /movies/review`: Add a review to a movie.
- `POST /movies/unreview`: Remove a review from a movie.

### Friend Endpoints
- `GET /friends/following`: Retrieve a list of users you are following.
- `GET /friends/followers`: Retrieve a list of your followers.
- `POST /friends/follow`: Add a new friend.
- `POST /friends/unfollow`: Remove a friend.

### List Endpoints
- `POST /lists/`: Create a new list.
- `DELETE /lists/{listId}`: Delete a list.
- `GET /u/{userId}/lists`: Retrieve lists created by a specific user.
- `GET /lists/movie/{movieId}`: Retrieve lists that a movie is in.
- `POST /lists/{listId}/{movieId}`: Add a movie to a list.
- `DELETE /lists/{listId}/{movieId}`: Remove a movie from a list.
- `GET /lists/{listId}`: Retrieve movies in a specific list.

## Authentication

This API uses JWT for authentication. To access protected endpoints, include the JWT token in the `Authorization` header as follows:

```
Authorization: Bearer <your-token>
```

## Usage

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/KillianFra/LetterboxD.git
    cd LetterboxD
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    // Link to your database (e.g. postgres://user:password@localhost:5432/dbname)
    DATABASE_URL=your_database_url

    // JWT secret key
    JWT_SECRET=your_jwt_secret

    // for development purposes (used to populate the database with movies)
    TMDB_API_KEY=your_tmdb_api_key
    ```

4. Start the server:
    ```bash
    npm run dev
    ```

5. The API will be available at `http://localhost:3000/` by default.

For more information, refer to the [API documentation] located at `http://localhost:3000/api-docs/`.

## License

This project is licensed under the MIT License.
