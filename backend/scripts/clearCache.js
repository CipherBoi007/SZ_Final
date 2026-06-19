const cacheService = require('../src/services/cacheService');

async function clearCache() {
  try {
    console.log('Clearing Redis cache...');
    await cacheService.flush();
    console.log('Cache cleared successfully!');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  } finally {
    process.exit(0);
  }
}

clearCache();
