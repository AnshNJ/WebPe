import { Router } from 'express';
import { processPaymentController } from '../controllers/payment.controller';

const router = Router();

router.post('/process-payment', processPaymentController);

export default router;

