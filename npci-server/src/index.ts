import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import paymentRouter from './routes/payment.route';
import errorHandlerMiddleware from './middleware/error-handler.middleware';
import requestLogger from './middleware/request-logger.middleware';
import logger from './utils/logger.util';

const app: Express = express();
const port = config.port;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/v1', paymentRouter);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('NPCI Mock Server is running');
});

app.use(errorHandlerMiddleware);

const server = app.listen(port, () => {
  logger.info(`NPCI Mock Server is running at http://localhost:${port}`);
  logger.info(`Configuration:`, {
    successRate: config.successRate,
    processingDelay: `${config.minProcessingDelayMs}-${config.maxProcessingDelayMs}ms`,
  });
});

export default server;
