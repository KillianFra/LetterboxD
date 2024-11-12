import {
  movies,
  productionCompanies,
  productionCountries,
  movieGenres,
  genres,
} from "../src/server/db/schema.ts";

type movie = typeof movies.$inferInsert;
type productionCompany = typeof productionCompanies.$inferInsert;
type productionCountry = typeof productionCountries.$inferInsert;
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

export type { movie, productionCompany, productionCountry, movieGenre, genre, movieIMDB };
