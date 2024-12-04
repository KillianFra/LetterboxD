import {
  movies,
  movieGenres,
  genres,
  users,
} from "../src/server/db/schema.ts";

type user = typeof users.$inferInsert;
type movie = typeof movies.$inferInsert;
type movieGenre = typeof movieGenres.$inferInsert;
type genre = typeof genres.$inferInsert;
type movieIMDB = {
    adult: boolean;
    backdropPath: string;
    originalTitle: string;
    overview: string;
    popularity: number;
    posterPath: string;
    releaseDate: Date | null;
    title: string;
    voteAverage: number;
    voteCount: number;
    imdbId: string;
    createdAt: Date;
    updatedAt: Date;
    id: number;
    video: boolean;

}

export type {user, movie, movieGenre, genre, movieIMDB };
