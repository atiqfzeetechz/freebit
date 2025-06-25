function convertScientificToDecimal(input:any) {
  const num = Number(input);
  if (isNaN(num)) return 'Invalid number';

  // Convert to decimal string with full precision
  const parts = input.toString().split('e');

  if (parts.length === 1) return parts[0]; // not in scientific notation

  let [base, exponent] = parts;
  exponent = Number(exponent);

  if (exponent >= 0) {
    return Number(input).toFixed(0); // or toFixed(exponent) if needed
  }

  // Handle negative exponent manually
  base = base.replace('.', '');
  const zeros = Math.abs(exponent) - 1;
  return '0.' + '0'.repeat(zeros) + base;
}
export {convertScientificToDecimal}