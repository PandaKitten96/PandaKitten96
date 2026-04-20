/**
 * Payment Integration Test Suite
 * Tests CashApp and PayPal integrations
 */

const PaymentIntegration = require('./payment-integration');

function runTests() {
  console.log('Running Payment Integration Tests...\n');

  const payments = new PaymentIntegration();
  let passed = 0;
  let failed = 0;

  // Test 1: Initialize payment gateways
  console.log('Test 1: Initialize payment gateways');
  try {
    payments.initialize().then(status => {
      if (status.cashapp && status.paypal) {
        console.log('✓ PASSED: Payment gateways initialized successfully\n');
        passed++;
      } else {
        console.log('✗ FAILED: Not all gateways initialized\n');
        failed++;
      }
    });
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 2: Validate CashApp cash tag
  console.log('Test 2: Validate CashApp cash tag');
  try {
    const cashTag = payments.cashappConfig.cashTag;
    if (cashTag === '$imthepanda') {
      console.log(`✓ PASSED: CashApp cash tag is correct: ${cashTag}\n`);
      passed++;
    } else {
      console.log(`✗ FAILED: CashApp cash tag mismatch. Expected: $imthepanda, Got: ${cashTag}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 3: Validate PayPal email
  console.log('Test 3: Validate PayPal email');
  try {
    const email = payments.paypalConfig.email;
    if (email === 'pandamonsterrrr@yahoo.com') {
      console.log(`✓ PASSED: PayPal email is correct: ${email}\n`);
      passed++;
    } else {
      console.log(`✗ FAILED: PayPal email mismatch. Expected: pandamonsterrrr@yahoo.com, Got: ${email}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 4: Generate CashApp payment URL
  console.log('Test 4: Generate CashApp payment URL');
  try {
    const url = payments.getCashAppPaymentUrl(25, 'Test Payment');
    if (url.includes('cash.app/$imthepanda')) {
      console.log(`✓ PASSED: CashApp URL generated: ${url}\n`);
      passed++;
    } else {
      console.log(`✗ FAILED: Invalid CashApp URL: ${url}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 5: Generate PayPal payment URL
  console.log('Test 5: Generate PayPal payment URL');
  try {
    const url = payments.getPayPalPaymentUrl(50, 'USD', 'Test Payment');
    if (url.includes('paypal.com') && url.includes('pandamonsterrrr@yahoo.com')) {
      console.log(`✓ PASSED: PayPal URL generated: ${url}\n`);
      passed++;
    } else {
      console.log(`✗ FAILED: Invalid PayPal URL: ${url}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 6: Track revenue
  console.log('Test 6: Track revenue');
  try {
    payments.trackRevenue(100.00, 'cashapp', 'test_txn_001').then(result => {
      if (result.success && result.totalRevenue === 100.00) {
        console.log('✓ PASSED: Revenue tracked successfully\n');
        passed++;
      } else {
        console.log('✗ FAILED: Revenue tracking error\n');
        failed++;
      }
    });
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 7: Get analytics
  console.log('Test 7: Get analytics');
  try {
    const analytics = payments.getAnalytics();
    if (analytics.total && analytics.cashapp && analytics.paypal) {
      console.log('✓ PASSED: Analytics retrieved successfully');
      console.log(`   Total revenue: $${analytics.total.revenue}`);
      console.log(`   Total transactions: ${analytics.total.transactions}\n`);
      passed++;
    } else {
      console.log('✗ FAILED: Analytics incomplete\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 8: Validate configuration
  console.log('Test 8: Validate configuration');
  try {
    const validation = payments.validateConfiguration();
    if (validation.valid) {
      console.log('✓ PASSED: Configuration is valid\n');
      passed++;
    } else {
      console.log('✗ FAILED: Configuration validation errors:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
      console.log('');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 9: Export transactions
  console.log('Test 9: Export transactions');
  try {
    const exportData = payments.exportTransactions('json');
    const parsed = JSON.parse(exportData);
    if (parsed.analytics && parsed.gateways) {
      console.log('✓ PASSED: Transaction export successful\n');
      passed++;
    } else {
      console.log('✗ FAILED: Export data incomplete\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Test 10: Optimize for profit
  console.log('Test 10: Optimize for profit');
  try {
    payments.optimizeForProfit().then(result => {
      if (result.success && result.optimizations.length > 0) {
        console.log('✓ PASSED: Profit optimization successful');
        console.log(`   Active optimizations: ${result.optimizations.length}\n`);
        passed++;
      } else {
        console.log('✗ FAILED: Profit optimization error\n');
        failed++;
      }
    });
  } catch (error) {
    console.log(`✗ FAILED: ${error.message}\n`);
    failed++;
  }

  // Summary
  setTimeout(() => {
    console.log('=== Test Summary ===');
    console.log(`Total tests: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed === 0) {
      console.log('\n✓ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n✗ Some tests failed');
      process.exit(1);
    }
  }, 2000);
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = runTests;
