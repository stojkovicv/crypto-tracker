const { FetchError } = require('../errors');
const { FETCH_ERROR } = require('../utils/errorMessages'); 
const alertEmitter = require('../../AlertEmitter');


let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});


async function getEthereumPrice(){
    try{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur,usd');
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.eur && data.ethereum.usd) {
            return {
                eur: data.ethereum.eur,
                usd: data.ethereum.usd
            };
        } else {
            throw new FetchError("Data format is incorrect");
        }
    } catch (error) {
        console.error("Error fetching Ethereum price:", error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function getEthereumPriceInEUR(){
    try{
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur');
        const data =  await response.json();
        if (data && data.ethereum && data.ethereum.eur) {
            return {
                eur: data.ethereum.eur
            };
        } else {
            throw new FetchError("Data format is incorrect");
        }
    }
        catch (error) {
            console.error("Error fetching Bitcoin price:", error);
            throw new FetchError(FETCH_ERROR);
        }
    }

async function fetchEthereumPastValues(number_of_days, currency = 'usd'){
    try{
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=${currency}&days=${number_of_days}&interval=daily`);
        const data = await response.json();
        if (!data.prices) {
            throw new FetchError(`Invalid currency: ${currency.toUpperCase()}`);
        }
        console.log(`Fetched Ethereum past prices in ${currency.toUpperCase()}:`, data.prices);
        return data.prices;
    } catch (error) {
        console.error(`Error fetching Ethereum past prices in ${currency.toUpperCase()}:`, error);
        throw new FetchError(FETCH_ERROR);
    }
}

async function generateQuickChartUrlEthereum(labels, data, number_of_days, currency = 'usd') {
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
                label: `Ethereuem Price (${currency.toUpperCase()})`,
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
                text: `Ethereum price in past ${number_of_days} days`
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

function startEthereumPriceAlert(lowerBound, upperBound){
    console.log('Ethereum price detecting started: ');

    setInterval(async () => {
        try {
            const currentPrice = await getEthereumPriceInEUR();

            if (lastPrice && lastPrice.eur === currentPrice.eur) {
                alertEmitter.emit('noChange');
            } else if (currentPrice.eur <= lowerBound || currentPrice.eur >= upperBound) {
                alertEmitter.emit('priceChange', currentPrice.eur);
            }
            
            lastPrice = currentPrice;
        } catch (error) {
            alertEmitter.emit('fetchError');
        }
    }, 5000);
}

module.exports = {
    getEthereumPrice,
    fetchEthereumPastValues,
    generateQuickChartUrlEthereum,
    startEthereumPriceAlert
};