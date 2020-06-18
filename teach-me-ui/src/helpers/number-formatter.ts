export const format: Function = (number: number) => {
  if (isNaN(number)) return number;

  if (number < 9999) {
    return number;
  }

  if (number < 1000000) {
    return Math.round(number / 1000) + 'K';
  }
  if (number < 10000000) {
    return (number / 1000000).toFixed(2) + 'M';
  }

  if (number < 1000000000) {
    return Math.round(number / 1000000) + 'M';
  }

  if (number < 1000000000000) {
    return Math.round(number / 1000000000) + 'B';
  }

  return '1T+';
};
