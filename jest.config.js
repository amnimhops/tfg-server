/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots:["<rootDir>/src/", "<rootDir>/tests/"],
  transform:{
    "^.+\\.ts?$":"ts-jest"
  },
  "testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.ts?$",
};