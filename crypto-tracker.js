
const {Client, Events, GatewayIntentBits} = require('discord.js');
const { getBitcoinPrice, fetchBitcoinPastValues, generateQuickChartUrl } = require('./src/controllers/bitcoin');
const { getEthereumPrice } = require('./src/controllers/ethereum');
const { FetchError, InvalidDaysError, UnrecognizedCommandError } = require('./src/errors');


let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

// Discord client initializaion
const client = new Client({
    intents: [GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent]
});

require('dotenv').config();

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
});

const token = process.env.BOT_TOKEN;
client.login(token);

function validateBitcoinMessage(message) {
    const splitMessage = message.content.split(' ');
    const number_of_days = parseInt(splitMessage[1]);

    if (number_of_days > 30) {
        throw new InvalidDaysError("Maximum insight of historical data is within range of 30 days");
    }

    if (number_of_days < 1) {
        throw new InvalidDaysError("Please enter the valid number of previous days.");
    }

    if (splitMessage.length > 3) {
        throw new UnrecognizedCommandError("Sorry, I don't recognize that command, try once again");
    }

    return splitMessage;
}


client.on('messageCreate', async message => {

    console.log(`Received message from ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}:`);
    console.log(`Content: ${message.content}`);

    // Ignore messages from bots
    if (message.author.bot) return;

    try {
        if (message.content === '!bitcoin') {
            const prices = await getBitcoinPrice();
            message.channel.send(`The current price of Bitcoin is €${prices.eur} which is $${prices.usd} USD.`);
        } else if (message.content.startsWith('!bitcoin ')) {
            const splitMessage = validateBitcoinMessage(message);
            const number_of_days = parseInt(splitMessage[1]);
            const currency = splitMessage[2] || 'usd';  // USD by default

            const data = await fetchBitcoinPastValues(number_of_days, currency);
            const dates = data.map(item => new Date(item[0]).toLocaleDateString());
            const prices = data.map(item => item[1]);
            const chartUrl = await generateQuickChartUrl(dates, prices, number_of_days, currency);
            message.channel.send(chartUrl);
        } else if (message.content === '!ethereum') {
            const prices = await getEthereumPrice();
            message.channel.send(`The current price of Ethereum is €${prices.eur} which is $${prices.usd} USD.`);
        } else {
            message.channel.send("Sorry, I don't recognize that command, try once again");
        }
    } catch (error) {
        if (error instanceof FetchError || error instanceof InvalidDaysError) {
            message.channel.send(error.message);
        } else {
            message.channel.send('An unexpected error occurred.');
        }
    }
});