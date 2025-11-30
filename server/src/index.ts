import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


//Router
import authRouter from './routes/authRoute';
import paymentRouter from './routes/paymentRoute';


//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/payments', paymentRouter);

//DB Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

app.get("/", async(req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json({
        "message": "API is now running",
        "time": result.rows[0]
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server now running on port ${PORT}`));