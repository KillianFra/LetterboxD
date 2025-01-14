import { movies, reviews, users } from "../db/schema";
import { db } from "../db/index.ts";
import { movie, movieIMDB, userToken } from "../../../types/types.ts";
import { and, eq, ilike } from "drizzle-orm";

const insertMovie = async (movie: movie) => {
  await db
    .insert(movies)
    .values(movie)
    .catch((e) => {
      throw new Error(e);
    });
};

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
  let movie_id = 2;
  while (true) {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movie_id}?language=fr-FR`,
      {
        headers: {
          Authorization: "Bearer " + process.env.TMDB_API_KEY,
        },
      }
    );
    
    if (response.status !== 200) {
      movie_id++;
      continue;
    }
    const movies = (await response.json()) as movieIMDB;

    const insertedMovie: movieIMDB = {
      adult: movies.adult,
      backdropPath: movies.backdrop_path,
      originalTitle: movies.original_title,
      overview: movies.overview,
      popularity: movies.popularity,
      posterPath: movies.poster_path,
      releaseDate: movies.release_date ? new Date(movies.release_date) : null,
      title: movies.title,
      voteAverage: movies.vote_average,
      voteCount: movies.vote_count,
      imdbId: movies.imdb_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: movies.id,
      video: movies.video
    };

    try {
      await insertMovie(insertedMovie);
    } catch (e) {
      console.error(e);
    }

    movie_id++;
  }
}

