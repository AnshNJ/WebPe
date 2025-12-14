import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import transactionRouter from './routes/transaction.route';
// import { PrismaClient } from '@prisma/client';

const app: Express = express();
const port = process.env.PORT || 3001;
// const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('PSP Server is running');
});

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default server;
