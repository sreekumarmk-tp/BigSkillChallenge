let StripeSDK = null;
try {
  StripeSDK = require('@stripe/stripe-react-native');
} catch (e) {
  // @stripe/stripe-react-native not installed
}
export { StripeSDK };
