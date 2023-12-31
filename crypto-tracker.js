
const {Client, Events, GatewayIntentBits} = require('discord.js');
const { getBitcoinPrice, fetchBitcoinPastValues, generateQuickChartUrl, startBitcoinPriceAlert, fetchBitcoinNews } = require('./src/controllers/bitcoin');
const { getEthereumPrice, fetchEthereumPastValues, generateQuickChartUrlEthereum, startEthereumPriceAlert, fetchEthereumNews } = require('./src/controllers/ethereum');
const { FetchError, InvalidDaysError, UnrecognizedCommandError, MessageOverflow } = require('./src/errors/Errors');
const {
    FETCH_ERROR,
    UNRECOGNIZED_COMMAND_ERROR,
    INVALID_DAYS_ERROR,
    INVALID_DAYS_ERROR_LESS_THAN_ONE,
    INVALID_CURRENCY_PROVIDED,
    MESSAGE_OVERFLOW,
    BOUNDARY_PRICES_ALERT
} = require('./src/utils/errorMessages');
const axios = require('axios');
const alertEmitter = require('./AlertEmitter');

let lastChannel = null;
let alertIntervalId = null;
let fetch;


import('node-fetch').then(module => {
    fetch = module.default;
});

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

if (process.env.NODE_ENV !== 'test') {
    client.once(Events.ClientReady, c => {
        console.log(`Logged in as ${c.user.tag}`);
    });

    const token = process.env.BOT_TOKEN;
    client.login(token);
}


// crypto-tracker.js
function validateBitcoinMessage(message) {
    const splitMessage = message.content.split(' ');
    const number_of_days = parseInt(splitMessage[1]);
    const validCurrencies = ['usd', 'eur', 'USD', 'EUR'];

    if (message.content.startsWith('!bitcoin alert ')) {
        const lowerBound = parseFloat(splitMessage[2]);
        const upperBound = parseFloat(splitMessage[3]);

        if (isNaN(lowerBound) || isNaN(upperBound)) {
            throw new UnrecognizedCommandError(BOUNDARY_PRICES_ALERT);
        }
        
        return splitMessage;
    }

    if (!message.content.startsWith('!bitcoin ')) {
        throw new UnrecognizedCommandError(UNRECOGNIZED_COMMAND_ERROR);
    }

    if (isNaN(number_of_days) || number_of_days > 30) {
        throw new InvalidDaysError(INVALID_DAYS_ERROR);
    }

    if (number_of_days < 1) {
        throw new InvalidDaysError(INVALID_DAYS_ERROR_LESS_THAN_ONE);
    }

    if (splitMessage[2] && !validCurrencies.includes(splitMessage[2].toLowerCase())) {
        throw new UnrecognizedCommandError(INVALID_CURRENCY_PROVIDED);
    }

    if (splitMessage.length > 3) {
        throw new MessageOverflow(MESSAGE_OVERFLOW);
    }

    return splitMessage;
}

function validateEthereumMessage(message) {

    const splitMessage = message.content.split(' ');
    const number_of_days = parseInt(splitMessage[1]);
    const validCurrencies = ['usd', 'eur', 'USD', 'EUR'];

    if (message.content.startsWith('!ethereum alert ')) {
        const lowerBound = parseFloat(splitMessage[2]);
        const upperBound = parseFloat(splitMessage[3]);

        if (isNaN(lowerBound) || isNaN(upperBound)) {
            throw new UnrecognizedCommandError(BOUNDARY_PRICES_ALERT);
        }
        return splitMessage;
    }

    if (!message.content.startsWith('!ethereum ')) {
        throw new UnrecognizedCommandError(UNRECOGNIZED_COMMAND_ERROR);
    }

    if (isNaN(number_of_days) || number_of_days > 30) {
        throw new InvalidDaysError(INVALID_DAYS_ERROR);
    }

    if (number_of_days < 1) {
        throw new InvalidDaysError(INVALID_DAYS_ERROR_LESS_THAN_ONE);
    }

    if (splitMessage[2] && !validCurrencies.includes(splitMessage[2].toLowerCase())) {
        throw new UnrecognizedCommandError(INVALID_CURRENCY_PROVIDED);
    }

    if (splitMessage.length > 3) {
        throw new MessageOverflow(MESSAGE_OVERFLOW);
    }

    return splitMessage;
}
  
alertEmitter.on('noChange', () => {
    //console.log('Last channel:', lastChannel);
    if (lastChannel) {
        lastChannel.send('No price change');
    }
});

alertEmitter.on('priceChange', (currentPrice) => {
    //console.log('priceChange event emitted');
    if (lastChannel) {
        lastChannel.send(`Price has been changed! Current price is ${currentPrice} EUR`);
    }
});

alertEmitter.on('fetchError', () => {
    //console.log('fetchError event emitted');
    if (lastChannel) {
        lastChannel.send('Error fetching price');
    }
});

client.on('messageCreate', async message => {

    console.log(`Received message from ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}:`);
    console.log(`Content: ${message.content}`);

    // Ignore messages from bots
    if (message.author.bot) return;

    try {

        if (message.content === '!bitcoin news') {
            const newsMessages = await fetchBitcoinNews();
            for(const newsMessage of newsMessages){
                message.channel.send(newsMessage);
            }
        } 
        
        else if (message.content ==='!ethereum news') {
            const newsMessages = await fetchEthereumNews();
            for(const newsMessage of newsMessages){
                message.channel.send(newsMessage);
            }
        }

        else if (message.content === '!bitcoin') {
            const prices = await getBitcoinPrice();
            message.channel.send(`The current price of Bitcoin is €${prices.eur} which is $${prices.usd} USD.`);
        }

        else if (message.content.startsWith('!bitcoin alert ')) {
            const splitMessage = validateBitcoinMessage(message);
            const lowerBound = parseFloat(splitMessage[2]);
            const upperBound = parseFloat(splitMessage[3]);
            if (lowerBound && upperBound) {
                lastChannel = message.channel;
                //console.log('Last channel set:', lastChannel);
                message.channel.send('Bitcoin price detecting started...');
                alertIntervalId = startBitcoinPriceAlert(lowerBound, upperBound); 
            }
        }
        
        else if (message.content === '!bitcoin alert') {
            message.channel.send("Please add boundary prices for alert.");
        }

        else if (message.content.startsWith('!ethereum alert ')) {
            const splitMessage = validateEthereumMessage(message);
            const lowerBound = parseFloat(splitMessage[2]);
            const upperBound = parseFloat(splitMessage[3]);
            if (lowerBound && upperBound) {
                lastChannel = message.channel;
                message.channel.send('Ethereum price detecting started!');
                alertIntervalId = startEthereumPriceAlert(lowerBound, upperBound);
            }
        }

        else if (message.content === '!ethereum alert') {
            message.channel.send("Please add boundary prices for alert.");
        }

        else if (message.content === 'stop alerts') {
            if (alertIntervalId) {
                clearInterval(alertIntervalId);
                message.channel.send('Stopped price alerts.');
            } else {
                message.channel.send('No active price alerts to stop.');
            }
        }
      
        else if (message.content.startsWith('!bitcoin ')) {
            const splitMessage = validateBitcoinMessage(message);
            const number_of_days = parseInt(splitMessage[1]);
            const currency = splitMessage[2] || 'usd'; // usd by default

            const data = await fetchBitcoinPastValues(number_of_days, currency);
            const dates = data.map(item => new Date(item[0]).toLocaleDateString());
            const prices = data.map(item => item[1]);
            const chartUrl = await generateQuickChartUrl(dates, prices, number_of_days, currency);
            message.channel.send(chartUrl);
        }
        
        else if (message.content.startsWith('!ethereum ')) {
            const splitMessage = validateEthereumMessage(message);
            const number_of_days = parseInt(splitMessage[1]);
            const currency = splitMessage[2] || 'usd'; // usd by default

            const data = await fetchEthereumPastValues(number_of_days, currency);
            const dates = data.map(item => new Date(item[0]).toLocaleDateString());
            const prices = data.map(item => item[1]);
            const chartUrl = await generateQuickChartUrlEthereum(dates, prices, number_of_days, currency);
            message.channel.send(chartUrl);
        }
        
        else if (message.content === '!ethereum') {
            const prices = await getEthereumPrice();
            message.channel.send(`The current price of Ethereum is €${prices.eur} which is $${prices.usd} USD.`);
        }
        
        else {
            message.channel.send("Sorry, I don't recognize that command, try once again");
        }

    } catch (error) {
        console.error(error);
        if (error instanceof FetchError || error instanceof InvalidDaysError || error instanceof UnrecognizedCommandError || MessageOverflow) {
            message.channel.send(error.message);
        } else {
            message.channel.send('An unexpected error occurred.');
        }
    }

});

module.exports = {
    validateBitcoinMessage,
    validateEthereumMessage
};