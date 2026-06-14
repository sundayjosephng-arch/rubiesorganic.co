const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors({ origin: '*' })); // Allows front-end connections from any domain or local host
app.use(express.json());

// Setup our email communication channel with verification
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  pool: true,           // reuse connections for better throughput
  maxConnections: 5,
  maxMessages: 100
});

// Verify transporter on startup (fail-fast if credentials are invalid)
transporter.verify((err, success) => {
  if (err) {
    console.error('Mailer verification failed:', err);
  } else {
    console.log('Mailer is configured and ready to send messages');
  }
});

// Queue for background email jobs (Redis-backed). Configure REDIS_URL in .env if needed.
const Queue = require('bull');
const emailQueue = new Queue('emailQueue', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Primary Endpoint to process orders (now enqueues email jobs)
app.post('/api/orders', async (req, res) => {
  const { productName, clientName, clientEmail, sizeQuantity, logisticsInstructions } = req.body;

  // Simple validation check
  if (!productName || !clientName || !clientEmail || !sizeQuantity) {
    return res.status(400).json({ success: false, message: 'Missing required configuration parameters.' });
  }

  const jobPayload = {
    productName,
    clientName,
    clientEmail,
    sizeQuantity,
    logisticsInstructions: logisticsInstructions || null,
    receivedAt: Date.now()
  };

  try {
    const job = await emailQueue.add(jobPayload, { attempts: 3, backoff: 5000 });
    return res.status(202).json({ success: true, jobId: job.id, message: 'Order queued for notification.' });
  } catch (err) {
    console.error('Failed to enqueue email job:', err);
    return res.status(500).json({ success: false, message: 'Failed to queue order notifications.' });
  }
});

app.listen(PORT, () => {
  console.log(` Rubies Support System running on port ${PORT}`);
});