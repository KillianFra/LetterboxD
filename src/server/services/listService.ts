//create a list, params: name (function)
//add a movie to a list, params: listId, movieId (function) (should be a list of the current auth user, or any list if the user is an admin)
//remove a movie from a list, params: listId, movieId (function) (should be a list of the current auth user, or any list if the user is an admin)
//delete a list, params: listId (function) (should be a list of the current auth user, or any list if the user is an admin)
//get all lists for a user, params: offset (should cap at 50) (function)
//get all movies in a list, params: offset (should cap at 50) (function)
//get all lists for a movie, params: offset (should cap at 50) (function)

import { and, eq } from "drizzle-orm";
import { userToken } from "../../../types/types";
import { db } from "../db";
import { movieListMovies, movieLists, movies } from "../db/schema";

export function createList(name: string, user: userToken) {
    return db.insert(movieLists).values({
        name,
        userId: user.id!
    }).returning({ id: movieLists.id, name: movieLists.name, userId: movieLists.userId });
}

export async function addMovieToList(listId: number, movieId: number) {
    //verify that the list belongs to the user
    const list = await db.select({ id: movieLists.id, userId: movieLists.userId })
    .from(movieLists)
    .where(eq(movieLists.id, listId))
    .limit(1);
    
    if (list.length === 0) {
        throw new Error('List not found');
    }
    
    return db.insert(movieListMovies).values({
        listId,
        movieId
    }).returning({ listId: movieListMovies.listId, movieId: movieListMovies.movieId });
}

export async function removeMovieFromList(listId: number, movieId: number) {
    //verify that the list belongs to the user
    const list = await db.select({ id: movieLists.id, userId: movieLists.userId })
    .from(movieLists)
    .where(eq(movieLists.id, listId))
    .limit(1);

    if (list.length === 0) {
        throw new Error('List not found');
    }

    return db.delete(movieListMovies).where(
        and(
            eq(movieListMovies.listId, listId),
            eq(movieListMovies.movieId, movieId)
        )
    );
}

export async function deleteList(listId: number, user: userToken) {
    if (user.role !== 'admin') {
        // check if the list belongs to the user
        const list = await db.select({ id: movieLists.id, userId: movieLists.userId })
        .from(movieLists)
        .where(and(eq(movieLists.id, listId), eq(movieLists.userId, user.id!)))
        .limit(1);

        if (list.length === 0) {
            throw new Error('List not found');
        }
    }

    // Delete associated entries in movie_list_movies
    await db.delete(movieListMovies).where(eq(movieListMovies.listId, listId));

    // Delete the list
    return db.delete(movieLists).where(eq(movieLists.id, listId)).catch((err) => {
        throw new Error(err);
    });
}

export async function getListsFromUser(offset: number, userId: number) {
    const lists = await db.select({
        id: movieLists.id,
        name: movieLists.name,
        userId: movieLists.userId
    }).from(movieLists).where(eq(movieLists.userId, userId)).limit(50).offset(offset * 50);

    const listsWithMovies = await Promise.all(lists.map(async (list) => {
        const moviesInList = await db.select({
            movieId: movieListMovies.movieId,
            title: movies.title
        }).from(movieListMovies)
        .innerJoin(movies, eq(movieListMovies.movieId, movies.id))
        .where(eq(movieListMovies.listId, list.id));

        return {
            ...list,
            movies: moviesInList
        };
    }));
    return listsWithMovies;
}

export async function getMoviesInList(listId: number, offset: number) {
    // Get the list details
    const listDetails = await db.select({
        id: movieLists.id,
        name: movieLists.name,
        createdAt: movieLists.createdAt
    }).from(movieLists).where(eq(movieLists.id, listId)).limit(1);

    if (listDetails.length === 0) {
        throw new Error('List not found');
    }

    // Get the movies in the list
    const moviesInList = await db.select({
        movieId: movieListMovies.movieId,
        title: movies.title
    }).from(movieListMovies)
    .innerJoin(movies, eq(movieListMovies.movieId, movies.id))
    .where(eq(movieListMovies.listId, listId))
    .limit(50)
    .offset(offset * 50);

    return {
        id: listDetails[0].id,
        name: listDetails[0].name,
        createdAt: listDetails[0].createdAt,
        movies: moviesInList
    };
}

export function getListsfromUser(userId: number, offset: number) {
    return db.select({
        id: movieLists.id,
        name: movieLists.name,
        userId: movieLists.userId
    }).from(movieLists).where(eq(movieLists.userId, userId)).limit(50).offset(offset * 50);
}

export async function getListsForMovie(movieId: number, offset: number = 0) {
    return db.select({
        name: movieLists.name,
        listId: movieListMovies.listId,
        movieId: movieListMovies.movieId,
    }).from(movieListMovies)
    .innerJoin(movieLists, eq(movieListMovies.listId, movieLists.id))
    .where(eq(movieListMovies.movieId, movieId))
    .limit(50)
    .offset(offset * 50);
}
