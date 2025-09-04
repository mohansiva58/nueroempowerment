/**
 * Simple Node.js server functions
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Hello world endpoint
app.get('/hello', (req, res) => {
  console.log("Hello logs!");
  res.send("Hello from Node.js Server!");
});

// Start server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
