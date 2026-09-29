import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import pinoHttp from 'pino-http';
import path from 'path';
import fs from 'fs';
import { logger } from './config/logger';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

// Serve built frontend assets if present
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Browser HTML request handler for root and frontend SPA routes
app.get(['/', '/judging', '/results', '/admin/normalization'], (req, res, next) => {
  if (req.accepts('html') && fs.existsSync(path.join(clientDist, 'index.html'))) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  next();
});

app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback for HTML client routes
app.get('*', (req, res, next) => {
  if (req.headers.accept?.includes('text/html') && fs.existsSync(path.join(clientDist, 'index.html'))) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  next();
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };

