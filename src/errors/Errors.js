class FetchError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FetchError';
    }
}

class InvalidDaysError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidDaysError';
    }
}

class UnrecognizedCommandError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnrecognizedCommandError';
    }
}

class MessageOverflow extends Error {
    constructor(message) {
        super(message);
        this.name = 'MessageOverflow';
    }
}

module.exports = {
    FetchError,
    InvalidDaysError,
    UnrecognizedCommandError,
    MessageOverflow
};