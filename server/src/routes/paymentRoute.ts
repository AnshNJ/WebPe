import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import axios from 'axios';

const router = Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// The URL for the Mock NPCI Switch. You'll run this as a separate service.
const NPCI_SWITCH_URL = process.env.NPCI_SWITCH_URL || 'http://localhost:5001/process-payment';

/**
 * @route   POST /api/v1/payments/initiate
 * @desc    Initiate a new payment
 * @access  Public
 */
router.post('/initiate', async (req: Request, res: Response) => {
    const { amount, client_request_id } = req.body;

    if (!amount || !client_request_id) {
        return res.status(400).json({ message: 'Amount and client_request_id are required.' });
    }

    try {
        // Idempotency Check: See if a transaction with this client_request_id already exists.
        let transaction = await pool.query('SELECT * FROM transactions WHERE client_request_id = $1', [client_request_id]);

        if (transaction.rows.length > 0) {
            // If it exists, return the current status without creating a new transaction.
            return res.status(200).json({ 
                message: 'Transaction already processed.', 
                transaction_id: transaction.rows[0].id,
                status: transaction.rows[0].status 
            });
        }

        // 1. Create a new transaction in our database with a 'PENDING' status.
        const newTransaction = await pool.query(
            'INSERT INTO transactions (client_request_id, amount, status) VALUES ($1, $2, $3) RETURNING id, status',
            [client_request_id, amount, 'PENDING']
        );

        const transactionId = newTransaction.rows[0].id;

        // 2. Asynchronously call the Mock NPCI Switch. We don't wait for its response.
        axios.post(NPCI_SWITCH_URL, {
            transaction_id: transactionId,
            amount: amount,
            // This is the endpoint the NPCI switch will call back when it's done.
            callback_url: `${process.env.PSP_SERVER_URL}/api/v1/payments/webhook`
        }).catch((error: { message: String; }) => {
            // The switch might be down. We should have a retry mechanism or background job for this.
            console.error(`Failed to send request to NPCI Switch for transaction ${transactionId}:`, error.message);
        });

        // 3. Immediately respond to the client that the transaction is pending.
        res.status(202).json({
            message: 'Transaction pending.',
            transaction_id: transactionId,
            status: 'PENDING'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/v1/payments/status/:transaction_id
 * @desc    Client polls this endpoint to get the status of a transaction
 * @access  Public
 */
router.get('/status/:transaction_id', async (req: Request, res: Response) => {
    try {
        const { transaction_id } = req.params;
        const result = await pool.query('SELECT status FROM transactions WHERE id = $1', [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        res.json({ status: result.rows[0].status });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Webhook endpoint for the Mock NPCI Switch to send the final status
 * @access  Public (In reality, this would be secured)
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const { transaction_id, status } = req.body;
    console.log(`Received webhook for transaction ${transaction_id} with status ${status}`);
    await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', [status, transaction_id]);
    res.status(200).send('Webhook received.');
});

export default router;