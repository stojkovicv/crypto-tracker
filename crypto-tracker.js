/*
// Loading dependencies
const {Client, Events, GatewayIntentBits} = require('discord.js');
const { FetchError } = require('./errors');
const { FETCH_ERROR } = require('./errorMessages');


let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
    console.log("node-fetch imported successfully");
});

// Discord client initializaion

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
});

require('dotenv').config();

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
});

const token = process.env.BOT_TOKEN;
client.login(token);

// Fetching Bitcoin price
async function getBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        console.log("Fetched Bitcoin price:", data.bitcoin.usd);
        return data.bitcoin.usd;
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

client.on('messageCreate', async message => {

    console.log(`Received message from ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}:`);
    console.log(`Content: ${message.content}`);
    console.log(`Embeds: ${JSON.stringify(message.embeds)}`);
    console.log(`Attachments: ${JSON.stringify(message.attachments)}`);

    // Ignore messages from bots
    if (message.author.bot) return;

    if (message.content === '!bitcoin') {
        try {
            const price = await getBitcoinPrice();
            message.channel.send(`The current price of Bitcoin is $${price}`);
        } catch (error) {
            if (error instanceof FetchError) {
                message.channel.send(error.message);
            } else {
                message.channel.send('An unexpected error occurred.');
            }
        }
    }

    if (!message.guild) {
        console.log(`Received DM from ${message.author.tag}: ${message.content}`);
        try {
            const price = await getBitcoinPrice();
            message.channel.send(`The current price of Bitcoin is $${price}`);
        } catch (error) {
            if (error instanceof FetchError) {
                message.channel.send(error.message);
            } else {
                message.channel.send('An unexpected error occurred.');
            }
        }
    }
});

*/

const Discord = require('discord.js');
const { FetchError } = require('./errors');
const { FETCH_ERROR } = require('./errorMessages');

const client = new Discord.Client();

require('dotenv').config();

let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
    console.log("node-fetch imported successfully");
});

async function getBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        console.log("Fetched Bitcoin price:", data.bitcoin.usd);
        return data.bitcoin.usd;
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function sendBitcoinPrice(message) {
    try {
        const price = await getBitcoinPrice();
        message.channel.send(`The current price of Bitcoin is $${price}`);
    } catch (error) {
        if (error instanceof FetchError) {
            message.channel.send(error.message);
        } else {
            message.channel.send('An unexpected error occurred.');
        }
    }
}

client.on('message', async message => {
    console.log(`Received message from ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}: ${message.content}`);

    // Ignore messages from bots
    if (message.author.bot) return;

    if (message.content === '!bitcoin') {
        sendBitcoinPrice(message);
    }
});

client.once('ready', () => {
    console.log('Bot is online and running!');
});

const token = process.env.BOT_TOKEN;
client.login(token);
