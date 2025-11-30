import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

app.use(cors());
app.use(express.json());

// TODO: Set up gRPC clients to services
// TODO: Implement route handlers

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Gateway running' });
});

app.listen(PORT, () => {
  console.log('API Gateway started');
  console.log(`REST API listening on port ${PORT}`);
  console.log('Routes implementation pending');
});
