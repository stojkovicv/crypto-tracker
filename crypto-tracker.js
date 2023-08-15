const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Bot is online!');
});

client.login('YOUR_BOT_TOKEN');

const fetch = require('node-fetch');

async function getBitcoinPrice() {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    const data = await response.json();
    return data.bitcoin.usd;
}

client.on('message', async message => {
    if (message.content === '!bitcoin') {
        const price = await getBitcoinPrice();
        message.channel.send(`The current price of Bitcoin is $${price}`);
    }
});
