import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/conn';
import morgan from 'morgan';
import cors from 'cors';
import userRoutes from './routes/UserRoutes';
import GoalRoutes from './routes/GoalRoutes';
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
dotenv.config();

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/goal', GoalRoutes);
app.all('*', (req, res) => {
    return res.status(404).json({ message: 'Route not found' });
});

/** start server only when we have valid connection */
connectDB()
    .then(() => {
        try {
            app.listen(port, () => console.log(`Server listening & database connected on ${port}`));
        } catch (e) {
            console.log('Cannot connect to the server');
        }
    })
    .catch((e) => {
        console.log('Invalid database connection...! ', +e);
    });
