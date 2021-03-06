import cors from 'cors';
import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import 'dotenv/config';

import { AppError } from '@shared/errors/AppError';
import createConnection from '@shared/infra/typeorm';
import '@shared/container';

import rateLimiter from './middlewares/rateLimiter';
import { router } from './routes';

createConnection();

const app = express();

app.use(rateLimiter);

app.use(express.json());

app.use(cors());
app.use(router);

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof AppError) {
      return response.status(error.statusCode).json({ message: error.message });
    }

    return response.status(500).json({
      status: 'error',
      message: `Internal server error - ${error.message}`
    });

    next();
  }
);

export { app };
