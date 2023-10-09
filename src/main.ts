import { inputs } from './inputs';
import { DetailedScenario, MatrixInput, MortgagePayment } from './types';
import {
  analyzeScenario,
  calculatePayment,
  formatResults,
  generateMatrix,
} from './utils';

async function run(): Promise<void> {
  // --------------------
  // Generate matrix

  console.log('⏳ Generating matrix...');
  const matrix: MatrixInput[] = generateMatrix<MatrixInput>(inputs);
  console.log('✅ Generated matrix.');

  // --------------------
  // Calculate payments
  console.log('⏳ Calculating payments...');
  const payments: Array<{ input: MatrixInput; payment: MortgagePayment }> =
    matrix.map((input: MatrixInput) => ({
      input,
      payment: calculatePayment(input),
    }));
  console.log('✅ Calculated payments.');

  // --------------------
  // Analyze strategies
  console.log('⏳ Analyzing scenarios...');
  const scenarios: DetailedScenario[] = payments.map(
    ({ input, payment }: { input: MatrixInput; payment: MortgagePayment }) => ({
      input,
      payment,
      scenario: analyzeScenario(input, payment),
    }),
  );
  console.log('✅ Analyzed scenarios.', scenarios);

  // --------------------
  // Sort strategies by success
  console.log('⏳ Sorting scenarios...');
  const sortedScenarios: DetailedScenario[] = scenarios.sort(
    (s1: DetailedScenario, s2: DetailedScenario) => {
      if (
        s2.scenario.monthlyNetProfitTotal === s1.scenario.monthlyNetProfitTotal
      ) {
        return s2.scenario.numProperties - s1.scenario.numProperties;
      } else {
        return (
          s2.scenario.monthlyNetProfitTotal - s1.scenario.monthlyNetProfitTotal
        );
      }
    },
  );
  console.log('✅ Sorted scenarios.');

  // --------------------
  // Format results
  const results = formatResults(sortedScenarios);
  console.log(results);
}

void run();
