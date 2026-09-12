const crypto = require('crypto');

/**
 * Generates the short, human-readable wallet identifier used in the UI.
 * The database unique index remains the final collision safeguard.
 */
function generateWalletUid() {
  return `YUG-${crypto.randomInt(100000, 1000000)}`;
}

module.exports = { generateWalletUid };
