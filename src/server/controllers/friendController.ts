import express from "express";
import * as movieService from "../services/movieService";
import * as friendService from "../services/friendService";

const router = express.Router();

router.get("/", async (req, res) => {
  const user = req.user; //need to work on this
  if (!user) {
    res.status(401).send("Unauthorized");
    return;
  }
  const friends = await friendService.retrieveFriendsByUserId(user.id);
  res.send(friends);
});

router.get("/populate", async (_, res) => {
  await movieService.populateMovies();
  res.send("Populating movies");
});

router.get("/:id", async (req, res) => {
  let movieId: number;
  let movie;
  try {
    movieId = parseInt(req.params.id);
    movie = await movieService.retrieveMovieById(movieId);
  } catch (e) {
    res.status(400).send("Invalid id parameter");
  }
  res.send(movie);
});

export default router;
