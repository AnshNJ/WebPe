import './types/express'; // Load type definitions
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import transactionRouter from './routes/transaction.route';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import errorHandlerMiddleware from './middleware/error-handler.middleware';
import requestLogger from './middleware/request-logger.middleware';
import vpaRouter from './routes/vpa.route';
import logger from './utils/logger.util';

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/vpas', vpaRouter);


app.get('/', (req: Request, res: Response) => {
  res.send('PSP Server is running');
});

// Error handler must be last middleware
app.use(errorHandlerMiddleware);
const server = app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

export default server;
