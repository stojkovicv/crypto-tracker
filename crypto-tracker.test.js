const { validateBitcoinMessage, validateEthereumMessage } = require('./crypto-tracker');
const { fetchBitcoinPastValues } = require('./src/controllers/bitcoin');
const { fetchEthereumPastValues } = require('./src/controllers/ethereum');
const { InvalidDaysError, UnrecognizedCommandError, MessageOverflow } = require('./src/errors/Errors');

// Mocking the API call

jest.mock('node-fetch', () => {
  return jest.fn((url) => {
    const daysMatch = url.match(/days=(\d+)/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const mockResponse = {
      prices: Array.from({ length: days + 1 }, (_, i) => [Date.now() - i * 86400000, Math.random() * 30000])
    };

    return Promise.resolve({
      json: () => Promise.resolve(mockResponse)
    });
  });
});

describe('Bot Message Handlers', () => {

  // Bitcoin Validation Tests
  test('validateBitcoinMessage with valid input', () => {
    const message = {
      content: '!bitcoin 10 usd'
    };
    const result = validateBitcoinMessage(message);
    expect(result).toEqual(['!bitcoin', '10', 'usd']);
  });

  test('validateBitcoinMessage with too many days', () => {
    const message = {
      content: '!bitcoin 100 usd'
    };
    expect(() => {
      validateBitcoinMessage(message);
    }).toThrow(InvalidDaysError);
  });

  test('validateBitcoinMessage with unrecognized command', () => {
    const message = {
      content: '!bitcoin'
    };
    expect(() => {
      validateBitcoinMessage(message);
    }).toThrow(UnrecognizedCommandError);
  });

  test('validateBitcoinMessage with too many arguments', () => {
    const message = {
      content: '!bitcoin 10 usd invalid'
    };
    expect(() => {
      validateBitcoinMessage(message);
    }).toThrow(MessageOverflow);
    });

  test('validateBitcoinMessage with invalid currency', () => {
    const message = {
      content: '!bitcoin 10 invalid'
    };
    expect(() => {
      validateBitcoinMessage(message);
    }).toThrow(UnrecognizedCommandError);
  });

  // Ethereum Validation Tests
  // ... (similar to the Bitcoin tests)

});
