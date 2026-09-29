import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
