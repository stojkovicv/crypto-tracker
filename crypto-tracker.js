// Loading dependencies
const {Client, Events, GatewayIntentBits} = require('discord.js');
const { FetchError } = require('./errors');
const { FETCH_ERROR } = require('./errorMessages');


let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

// Discord client initializaion
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent]
});

require('dotenv').config();

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
});

const token = process.env.BOT_TOKEN;
client.login(token);


async function getBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur,usd');
        const data = await response.json();
        console.log("Fetched Bitcoin price:", data.bitcoin.eur);
        return {
            eur: data.bitcoin.eur,
            usd: data.bitcoin.usd
        };
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function fetchBitcoinPastPrices(number_of_days, currency = 'usd') {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${number_of_days}&interval=daily`);
        const data = await response.json();
        console.log(`Fetched Bitcoin past prices in ${currency.toUpperCase()}:`, data.prices);
        return data.prices;
    } catch (error) {
        console.error(`Error fetching Bitcoin past prices in ${currency.toUpperCase()}:`, error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function generateQuickChartUrl(labels, data, number_of_days, currency = 'usd') {
    const currencySymbol = currency === 'usd' ? '$' : '€';
    const chartConfig = {
        type: 'line',
        data: {
            labels: labels.map(date => {
                const d = new Date(date);
                const twoDigitYear = d.getFullYear().toString().slice(-2);
                return `${d.getDate()}.${d.toLocaleString('default', { month: 'short' })}.${twoDigitYear}`;
            }),
            datasets: [{
                label: `Bitcoin Price (${currency.toUpperCase()})`,
                data: data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                yAxisID: `y-axis-${currency}`
            }]
        },
        options: {
            title: {
                display: true,
                text: `Bitcoin price in past ${number_of_days} days`
            },
            scales: {
                yAxes: [{
                    id: `y-axis-${currency}`,
                    ticks: {
                        callback: function(value, index, values) {
                            return currencySymbol + value;
                        }
                    }
                }]
            }
        }
    };

    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `https://quickchart.io/chart?c=${encodedConfig}`;
}


async function getEthereumPrice(){
    try{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur,usd');
        const data = await response.json();
        console.log("Fetched Ethereum price:", data.ethereum.eur);
        return {
            eur: data.ethereum.eur,
            usd: data.ethereum.usd
        };
    } catch (error) {
        console.error("Error fetching Ethereum price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

client.on('messageCreate', async message => {

    console.log(`Received message from ${message.author.tag} in ${message.guild ? message.guild.name : 'DM'}:`);
    console.log(`Content: ${message.content}`);

    // Ignore messages from bots
    if (message.author.bot) return;

    else if (message.content === '!bitcoin') {
        try {
            const prices = await getBitcoinPrice();
            message.channel.send(`The current price of Bitcoin is €${prices.eur} which is $${prices.usd} USD.`);
        } catch (error) {
            if (error instanceof FetchError) {
                message.channel.send(error.message);
            } else {
                message.channel.send('An unexpected error occurred.');
            }
        }
    }

    else if (message.content.startsWith('!bitcoin ')) {
        const splitMessage = message.content.split(' ');
        const number_of_days = parseInt(splitMessage[1]);
        const currency = splitMessage[2] || 'usd';  // USD by default

        if (number_of_days > 30) {
            return message.channel.send("Maximum insight of historical data is within range of 30 days");
        }
        if (number_of_days < 1) {
            return message.channel.send("Please enter the valid number of previous days.");
        }

        // Check if the command has extra parameters
        if (splitMessage.length > 3) {
            return message.channel.send("Sorry, I don't recognize that command, try once again");
        }
    
        if (number_of_days && number_of_days <= 30) {
            const data = await fetchBitcoinPastPrices(number_of_days, currency);
            const dates = data.map(item => new Date(item[0]).toLocaleDateString());
            const prices = data.map(item => item[1]);
            const chartUrl = await generateQuickChartUrl(dates, prices, number_of_days, currency);
            message.channel.send(chartUrl);
        }
    }

    else if(message.content === '!ethereum'){
        try{
            const prices = await getEthereumPrice();
            message.channel.send(`The current price of Ethereum is €${prices.eur} which is $${prices.usd} USD.`);
        } catch (error) {
            if (error instanceof FetchError) {
                message.channel.send(error.message);
            } else {
                message.channel.send('An unexpected error occurred.');
            }
        }
    }

    else {
        message.channel.send("Sorry, I don't recognize that command, try once again");
    }

});