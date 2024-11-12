import express from 'express';

//routers
import movieRouter from './server/controllers/movieController';


const app = express();
app.use(express.json());


app.get('/', (req, res) => {

});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});