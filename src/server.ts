import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';

//routers
import movieRouter from './server/controllers/movieController';
import userRouter from './server/controllers/userController';
import { authMiddleware } from './server/middleware/authMiddleware';
import cookieParser from 'cookie-parser';
import errorMiddleware from './server/middleware/errorMiddleWare';
import * as swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const swaggerDocument = YAML.load(path.join(dirname, 'openapi.yaml'));

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(cookieParser());

//error Handler
app.use(errorMiddleware);

// OpenAPI validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(dirname, 'openapi.yaml'),
  }),
);

app.use('/u', userRouter)



app.use('/movies', authMiddleware, movieRouter)
// Protected routes


app.get('/', (req, res) => {
  res.send('hello world')
});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});