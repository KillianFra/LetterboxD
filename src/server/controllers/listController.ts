//create a list, params: name (function)
//add a movie to a list, params: listId, movieId (function) (should be a list of the current auth user, or any list if the user is an admin)
//remove a movie from a list, params: listId, movieId (function) (should be a list of the current auth user, or any list if the user is an admin)
//delete a list, params: listId (function) (should be a list of the current auth user, or any list if the user is an admin)
//get all lists for a user, params: offset (should cap at 50) (function)
//get all movies in a list, params: offset (should cap at 50) (function)
//get all lists for a movie, params: offset (should cap at 50) (function)

import cookieParser from "cookie-parser";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../../../types/types";
import * as listService from "../services/listService";

const router = express.Router();

router.use(cookieParser());

// create a list
router.post("/", authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    const { name } = req.body;
    try {
        const list = await listService.createList(name, req.user);
        res.status(201).json({ status: true, list });
    } catch (error) {
        res.status(500).json({ status: false, message: "Error creating the list" });
    }
});

// delete a list
router.delete("/:listId", authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    try {
        const listId = parseInt(req.params.listId);
        await listService.deleteList(listId, req.user);
        res.status(200).json({ status: true });
    } catch (err) {
        res.status(500).json({ status: false, message: 'Could not delete the list' });
    }
});

// get all lists for a movie
router.get('/movie/:movieId', async (req: AuthenticatedRequest, res: any) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const offset = parseInt(req.query.offset as string) || 0;
        const lists = await listService.getListsForMovie(movieId, offset);
        return res.status(200).json({ status: true, lists: lists });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Could not get the lists from this movie' });
    }
});

// remove a movie from a list
router.delete("/:listId/:movieId", authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const listId = parseInt(req.params.listId);
        await listService.removeMovieFromList(listId, movieId);
        return res.status(200).json({ status: true });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Could not delete the list' });
    }
})


// add a movie to a list
router.post('/:listId/:movieId', authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const listId = parseInt(req.params.listId);
        const list = await listService.addMovieToList(listId, movieId);
        return res.status(200).json({ status: true, list: list });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Could not add movie to list' });
    }
})

// get the movies in a list
router.get('/:listId', async (req: AuthenticatedRequest, res: any) => {
    try {
        const listId = parseInt(req.params.listId);
        const offset = parseInt(req.query.offset as string) || 0;
        const movies = await listService.getMoviesInList(listId, offset);
        return res.status(200).json({ status: true, movies: movies });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Could not retrieve list informations' });
    }
});

export default router;