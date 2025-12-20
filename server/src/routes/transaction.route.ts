import { Router } from 'express';
import { 
  getTransactions, 
  getTransactionStatus, 
  getTransactionCountByStatus, 
  getTransactionDetails,
  createTransaction,
  processTransactionCallback 
} from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();  

router.post('/', authenticateToken, createTransaction);
router.get('/', authenticateToken, getTransactions);
router.get('/count', authenticateToken, getTransactionCountByStatus);
router.get('/:id', authenticateToken, getTransactionDetails);
router.get('/:id/status', authenticateToken, getTransactionStatus);
router.post('/callback', authenticateToken, processTransactionCallback);

export default router;
