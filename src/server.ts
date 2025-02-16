import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';

//routers
import movieRouter from './server/controllers/movieController';
import userRouter from './server/controllers/userController';
import friendRouter from './server/controllers/friendController';
import listRouter from './server/controllers/listController';
import { authMiddleware } from './server/middleware/authMiddleware';
import cookieParser from 'cookie-parser';
import errorMiddleware from './server/middleware/errorMiddleWare';
import * as swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
const swaggerDocument = YAML.load(('./documentation/openapi.yaml'));
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// OpenAPI validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join('./documentation/openapi.yaml'),
  }),
);


// Public routes
app.use('/u', userRouter)
app.use('/movies', movieRouter)
app.use('/friends', authMiddleware, friendRouter)
app.use('/lists', listRouter)

// Protected routes

// Error middleware
app.use(errorMiddleware)

// Catch-all route for API docs
app.use('/', (_ , res) => {
  res.redirect('/api-docs')
})

app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});