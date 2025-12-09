import express, { Express, Request, Response } from 'express';
import transactionRouter from './routes/transaction.route';

const app: Express = express();
const port = process.env.NPCI_PORT || 3002;

app.use(express.json());

app.use('/api', transactionRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Mock NPCI Server is running');
});

app.listen(port, () => {
  console.log(`[npci-server]: Server is running at http://localhost:${port}`);
});
