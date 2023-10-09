import { INITIAL_INVESTMENT_AMOUNT, INTEREST_RATE } from './constants';
import { MatrixInput } from './types';

/**
 * inputs for generating matrix
 */
export const inputs: { [k in keyof MatrixInput]: MatrixInput[k][] } = {
  investment: [INITIAL_INVESTMENT_AMOUNT],
  purchasePrice: [100_000, 150_000, 200_000, 250_000, 300_000, 400_000],
  //   downPaymentPercentage: [0.2, 0.3, 0.5, 1],
  downPaymentPercentage: [0.2],
  interestRate: [INTEREST_RATE],
};
