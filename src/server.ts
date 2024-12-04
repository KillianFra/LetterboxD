import express from 'express';

//routers
import movieRouter from './server/controllers/movieController';
import userRouter from './server/controllers/userController';
import { authMiddleware } from './server/middleware/authMiddleware';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/u', userRouter)

// Protected routes
app.use('/movies',authMiddleware, movieRouter)

app.get('/', (req, res) => {
  res.send('hello world')
});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});