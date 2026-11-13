/**
 * Generates an uppercase 6-character alphanumeric PNR starting with GW
 * Example: GW8X92
 */
const generatePNR = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'GW';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a 13-digit airline e-ticket number prefixed with GoldenWing airline code 074
 * Example: 074-8849204123
 */
const generateTicketNumber = () => {
  const digits = Math.floor(1000000000 + Math.random() * 9000000000);
  return `074-${digits}`;
};

module.exports = {
  generatePNR,
  generateTicketNumber,
};

