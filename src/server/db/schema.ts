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
  title: varchar('title', { length: 255 }),
  originalTitle: varchar('original_title', { length: 255 }),
  overview: text('overview'),
  imdbId: varchar('imdb_id', { length: 20 }).unique(),
  backdropPath: varchar('backdrop_path', { length: 255 }),
  posterPath: varchar('poster_path', { length: 255 }),
  releaseDate: timestamp('release_date'),
  popularity: numeric('popularity'),
  voteAverage: numeric('vote_average'),
  voteCount: integer('vote_count'),
  adult: boolean('adult').default(false),
  video: boolean('video').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
});

export const reviews = pgTable('reviews', {
  rating: integer('rating').notNull(),
  body: text('body').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  movieId: integer('movie_id').references(() => movies.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  verified: boolean('verified').default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.movieId] })
}));

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
