# Housing Scenarios

### About

This is a simple tool to run different scenarios for purchasing investment properties. It takes in several inputs (investment amount, operating costs, interest rates, etc) as well as different scenarios (purchase price, down payment percentage) and generates a matrix of parameters. From there it determines what's the ideal strategy, assuming you used the same strategy for purchasing all the properties.

This is meant to be used for "back-of-the-napkin math", and it's understood that there are several more factors in determining rent, operating costs, etc.

<p align="center">
  <img src="./static/example-output.png" />
</p>

### Install

> git clone git@github.com:ishmaelthedestroyer/real-estate-scenarios.git
> yarn install

### Configure

- Edit constants in `src/constants.ts`
  - initial investment amount
  - percentage rent from purchase price
  - operating cost percent
  - interest rate
- Edit inputs in `src/inputs.ts`

### Run

```
yarn start:dev
```
