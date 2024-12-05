import express from 'express';
import * as movieService from '../services/movieService';

const router = express.Router();

router.get('/', async (req, res) => {
    const offset = req.query.page ? parseInt(req.query.page as string) : 0;
    const movies = await movieService.retrieveAllMovies(offset);
    res.send(movies);
});

router.get('/search', async (req: any, res: any) => {
    const query = req.query.q
    const page = req.query.page ? req.query.page : 0
     
    if (!query) {
        res.status(400).send('No query found')
    }
    const movies = await movieService.retrieveMoviesBySearch(query, page)
    res.send(movies)
}) 


router.get('/populate', async (_ , res) => {
    await movieService.populateMovies()
    res.send('Populating movies')
})

router.get('/:id', async (req, res) => {
    let movieId: number;
    let movie;
    try {
        movieId = parseInt(req.params.id);
        movie = await movieService.retrieveMovieById(movieId)
    }catch (e) {
        res.status(400).send('Invalid id parameter')
    }
    res.send(movie);
})

export default router;