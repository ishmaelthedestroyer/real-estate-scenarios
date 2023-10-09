/**
 * inputs for
 */
export type MatrixInput = {
  investment: number;
  purchasePrice: number;
  downPaymentPercentage: number;
  interestRate: number;
};

/**
 * information about the mortgage payments
 */
export type MortgagePayment = {
  loanAmount: number;
  principalAndInterest: number;
  tax: number;
  insurance: number;
  total: number;
  termMonths: number;
  mortgageInsurance: number;
};

/**
 * information about a mortage strategy
 */
export type Scenario = {
  investment: number;
  purchasePrice: number;
  numProperties: number;
  monthlyOperatingCostsPerProperty: number;
  monthlyOperatingCostsTotal: number;
  monthlyMortgageAndFeesPerProperty: number;
  monthlyMortgageAndFeesTotal: number;
  monthlyGrossRentTotal: number;
  monthlyGrossRentPerProperty: number;
  monthlyNetProfitTotal: number;
  monthlyNetProfitPerProperty: number;
  yearlyNetProfitTotal: number;
};

/**
 * all input and output information grouped together
 */
export type DetailedScenario = {
  input: MatrixInput;
  payment: MortgagePayment;
  scenario: Scenario;
};
