export const getPercentage = (stat: number, total: number) => {
  return `${((100 * stat) / total).toFixed(2)}%`;
};
