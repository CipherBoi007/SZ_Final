/**
 * Generates a custom 15-character identifier consisting of a 3-letter prefix
 * and 12 random numeric digits.
 * @param {string} prefix - The 3-letter entity prefix (e.g., 'PRD', 'USR').
 * @returns {string} The generated 15-character custom identifier.
 */
function generateCustomId(prefix) {
  if (!prefix || prefix.length !== 3) {
    throw new Error('Prefix must be exactly 3 characters long');
  }
  const digits = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  return `${prefix}${digits}`;
}

module.exports = generateCustomId;
