/**
 * Payment Gateway Server
 * Handles webhook endpoints and payment processing
 *
 * CashApp: $imthepanda
 * PayPal: pandamonsterrrr@yahoo.com
 */

const express = require('express');
const bodyParser = require('body-parser');
const PaymentIntegration = require('./payment-integration');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize payment integration
const payments = new PaymentIntegration();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize payment gateways on startup
payments.initialize().then(status => {
  console.log('Payment gateways initialized:', status);

  // Validate configuration
  const validation = payments.validateConfiguration();
  if (!validation.valid) {
    console.error('Configuration errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:', validation.warnings);
  }
}).catch(error => {
  console.error('Failed to initialize payment gateways:', error);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    gateways: {
      cashapp: payments.cashappConfig.enabled,
      paypal: payments.paypalConfig.enabled
    }
  });
});

// PayPal IPN endpoint
app.post('/paypal/ipn', (req, res) => {
  console.log('PayPal IPN received');
  payments.paypalIPN.handleIPNRequest(req, res);
});

// Payment webhook endpoints
app.post('/webhooks/payment-completed', async (req, res) => {
  try {
    const { amount, gateway, transactionId } = req.body;

    await payments.trackRevenue(amount, gateway, transactionId);

    res.json({
      success: true,
      message: 'Payment completed webhook processed'
    });
  } catch (error) {
    console.error('Error processing payment completed webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/webhooks/payment-failed', (req, res) => {
  console.log('Payment failed webhook received:', req.body);
  res.json({
    success: true,
    message: 'Payment failed webhook processed'
  });
});

app.post('/webhooks/refund-issued', (req, res) => {
  console.log('Refund issued webhook received:', req.body);
  res.json({
    success: true,
    message: 'Refund webhook processed'
  });
});

// API endpoints
app.get('/api/payment-urls', (req, res) => {
  const amount = req.query.amount || null;
  const note = req.query.note || null;

  res.json({
    cashapp: payments.getCashAppPaymentUrl(amount, note),
    paypal: amount ? payments.getPayPalPaymentUrl(amount) : null,
    cashTag: payments.cashappConfig.cashTag,
    paypalEmail: payments.paypalConfig.email
  });
});

app.get('/api/payment-buttons', (req, res) => {
  const amount = req.query.amount || null;
  const buttons = payments.generatePaymentButtons(amount);
  res.json(buttons);
});

app.get('/api/analytics', (req, res) => {
  const analytics = payments.getAnalytics();
  res.json(analytics);
});

app.get('/api/export', (req, res) => {
  const format = req.query.format || 'json';
  const data = payments.exportTransactions(format);

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
  } else {
    res.setHeader('Content-Type', 'application/json');
  }

  res.send(data);
});

app.post('/api/optimize', async (req, res) => {
  try {
    const result = await payments.optimizeForProfit();
    res.json(result);
  } catch (error) {
    console.error('Error optimizing for profit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    cashapp: {
      enabled: payments.cashappConfig.enabled,
      cashTag: payments.cashappConfig.cashTag,
      version: payments.cashappConfig.version,
      features: payments.cashappConfig.features
    },
    paypal: {
      enabled: payments.paypalConfig.enabled,
      email: payments.paypalConfig.email,
      version: payments.paypalConfig.version,
      ipnEnabled: payments.paypalConfig.ipn.enabled,
      features: payments.paypalConfig.features
    }
  });
});

// Static HTML landing page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Payment Gateway Integration</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    .payment-method {
      margin: 20px 0;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #4CAF50;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      margin: 10px 5px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .button:hover {
      background: #45a049;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .stat-card {
      background: #e8f5e9;
      padding: 15px;
      border-radius: 5px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Payment Gateway Integration</h1>
    <p>Integrated payment gateways with profit maximization features</p>

    <div class="payment-method">
      <h2>CashApp</h2>
      <p><strong>Cash Tag:</strong> ${payments.cashappConfig.cashTag}</p>
      <p><strong>Version:</strong> ${payments.cashappConfig.version}</p>
      <a href="https://cash.app/${payments.cashappConfig.cashTag}" class="button" target="_blank">
        Pay with Cash App
      </a>
    </div>

    <div class="payment-method">
      <h2>PayPal</h2>
      <p><strong>Email:</strong> ${payments.paypalConfig.email}</p>
      <p><strong>Version:</strong> ${payments.paypalConfig.version}</p>
      <p><strong>IPN Enabled:</strong> ${payments.paypalConfig.ipn.enabled ? 'Yes' : 'No'}</p>
      <form action="https://www.paypal.com/donate" method="post" target="_blank" style="display: inline;">
        <input type="hidden" name="business" value="${payments.paypalConfig.email}" />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="submit" value="Donate with PayPal" class="button" />
      </form>
    </div>

    <h2>Features</h2>
    <div class="stats">
      <div class="stat-card">
        <h3>IPN 2.0</h3>
        <p>Real-time payment notifications</p>
      </div>
      <div class="stat-card">
        <h3>Analytics</h3>
        <p>Revenue tracking & reporting</p>
      </div>
      <div class="stat-card">
        <h3>Optimization</h3>
        <p>Profit maximization enabled</p>
      </div>
      <div class="stat-card">
        <h3>Security</h3>
        <p>Encrypted & fraud protected</p>
      </div>
    </div>

    <h2>API Endpoints</h2>
    <ul>
      <li><a href="/api/config">Configuration</a></li>
      <li><a href="/api/analytics">Analytics</a></li>
      <li><a href="/api/payment-urls">Payment URLs</a></li>
      <li><a href="/api/export?format=json">Export Data (JSON)</a></li>
      <li><a href="/api/export?format=csv">Export Data (CSV)</a></li>
    </ul>
  </div>
</body>
</html>
  `);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Payment gateway server running on port ${PORT}`);
  console.log(`CashApp: ${payments.cashappConfig.cashTag}`);
  console.log(`PayPal: ${payments.paypalConfig.email}`);
  console.log(`Visit http://localhost:${PORT} to view the payment integration`);
});

module.exports = app;
