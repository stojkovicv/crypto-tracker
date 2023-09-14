const { FetchError } = require('../errors'); 
const { FETCH_ERROR } = require('../utils/errorMessages');
const alertEmitter = require('../../AlertEmitter');
const axios = require('axios');


let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});

async function getBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur,usd');
        const data = await response.json();
        if (data && data.bitcoin && data.bitcoin.eur && data.bitcoin.usd) {
            return {
                eur: data.bitcoin.eur,
                usd: data.bitcoin.usd
            };
        } else {
            throw new FetchError("Data format is incorrect");
        }
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function getBitcoinPriceInEUR() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur');
        const data = await response.json();
        if (data && data.bitcoin && data.bitcoin.eur) {
            return {
                eur: data.bitcoin.eur
            };
        } else {
            throw new FetchError("Data format is incorrect");
        }
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function fetchBitcoinPastValues(number_of_days, currency = 'usd') {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${number_of_days}&interval=daily`);
        const data = await response.json();
        if (!data.prices) {
            throw new FetchError(`Invalid currency: ${currency.toUpperCase()}`);
        }
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

let lastPrice = null;

function startBitcoinPriceAlert(lowerBound, upperBound){
    console.log('Bitcoin price detecting started: ');

    const intervalId = setInterval(async () => {
        try {
            const currentPrice = await getBitcoinPriceInEUR();
            //console.log('Fetched new price:', currentPrice);

            if (lastPrice && lastPrice.eur === currentPrice.eur) {
                //console.log('Emitting noChange event');
                alertEmitter.emit('noChange');
            } else if (currentPrice.eur <= lowerBound || currentPrice.eur >= upperBound) {
                //console.log('Emitting priceChange event');
                alertEmitter.emit('priceChange', currentPrice.eur);
            }
            
            lastPrice = currentPrice;
        } catch (error) {
            //console.log('Emitting fetchError event');
            //console.error('Error fetching Bitcoin price:', error);
            alertEmitter.emit('fetchError');
        }
    }, 5000); // setted by default to 5 seconds (5000 ms)

    return intervalId;
}

async function fetchBitcoinNews() {
    const options = {
        method: 'GET',
        url: 'https://crypto-news11.p.rapidapi.com/cryptonews/bitcoin',
        params: {
            max_articles: '10',
            last_n_hours: '48',
            top_n_keywords: '10'
        },
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'crypto-news11.p.rapidapi.com'
        }
    };
    
    let newsMessages = [];
    let currentMessage = 'Here are the top 10 latest Bitcoin news:\n';
    
    try {
        const response = await axios.request(options);
        const data = response.data;
        if(data.articles){
            const newsArray = data.articles.slice(0, 10);
        
            for (let i = 0; i < newsArray.length; i++) {
                const newsItem = newsArray[i];
                const line = `**${i + 1}. ${newsItem.title}**\n[Read more](<${newsItem.url}>)\n`;

                if ((currentMessage.length + line.length) > 2000) {
                    newsMessages.push(currentMessage);
                    currentMessage = '';
                }

                currentMessage += line;
            }
            if (currentMessage) {
                newsMessages.push(currentMessage);
            }
        }else {
            newsMessages.push('Failed to fetch the news.')
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        newsMessages.push('An error occurred while fetching news.');
    }
    return newsMessages;
}

module.exports = {
    getBitcoinPrice,
    fetchBitcoinPastValues,
    generateQuickChartUrl,
    startBitcoinPriceAlert,
    fetchBitcoinNews
};