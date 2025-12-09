import { Router } from 'express';
import { handleTransaction } from '../controllers/transaction.controller';

const router = Router();

router.post('/process-payment', handleTransaction);

export default router;
