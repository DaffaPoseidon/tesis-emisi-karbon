function toPercentage(value: number | string): string {
  // Convert string to number if needed
  const numberValue = typeof value === "string" ? Number.parseFloat(value) : value;

  // Check if the value is a valid number
  if (Number.isNaN(numberValue)) {
    throw new Error("Invalid number");
  }

  // Round to whole number and append %
  return `${Math.round(numberValue)}%`;
}

export default toPercentage;
