function generateWalletUid() {
  const numericPart = String(Math.floor(100000 + (Math.random() * 900000)));
  return `YUG-${numericPart}`;
}

module.exports = {
  generateWalletUid
};
