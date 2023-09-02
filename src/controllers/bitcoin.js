const { FetchError } = require('../errors'); 
const { FETCH_ERROR } = require('../utils/errorMessages');
const alertEmitter = require('../../AlertEmitter');


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

module.exports = {
    getBitcoinPrice,
    fetchBitcoinPastValues,
    generateQuickChartUrl,
    startBitcoinPriceAlert
};