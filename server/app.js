import express from 'express';
import cors from 'cors';
import marketsRouter from './routes/markets.js';
import lotsRouter from './routes/lots.js';
import buyersRouter from './routes/buyers.js';
import offersRouter from './routes/offers.js';
import miscRouter from './routes/misc.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', marketsRouter);
app.use('/api', lotsRouter);
app.use('/api', buyersRouter);
app.use('/api', offersRouter);
app.use('/api', miscRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', demo: true }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AgriLink API server running on http://localhost:${PORT}`);
});
