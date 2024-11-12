import { movies } from "../db/schema";
import { db } from "../db/index.ts";
import { movie, movieIMDB } from "../../../types/movies.ts";
import { eq, ilike, like } from "drizzle-orm";

const insertMovie = async (movie: movie) => {
  await db
    .insert(movies)
    .values(movie)
    .catch((e) => {
      console.error(e);
    });
};

export async function retrieveAllMovies(page: number) {
    if (page < 1) {
      page = 1;
    }

    const allMovies = await db
    .select()
    .from(movies)
    .limit(50)
    .offset(page * 50);
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
  
  console.log(moviesList);
  return moviesList
}

export async function retrieveMovieById(id: number) {
  const movie = await db.select().from(movies).where(eq(movies.id, id));
  return movie;
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

