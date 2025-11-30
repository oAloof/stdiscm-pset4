import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '@pset4/shared-types';

dotenv.config();

const logger = createLogger('api-gateway');
const app = express();
const PORT = process.env.API_GATEWAY_PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Gateway running' });
});

app.listen(PORT, () => {
  logger.info('API Gateway started');
  logger.info(`REST API listening on port ${PORT}`);
});
