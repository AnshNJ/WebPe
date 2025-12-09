import { Router } from 'express';
import {
  initiatePayment,
  getTransactionStatus,
} from '../controllers/transaction.controller';

const router = Router();

router.post('/', initiatePayment);
router.get('/:id/status', getTransactionStatus);

export default router;