import { Request } from "express";
import {
  movies,
  movieGenres,
  genres,
  users,
} from "../src/server/db/schema.ts";

type user = typeof users.$inferInsert;
type userToken = Omit<user, "password">;
type roles = typeof users.$inferInsert.role;
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

type AuthenticatedRequest = Request & {
  user: userToken;
};

export type {AuthenticatedRequest, user, userToken, roles, movie, movieGenre, genre, movieIMDB };
