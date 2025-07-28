const chalk: any = {
  red: jest.fn((str: string) => str),
  yellow: jest.fn((str: string) => str),
  green: jest.fn((str: string) => str),
  cyan: jest.fn((str: string) => str),
  gray: jest.fn((str: string) => str),
  dim: jest.fn((str: string) => str),
  bold: jest.fn((str: string) => str),
};

// Set up chainable methods
chalk.bold.red = jest.fn((str: string) => str);
chalk.bold.green = jest.fn((str: string) => str);
chalk.green.bold = jest.fn((str: string) => str);

export default chalk;