import { 
  pgTable, 
  serial, 
  integer, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  numeric, 
  pgEnum,
  primaryKey, 
  foreignKey,
} from 'drizzle-orm/pg-core';

// Existing Enum and Tables
export const rolesEnum = pgEnum("roles", ["guest", "user", "admin"]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique(),
  role: rolesEnum('role').notNull().default('user'),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const movies = pgTable('movies', {
  id: serial('id').primaryKey(),
  imdbId: text('imdb_id'),
  adult: boolean('adult'),
  backdropPath: text('backdrop_path'),
  originalTitle: text('original_title'),
  overview: text('overview'),
  popularity: numeric('popularity'),
  posterPath: text('poster_path'),
  releaseDate: timestamp('release_date'),
  title: text('title'),
  voteAverage: numeric('vote_average'),
  voteCount: numeric('vote_count'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  video: boolean('video')
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  rating: integer('rating').notNull(),
  body: text('body').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  movieId: integer('movie_id').references(() => movies.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  verified: boolean('verified').default(false),
});

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
});

export const movieGenres = pgTable('movie_genres', {
  movieId: integer('movie_id').references(() => movies.id).notNull(),
  genreId: integer('genre_id').references(() => genres.id).notNull(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  body: text('body').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  movieId: integer('movie_id').references(() => movies.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const friends = pgTable('friends', {
  userId: integer('user_id').references(() => users.id).notNull(),
  friendId: integer('friend_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.friendId] }),
}));

export const movieLists = pgTable('movie_lists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const movieListMovies = pgTable('movie_list_movies', {
  listId: integer('list_id').references(() => movieLists.id).notNull(),
  movieId: integer('movie_id').references(() => movies.id).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.listId, table.movieId] }),
}));
