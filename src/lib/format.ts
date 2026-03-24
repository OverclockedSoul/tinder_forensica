export const formatNumber = (value: number): string => new Intl.NumberFormat("en-US").format(value);

export const formatPercentPair = (leftValue: number, rightValue: number) => {
  const total = leftValue + rightValue;

  if (total <= 0) {
    return { left: 0, right: 0 };
  }

  const left = Number(((leftValue / total) * 100).toFixed(2));
  return {
    left,
    right: Number((100 - left).toFixed(2)),
  };
};

export const formatPercent = (value: number): string => `${value.toFixed(2)}%`;
