import { genres, movieGenres, movies, users } from "../db/schema";

interface AuthenticatedRequest extends Request {
  user: userToken;
}

type userToken = Omit<typeof users.$inferInsert, "password">;

type user = typeof users.$inferInsert;
type roles = typeof users.$inferInsert.role;
type movie = typeof movies.$inferInsert;
type movieGenre = typeof movieGenres.$inferInsert;
type genre = typeof genres.$inferInsert;
type movieIMDB = {
    id: number;
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
    createdAt: Date;
    updatedAt: Date;
    video: boolean;

}

export type { user, roles, movie, movieGenre, genre, movieIMDB, userToken, AuthenticatedRequest };
