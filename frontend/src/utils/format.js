// Shared formatting helpers — money is always shown with exactly 2 decimals.

export const money = (value) =>
  Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const signedMoney = (value, negative) => `${negative ? '-' : '+'}${money(value)}`;

export const dateTime = (value) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
