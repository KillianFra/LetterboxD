import express, { Request, Response } from 'express';
import * as movieService from '../services/movieService';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../types/types';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

//DEVELOPPMENT PURPOSES ONLY
router.get('/populate', async (_, res) => {
    await movieService.populateMovies()
    res.send('Populating movies')
})

//---------------------------
router.get("/", async (req: Request & { query: { page: string } }, res: any) => {
    const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
    console.log(`[MovieController] Retrieving movies page ${page + 1}`);

    try {
        const movies = await movieService.retrieveAllMovies(page);
        console.log(`[MovieController] Successfully retrieved ${movies.length} movies`);
        res.status(200).json({ status: true, movies });
    } catch (error) {
        console.error(`[MovieController] Error retrieving movies:`, error);
        res.status(500).json({ status: false, message: "Error retrieving movies" });
    }
});

router.get('/popular', async (req: Request, res: Response) => {
    console.log(req.query);
    try {
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const movies = await movieService.retrievePopularMovies(offset, limit);
        res.status(200).json({ status: true, movies });
    } catch (e) {
        console.error(`[MovieController] Error retrieving popular movies:`, e);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/latest', async (req: Request, res: Response) => {
    try {
        const movies = await movieService.retrieveLatestMovies();
        res.status(200).json({ status: true, movies });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});


// search for movies
router.get('/search', async (req: any, res: any) => {
    const query = req.query.q ? req.query.q : null
    const page = req.query.page ? req.query.page : 0
    if (!query) {
        return res.status(400).json({ status: false, message: 'Invalid search query' })
    }
    const movies = await movieService.retrieveMoviesBySearch(query, page)
    return res.status(200).json({ status: true, movies: movies })
})

// @ts-ignore
router.delete('/:movieId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const response = await movieService.deleteMovie(movieId);
        res.status(200).json({ status: true, response });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/reviews/latest', async (req, res) => {
    try {
        const offset = req.query.offset ? parseInt(req.query.page as string) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        if (limit > 50) {
            limit = 50;
        }
        const reviews = await movieService.retrieveLatestReviews(offset, limit);
        res.status(200).json({ status: true, reviews: reviews });
    }
    catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
})

router.get('/reviews', async (req, res) => {
    let movieId: number;
    let offset: number;
    try {
        movieId = parseInt(req.query.movieId as string);
        offset = req.query.page ? parseInt(req.query.page as string) : 0;
        const reviews = await movieService.retrieveVerifiedReviews(movieId, offset)
        res.status(200).json({ status: true, reviews: reviews })
    }
    catch (e) {
        res.status(400).json({ status: false, message: 'Invalid movie id' })
    }

})

router.get('/:movieId', async (req: Request, res: Response) => {
    try {
        const movieId = parseInt(req.params.movieId);
        const movie = await movieService.retrieveMovieById(movieId);
        if (movie.length === 0) {
            res.status(404).json({ status: false, message: 'Movie not found' });
        } else {
            res.status(200).json({ status: true, movie });
        }
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/review', authMiddleware, async (req: AuthenticatedRequest & { body: { movieId: string, rating: string, review: string } }, res: any) => {
    try {
        const { movieId, rating, review } = req.body;
        if (!movieId || !rating || !review) {
            return res.status(400).json({ status: false, message: 'Invalid request' });
        }

        const parsedMovieId = parseInt(movieId as string);
        const parsedRating = parseInt(rating as string);
        const response = await movieService.addReview(parsedMovieId, review, parsedRating, req.user);
        res.status(200).json({ status: true, response });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

// @ts-ignore
router.get('/reviews/unverified', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        let offset: number;
        offset = req.query.page ? parseInt(req.query.page as string) : 0;
        const reviews = await movieService.retrieveUnverifiedReviews(offset);
        res.status(200).json({ status: true, reviews: reviews });
    } catch (e) {
        res.status(400).json({ status: false, message: 'Invalid request' });
    }
});

// @ts-ignore
router.post('/reviews/verify', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    let userId: number;
    let movieId: number;
    try {
        userId = parseInt(req.body.userId as string);
        movieId = parseInt(req.body.movieId as string);
        const response = await movieService.verifyReview(movieId, userId);
        if (response.length === 0) {
            return res.status(404).json({ status: false, message: 'Review not found' });
        }
        res.status(200).json({ status: true, response: response });
    } catch (e) {
        res.status(400).json({ status: false, message: 'Invalid request' });
    }
})

router.post('/reviews/delete', authMiddleware, async (req: AuthenticatedRequest & { body: { userId: string, movieId: string } }, res: any) => {
    const { userId, movieId } = req.body;
    if (!movieId) {
        return res.status(400).json({ status: false, message: 'Invalid request' });
    }

    if (!userId && req.user.role !== 'admin') {
        return res.status(403).json({ status: false, message: 'Forbidden, specify a userId' });
    }

    try {
        // If the user is an admin, delete all reviews for the movie
        if (!userId && req.user.role === 'admin') {
            const response = await movieService.deleteMovieReviews(parseInt(movieId as string));
            return res.status(200).json({ status: true, response });
        }

        const parsedUserId = parseInt(userId as string);
        const parsedMovieId = parseInt(movieId as string);

        if (req.user.id !== parsedUserId && req.user.role !== 'admin') {
            return res.status(403).json({ status: false, message: 'Forbidden' });
        }

        const response = await movieService.deleteUserReview(parsedMovieId, parsedUserId);
        if (response.length === 0) {
            return res.status(404).json({ status: false, message: 'Review not found' });
        }
        res.status(200).json({ status: true, response });
    } catch (e) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

export default router