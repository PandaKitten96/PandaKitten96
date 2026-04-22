/**
 * PayPal IPN (Instant Payment Notification) Handler
 * Version: 2.0
 *
 * This handler processes PayPal IPN notifications for real-time payment tracking
 * and automatic payment verification.
 *
 * Email: pandamonsterrrr@yahoo.com
 * IPN Version: 2.0
 */

const https = require('https');
const querystring = require('querystring');

class PayPalIPNHandler {
  constructor(config) {
    this.config = config || require('./paypal-config.json');
    this.email = this.config.email;
    this.ipnUrl = this.config.ipn.url;
    this.sandboxUrl = this.config.ipn.sandboxUrl;
    this.maxRetries = this.config.ipn.maxRetries || 5;
  }

  /**
   * Verify IPN message with PayPal
   * @param {Object} ipnData - The IPN POST data
   * @param {Boolean} sandbox - Whether to use sandbox environment
   * @returns {Promise<Boolean>} - Verification result
   */
  async verifyIPN(ipnData, sandbox = false) {
    return new Promise((resolve, reject) => {
      // Prepare verification request
      const verifyData = querystring.stringify({
        cmd: '_notify-validate',
        ...ipnData
      });

      const options = {
        hostname: sandbox ? 'ipnpb.sandbox.paypal.com' : 'ipnpb.paypal.com',
        port: 443,
        path: '/cgi-bin/webscr',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(verifyData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (body === 'VERIFIED') {
            resolve(true);
          } else if (body === 'INVALID') {
            resolve(false);
          } else {
            reject(new Error('Unexpected IPN verification response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(verifyData);
      req.end();
    });
  }

  /**
   * Process verified IPN notification
   * @param {Object} ipnData - Verified IPN data
   * @returns {Object} - Processing result
   */
  async processIPN(ipnData) {
    try {
      // Verify receiver email matches configured email
      if (ipnData.receiver_email !== this.email) {
        throw new Error('Receiver email does not match configured email');
      }

      const transactionType = ipnData.txn_type;
      const paymentStatus = ipnData.payment_status;
      const amount = ipnData.mc_gross;
      const currency = ipnData.mc_currency;
      const txnId = ipnData.txn_id;

      const result = {
        success: true,
        transactionId: txnId,
        type: transactionType,
        status: paymentStatus,
        amount: amount,
        currency: currency,
        timestamp: new Date().toISOString(),
        data: ipnData
      };

      // Handle different payment statuses
      switch (paymentStatus) {
        case 'Completed':
          await this.handleCompletedPayment(ipnData);
          break;
        case 'Pending':
          await this.handlePendingPayment(ipnData);
          break;
        case 'Refunded':
          await this.handleRefund(ipnData);
          break;
        case 'Reversed':
          await this.handleReversal(ipnData);
          break;
        case 'Canceled_Reversal':
          await this.handleCanceledReversal(ipnData);
          break;
        default:
          console.log(`Unhandled payment status: ${paymentStatus}`);
      }

      return result;
    } catch (error) {
      console.error('Error processing IPN:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle completed payment
   */
  async handleCompletedPayment(ipnData) {
    console.log('Payment completed:', {
      txnId: ipnData.txn_id,
      amount: ipnData.mc_gross,
      currency: ipnData.mc_currency,
      payer: ipnData.payer_email
    });

    // Store transaction data
    await this.storeTransaction(ipnData);

    // Update revenue analytics
    await this.updateRevenueAnalytics(ipnData);

    // Trigger profit maximization processes
    await this.triggerProfitMaximization(ipnData);
  }

  /**
   * Handle pending payment
   */
  async handlePendingPayment(ipnData) {
    console.log('Payment pending:', {
      txnId: ipnData.txn_id,
      reason: ipnData.pending_reason
    });

    await this.storeTransaction({
      ...ipnData,
      status: 'pending'
    });
  }

  /**
   * Handle refund
   */
  async handleRefund(ipnData) {
    console.log('Payment refunded:', {
      txnId: ipnData.txn_id,
      parentTxnId: ipnData.parent_txn_id
    });

    await this.storeTransaction({
      ...ipnData,
      type: 'refund'
    });

    await this.updateRevenueAnalytics(ipnData, true);
  }

  /**
   * Handle payment reversal
   */
  async handleReversal(ipnData) {
    console.log('Payment reversed:', {
      txnId: ipnData.txn_id,
      reason: ipnData.reason_code
    });

    await this.storeTransaction({
      ...ipnData,
      type: 'reversal'
    });
  }

  /**
   * Handle canceled reversal
   */
  async handleCanceledReversal(ipnData) {
    console.log('Reversal canceled:', {
      txnId: ipnData.txn_id
    });

    await this.storeTransaction({
      ...ipnData,
      type: 'reversal_canceled'
    });
  }

  /**
   * Store transaction data
   */
  async storeTransaction(data) {
    // Implementation for storing transaction data
    // This maintains historical data for profit tracking
    console.log('Storing transaction:', data.txn_id);

    // In a real implementation, this would store to a database
    // For now, we'll log it for demonstration
    return {
      stored: true,
      txnId: data.txn_id,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update revenue analytics
   */
  async updateRevenueAnalytics(data, isNegative = false) {
    const amount = parseFloat(data.mc_gross);
    const adjustedAmount = isNegative ? -amount : amount;

    console.log('Updating revenue analytics:', {
      amount: adjustedAmount,
      currency: data.mc_currency,
      txnId: data.txn_id
    });

    // Real-time revenue tracking
    // In production, this would update analytics dashboard
    return {
      updated: true,
      amount: adjustedAmount,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Trigger profit maximization processes
   */
  async triggerProfitMaximization(data) {
    console.log('Triggering profit maximization for transaction:', data.txn_id);

    // Implement profit maximization strategies
    const strategies = [];

    if (this.config.profitMaximization.suggestedTips) {
      strategies.push('suggested_tips');
    }

    if (this.config.profitMaximization.crossPromotion) {
      strategies.push('cross_promotion');
    }

    if (this.config.profitMaximization.emailMarketing) {
      strategies.push('email_marketing');
    }

    if (this.config.profitMaximization.customerRetention) {
      strategies.push('customer_retention');
    }

    console.log('Active profit maximization strategies:', strategies);

    return {
      triggered: true,
      strategies: strategies,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Retry IPN verification on failure
   */
  async retryVerification(ipnData, sandbox = false, attempt = 1) {
    try {
      const verified = await this.verifyIPN(ipnData, sandbox);
      return verified;
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.log(`IPN verification failed, retrying... (${attempt}/${this.maxRetries})`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return this.retryVerification(ipnData, sandbox, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Main IPN handler endpoint
   */
  async handleIPNRequest(req, res) {
    try {
      const ipnData = req.body;

      // Verify IPN with PayPal
      const verified = await this.retryVerification(ipnData);

      if (!verified) {
        console.error('IPN verification failed');
        res.status(400).send('IPN verification failed');
        return;
      }

      // Process verified IPN
      const result = await this.processIPN(ipnData);

      if (result.success) {
        res.status(200).send('IPN processed successfully');
      } else {
        res.status(500).send('IPN processing failed');
      }
    } catch (error) {
      console.error('Error handling IPN request:', error);
      res.status(500).send('Internal server error');
    }
  }
}

module.exports = PayPalIPNHandler;

// Example usage:
/*
const express = require('express');
const app = express();
const PayPalIPNHandler = require('./paypal-ipn-handler');

const ipnHandler = new PayPalIPNHandler();

app.post('/paypal/ipn', express.urlencoded({ extended: true }), (req, res) => {
  ipnHandler.handleIPNRequest(req, res);
});

app.listen(3000, () => {
  console.log('PayPal IPN handler listening on port 3000');
});
*/
