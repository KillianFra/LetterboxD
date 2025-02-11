import { db } from "../db";
import { movies, reviews, users } from "../db/schema";
import { movie, movieIMDB, userToken } from "../types/types";
import { and, desc, eq, ilike } from "drizzle-orm";

const insertMovie = async (movie: movie) => {
  await db
    .insert(movies)
    .values(movie)
    .catch((e) => {
      throw new Error(e);
    });
};

export async function retrieveLatestMovies() {
  const moviesList = await db
    .select()
    .from(movies)
    .orderBy(desc(movies.releaseDate))
    .limit(5)
    .catch((e) => {
      throw new Error(e);
    });
  return moviesList;
}

export async function retrievePopularMovies(offset: number, limit: number) {
  const moviesList = await db
    .select()
    .from(movies)
    .orderBy(desc(movies.popularity))
    .limit(limit ? limit : 5)
    .offset(offset ? offset * 50: 0)
    .catch((e) => {
      throw new Error(e);
    });
  return moviesList;
}



export async function deleteMovie(movieId: number) {
  const movieResponse = await db
    .delete(movies)
    .where(eq(movies.id, movieId))
    .returning()
    .catch((e) => {
      throw new Error(e);
    });
  return movieResponse;
}

export async function addReview(movieId: number, review: string, rating: number, user: userToken) {
  const reviewResponse = await db
    .insert(reviews)
    .values({
      movieId,
      body: review,
      rating: rating,
      userId: user.id!,
      createdAt: new Date(),
    }).returning()
    .catch((e) => {
      throw new Error(e);
    });
  return reviewResponse;
}


export async function updateReview(movieId: number, review: string, rating: number, user: userToken) {
  const reviewResponse = await db
    .update(reviews)
    .set({
      body: review,
      rating: rating,
    })
    .where(and(eq(reviews.movieId, movieId), eq(reviews.userId, user.id!)))
    .returning()
    .catch((e) => {
      throw new Error(e);
    });
  return reviewResponse;
}

export async function retrieveLatestReviews(offset: number, limit: number) {
  const reviewsList = await db
    .select()
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .where(eq(reviews.verified, true))
    .leftJoin(movies, eq(reviews.movieId, movies.id))
    .limit(limit ? limit : 5)
    .offset(offset ? offset * 50 : 0)
    .catch((e) => {
      throw new Error(e);
    });
  return reviewsList;
}


export async function retrieveVerifiedReviews(movieId: number, offset: number) {
  const reviewsList = await db
    .select({
      review: reviews.body,
      rating: reviews.rating,
      createdAt: reviews.createdAt,
      name: users.username,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(eq(reviews.movieId, movieId), eq(reviews.verified, true)))
    .limit(50)
    .offset(offset * 50)
    .catch((e) => {
      throw new Error(e);
    });
  return reviewsList;
}

// get all the unverified reviews for the admin to verify
export async function retrieveUnverifiedReviews(offset: number) {
  const reviewsList = await db
      .select({
          review: reviews.body,
          rating: reviews.rating,
          createdAt: reviews.createdAt,
          name: users.username,
          verified: reviews.verified,
          userId: users.id,
          movieId: reviews.movieId
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id)) // Join with users table
      .where(eq(reviews.verified, false))
      .limit(50)
      .offset(offset * 50)
      .catch((e) => {
          throw new Error(e);
      });
  return reviewsList;
}

export async function verifyReview(movieId: number, userId: number) {
  const reviewResponse = await db
    .update(reviews)
    .set({
      verified: true,
    })
    .where(and(eq(reviews.movieId, movieId), eq(reviews.userId, userId)))
    .returning()
    .catch((e) => {
      throw new Error(e);
    })
  return reviewResponse;
}

export async function deleteUserReview(movieId: number, userId: number) {
  const reviewResponse = await db
    .delete(reviews)
    .where(and(eq(reviews.movieId, movieId), eq(reviews.userId, userId)))
    .returning()
    .catch((e) => {
      throw new Error(e);
    });
  return reviewResponse;
}

export async function deleteMovieReviews(movieId: number) {
  const reviewResponse = await db
    .delete(reviews)
    .where(eq(reviews.movieId, movieId))
    .returning()
    .catch((e) => {
      throw new Error(e);
    });
  return reviewResponse;
}

export async function retrieveAllMovies(page: number) {
    if (page < 1) {
      page = 1;
    }
    const allMovies = await db
    .select()
    .from(movies)
    .limit(50)
    .offset(page * 50)
    .catch((e) => {
      throw new Error(e);
    });
  return allMovies;
}

export async function retrieveMoviesBySearch(query: string, page: number) {
  const offset: number = page ? page : 0
  if (!query) {
    return
  }
  const moviesList = await db
  .select()
  .from(movies)
  .where(ilike(movies.title, `%${query}%`))
  .limit(50)
  .offset(offset * 50)
  .execute()
  return moviesList
}

export async function retrieveMovieById(id: number) {
  const movie = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
  return movie[0];
}

//FOR DEVELOPMENT PURPOSES ONLY
export async function populateMovies() {
  const batchSize = 50; // Number of concurrent requests
  let movie_id = 2;
  const maxMovies = 500000; // Safety limit

  while (movie_id < maxMovies) {
    const promises = [];
    
    // Create a batch of promises
    for (let i = 0; i < batchSize; i++) {
      const currentId = movie_id++;
      promises.push(
        fetch(
          `https://api.themoviedb.org/3/movie/${currentId}?language=fr-FR`,
          {
            headers: {
              Authorization: "Bearer " + process.env.TMDB_API_KEY,
            },
          }
        ).then(async (response) => {
          if (response.status === 200) {
            const movie = await response.json();
            const insertedMovie: movieIMDB = {
              id: movie.id,
              imdbId: movie.imdb_id,
              adult: movie.adult,
              backdropPath: movie.backdrop_path,
              originalTitle: movie.original_title,
              overview: movie.overview,
              popularity: movie.popularity,
              posterPath: movie.poster_path,
              releaseDate: movie.release_date ? new Date(movie.release_date) : null,
              title: movie.title,
              voteAverage: movie.vote_average,
              voteCount: movie.vote_count,
              createdAt: new Date(),
              updatedAt: new Date(),
              video: movie.video
            };
            return insertMovie(insertedMovie as unknown as movie).catch(console.error);
          }
        }).catch(console.error)
      );
    }

    // Wait for all requests in the batch to complete
    await Promise.all(promises);
  }
}

