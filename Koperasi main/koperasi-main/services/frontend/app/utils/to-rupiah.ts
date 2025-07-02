function toRupiah(value: number | string): string {
  const numberValue = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(numberValue)) {
    throw new Error("Invalid number");
  }
  return numberValue.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
}

export default toRupiah;
