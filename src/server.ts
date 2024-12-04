import express from 'express';

//routers
import movieRouter from './server/controllers/movieController';
import userRouter from './server/controllers/userController';

const app = express();
app.use(express.json());

app.use('/movies', movieRouter)
app.use('/u', userRouter)

app.get('/', (req, res) => {
  res.send('hello world')
});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});