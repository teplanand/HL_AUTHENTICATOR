export const amountToWords = (amount: number): string => {
  if (isNaN(amount) || amount < 0) return "";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const numToWords = (num: number): string => {
    if (num < 20) return ones[num];
    if (num < 100)
      return `${tens[Math.floor(num / 10)]}${num % 10 ? " " + ones[num % 10] : ""}`;
    if (num < 1000)
      return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? " " + numToWords(num % 100) : ""}`;
    if (num < 100000)
      return `${numToWords(Math.floor(num / 1000))} Thousand${num % 1000 ? " " + numToWords(num % 1000) : ""}`;
    if (num < 10000000)
      return `${numToWords(Math.floor(num / 100000))} Lakh${num % 100000 ? " " + numToWords(num % 100000) : ""}`;

    return `${numToWords(Math.floor(num / 10000000))} Crore${num % 10000000 ? " " + numToWords(num % 10000000) : ""}`;
  };

  const rupees = Math.floor(amount);

  return `${numToWords(rupees)} Rupees Only`;
};
