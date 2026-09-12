async function seedData() {
  console.log('[Seed] Seeding is disabled.');
}

if (require.main === module) {
  seedData().then(() => process.exit(0));
}

module.exports = seedData;
