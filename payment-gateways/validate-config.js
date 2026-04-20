/**
 * Configuration Validator
 * Validates payment gateway configurations
 */

const PaymentIntegration = require('./payment-integration');

function validateConfigurations() {
  console.log('Validating payment gateway configurations...\n');

  try {
    const payments = new PaymentIntegration();
    const validation = payments.validateConfiguration();

    console.log('=== Validation Results ===\n');

    if (validation.valid) {
      console.log('✓ Configuration is VALID');
    } else {
      console.log('✗ Configuration has ERRORS');
    }

    if (validation.errors.length > 0) {
      console.log('\nErrors:');
      validation.errors.forEach(error => {
        console.log(`  ✗ ${error}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log('\nWarnings:');
      validation.warnings.forEach(warning => {
        console.log(`  ⚠ ${warning}`);
      });
    }

    console.log('\n=== Configuration Details ===\n');

    // CashApp
    console.log('CashApp:');
    console.log(`  Enabled: ${payments.cashappConfig.enabled}`);
    console.log(`  Cash Tag: ${payments.cashappConfig.cashTag}`);
    console.log(`  Version: ${payments.cashappConfig.version}`);
    console.log(`  Features: ${Object.keys(payments.cashappConfig.features).filter(k => payments.cashappConfig.features[k]).join(', ')}`);

    // PayPal
    console.log('\nPayPal:');
    console.log(`  Enabled: ${payments.paypalConfig.enabled}`);
    console.log(`  Email: ${payments.paypalConfig.email}`);
    console.log(`  Version: ${payments.paypalConfig.version}`);
    console.log(`  IPN Enabled: ${payments.paypalConfig.ipn.enabled}`);
    console.log(`  IPN Version: ${payments.paypalConfig.ipn.version}`);
    console.log(`  Features: ${Object.keys(payments.paypalConfig.features).filter(k => payments.paypalConfig.features[k]).join(', ')}`);

    console.log('\n=== Optimization Settings ===\n');

    // CashApp Optimization
    console.log('CashApp Optimization:');
    console.log(`  Auto Accept: ${payments.cashappConfig.optimization.autoAcceptPayments}`);
    console.log(`  Instant Withdrawal: ${payments.cashappConfig.optimization.instantWithdrawal}`);
    console.log(`  Low Fee Mode: ${payments.cashappConfig.optimization.lowFeeMode}`);
    console.log(`  Maximize Earnings: ${payments.cashappConfig.optimization.maximizeEarnings}`);

    // PayPal Optimization
    console.log('\nPayPal Optimization:');
    console.log(`  Auto Accept: ${payments.paypalConfig.optimization.autoAcceptPayments}`);
    console.log(`  Low Fee Mode: ${payments.paypalConfig.optimization.lowFeeMode}`);
    console.log(`  Maximize Earnings: ${payments.paypalConfig.optimization.maximizeEarnings}`);
    console.log(`  Currency Conversion: ${payments.paypalConfig.optimization.currencyConversion}`);

    console.log('\n=== Security Features ===\n');
    console.log('CashApp Security:');
    console.log(`  Encryption: ${payments.cashappConfig.security.encryptionEnabled}`);
    console.log(`  2FA: ${payments.cashappConfig.security.twoFactorAuth}`);
    console.log(`  Fraud Detection: ${payments.cashappConfig.security.fraudDetection}`);

    console.log('\nPayPal Security:');
    console.log(`  Encryption: ${payments.paypalConfig.security.encryptionEnabled}`);
    console.log(`  SSL Verification: ${payments.paypalConfig.security.sslVerification}`);
    console.log(`  Fraud Detection: ${payments.paypalConfig.security.fraudDetection}`);

    return validation.valid ? 0 : 1;

  } catch (error) {
    console.error('Validation failed:', error.message);
    return 1;
  }
}

// Run validation if called directly
if (require.main === module) {
  const exitCode = validateConfigurations();
  process.exit(exitCode);
}

module.exports = validateConfigurations;
