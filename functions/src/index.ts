/**
 * Simple TypeScript server functions
 */

import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'TypeScript Server is running' });
});

// Hello world endpoint
app.get('/hello', (req, res) => {
  console.log("Hello logs from TypeScript!");
  res.send("Hello from TypeScript Node.js Server!");
});

// Start server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`TypeScript Server running on http://localhost:${port}`);
  });
}

export default app;
