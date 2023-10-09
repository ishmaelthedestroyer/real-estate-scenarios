import Table from 'cli-table3';

import {
  DetailedScenario,
  MatrixInput,
  MortgagePayment,
  Scenario,
} from './types';
import {
  OPERATING_COST_PERCENT,
  PERCENTAGE_RENT_FROM_PURCHASE_PRICE,
} from './constants';

const Mortgage = require('mortgage-js');

/**
 * given a type definition of a record and possible values for each key,
 * it generates an array of every permutation
 *
 * @template T
 * @param {{ [k in keyof T]: T[k][] }} input
 * @returns {T[]}
 */
export function generateMatrix<T extends Record<string, any>>(
  input: { [k in keyof T]: T[k][] },
  limit?: number,
): T[] {
  const keys: (keyof T)[] = Object.keys(input);

  // If there's more than 1 key and at least 1 key has a value,
  // then we want to push an empty item to the values that don't have any parameters
  // Otherwise an empty matrix will be generated
  const numValues: number = keys.reduce<number>(
    (sum: number, key: keyof T): number => sum + input[key].length,
    0,
  );
  if (numValues && keys.length) {
    for (const key of keys) {
      if (!input[key].length) {
        // @ts-ignore we want to push an empty item to the values that don't have any parameters
        input[key].push(undefined);
      }
    }
  }

  const params: T[] = Object.entries(input)
    .reduce((partialMatrix: any[], [, values]: [string, any[]]) => {
      if (!partialMatrix.length) {
        return values.map((v) => [v]);
      }

      return partialMatrix.reduce((reduced, current) => {
        values.forEach((val) => {
          const copy = current.slice();
          copy.push(val);
          reduced.push(copy);
        }, []);
        return reduced;
      }, []);
    }, [])
    .reduce((matrix: T[], values: any[]): T[] => {
      const param: T = values.reduce(
        (params: Partial<T>, value: any, index: number): Partial<T> => ({
          ...params,
          [keys[index]]: value,
        }),
        {},
      );
      return [...matrix, param];
    }, []) as unknown as T[];

  return limit ? params.slice(-1 * limit) : params;
}

/**
 * calculate the payments for a mortgage
 *
 * @param input
 * @returns
 */
export function calculatePayment(input: MatrixInput): MortgagePayment {
  const { purchasePrice, downPaymentPercentage, interestRate } = input;
  const paymentMonths: number = 12 * 30;

  if (downPaymentPercentage === 1) {
    return {
      loanAmount: 0,
      principalAndInterest: 0,
      tax: 0,
      insurance: 0,
      total: 0,
      termMonths: 0,
      mortgageInsurance: 0,
    };
  }

  const {
    loanAmount,
    principalAndInterest,
    tax,
    insurance,
    total,
    termMonths,
    mortgageInsurance,
  } = Mortgage.calculatePayment(
    purchasePrice,
    purchasePrice * downPaymentPercentage,
    interestRate,
    paymentMonths,
  ) as MortgagePayment;

  return {
    loanAmount,
    principalAndInterest,
    tax,
    insurance,
    total,
    termMonths,
    mortgageInsurance,
  };
}

/**
 * analyzes a strategy for purchasing properties
 *
 * @param input
 * @param payment
 * @returns
 */
export function analyzeScenario(
  input: MatrixInput,
  payment: MortgagePayment,
): Scenario {
  const { downPaymentPercentage, investment, purchasePrice } = input;
  const { principalAndInterest } = payment;
  const numProperties: number = Math.floor(
    investment /
      (downPaymentPercentage > 0
        ? purchasePrice * downPaymentPercentage
        : purchasePrice),
  );
  const monthlyMortgageAndFeesPerProperty: number = principalAndInterest;
  const monthlyMortgageAndFeesTotal: number =
    monthlyMortgageAndFeesPerProperty * numProperties;
  const monthlyGrossRentPerProperty: number =
    purchasePrice * PERCENTAGE_RENT_FROM_PURCHASE_PRICE;
  const monthlyGrossRentTotal: number =
    monthlyGrossRentPerProperty * numProperties;
  const monthlyOperatingCostsPerProperty: number =
    OPERATING_COST_PERCENT * monthlyGrossRentPerProperty;
  const monthlyOperatingCostsTotal: number =
    monthlyOperatingCostsPerProperty * numProperties;
  const monthlyNetProfitPerProperty: number =
    monthlyGrossRentPerProperty -
    monthlyOperatingCostsPerProperty -
    monthlyMortgageAndFeesPerProperty;
  const monthlyNetProfitTotal: number =
    monthlyNetProfitPerProperty * numProperties;
  const yearlyNetProfitTotal: number = monthlyNetProfitTotal * 12;

  const scenario: Scenario = {
    investment,
    purchasePrice,
    numProperties,
    monthlyGrossRentPerProperty,
    monthlyGrossRentTotal,
    monthlyOperatingCostsPerProperty,
    monthlyOperatingCostsTotal,
    monthlyMortgageAndFeesPerProperty,
    monthlyMortgageAndFeesTotal,
    monthlyNetProfitPerProperty,
    monthlyNetProfitTotal,
    yearlyNetProfitTotal,
  };

  return scenario;
}

/**
 * takes a number and formats it as a currency string
 * @param input
 */
export function formatCurrency(input: number): string {
  const formatted = input.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return formatted.endsWith('.00')
    ? formatted.substring(0, formatted.length - 3)
    : formatted;
}

/**
 * formats results into a table that can be outputted to the CLI
 *
 * @param data
 */
export function formatResults(scenarios: DetailedScenario[]): string {
  const table = new Table({
    head: [
      'Investment',
      'Purchase Price',
      'Down Payment',
      '# Properties',
      'Monthly Gross Rent',
      'Monthly Operating Costs',
      'Monthly Mortgage',
      'Monthly Net Profit',
      'Yearly Net Profit Total',
    ],
  });

  for (const { input, scenario } of scenarios) {
    const { downPaymentPercentage } = input;
    const {
      investment,
      purchasePrice,
      numProperties,
      monthlyGrossRentPerProperty,
      monthlyGrossRentTotal,
      monthlyOperatingCostsPerProperty,
      monthlyOperatingCostsTotal,
      monthlyMortgageAndFeesPerProperty,
      monthlyMortgageAndFeesTotal,
      monthlyNetProfitPerProperty,
      monthlyNetProfitTotal,
      yearlyNetProfitTotal,
    } = scenario;
    table.push([
      formatCurrency(investment),
      formatCurrency(purchasePrice),
      `${formatCurrency(downPaymentPercentage * purchasePrice)} (${
        downPaymentPercentage * 100
      }%)`,
      numProperties,
      `${formatCurrency(
        monthlyGrossRentPerProperty,
      )} / property (${formatCurrency(monthlyGrossRentTotal)})`,
      `${formatCurrency(
        monthlyOperatingCostsPerProperty,
      )} / property (${formatCurrency(monthlyOperatingCostsTotal)})`,
      `${formatCurrency(
        monthlyMortgageAndFeesPerProperty,
      )} / property (${formatCurrency(monthlyMortgageAndFeesTotal)})`,
      `${formatCurrency(
        monthlyNetProfitPerProperty,
      )} / property (${formatCurrency(monthlyNetProfitTotal)})`,
      formatCurrency(yearlyNetProfitTotal),
    ]);
  }

  return table.toString();
}
