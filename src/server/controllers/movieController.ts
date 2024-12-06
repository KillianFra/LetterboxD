import express from 'express';
import * as movieService from '../services/movieService';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthenticatedRequest } from '../../../types/movies';

const router = express.Router();

// get All movies (50 limit)
router.get('/', async (req, res) => {
    const offset = req.query.page ? parseInt(req.query.page as string) : 0;
    const movies = await movieService.retrieveAllMovies(offset);
    res.status(200).json({status: true, movies: movies});
});

// search for movies
router.get('/search', async (req: any, res: any) => {
    const query = req.query.q
    const page = req.query.page ? req.query.page : 0
     
    if (!query) {
        res.status(400).json({status: false, message: 'Invalid search query'})
    }
    const movies = await movieService.retrieveMoviesBySearch(query, page)
    res.status(200).json({status: true, movies: movies})
}) 

router.get('/reviews', async (req, res) => {
    let movieId: number;
    let offset: number;
    try {
        movieId  = parseInt(req.query.movieId as string);
        offset = req.query.page ? parseInt(req.query.page as string) : 0;
        const reviews = await movieService.retrieveReviews(movieId, offset)
        res.status(200).json({status: true, reviews: reviews})
    }
    catch (e) {
        res.status(400).json({status: false, message: 'Invalid movie id'})
    }

})


// add review to movie
router.post('/review', authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    let {movieId, review, rating} = req.body;
    if (!movieId || !review || !rating) {
        res.status(400).json({status: false, message: 'Invalid request body'})
    }
    if (rating < 0 || rating > 5) {
        res.status(400).json({status: false, message: 'Rating must be between 0 and 5'})
    }
    try {
        movieId = parseInt(movieId as string)
        const response = await movieService.addReview(movieId, review, rating, req.user)
        res.status(200).json({status: true, response: response})
    } catch (e) {
        res.status(400).json({status: false, message: "Invalid movie id or already reviewed"})
    }
})


// update review
router.put('/review', authMiddleware, async (req: AuthenticatedRequest, res: any) => {
    let {movieId, review, rating} = req.body;
    if (!movieId || !review || !rating) {
        res.status(400).json({status: false, message: 'Invalid request body'})
    }
    if (rating < 0 || rating > 5) {
        res.status(400).json({status: false, message: 'Rating must be between 0 and 5'})
    }
    try {
        movieId = parseInt(movieId as string)
        const response = await movieService.updateReview(movieId, review, rating, req.user)
        res.status(200).json({status: true, response: response})
    } catch (e) {
        res.status(400).json({status: false, message: "Invalid movie id or review not found"})
    }
})



// get movie by id
router.get('/:id', async (req, res) => {
    let movieId: number;
    let movie;
    try {
        movieId = parseInt(req.params.id);
        movie = await movieService.retrieveMovieById(movieId)
    }catch (e) {
        res.status(400).send({status: false, message: 'Invalid movie id'})
    }
    movie ? res.status(200).json({status: true, movie: movie}) : res.status(404).json({status: false, message: 'Movie not found'})
})

//DEVELOPPMENT PURPOSES ONLY
router.get('/populate', async (_ , res) => {
    await movieService.populateMovies()
    res.send('Populating movies')
})

export default router;