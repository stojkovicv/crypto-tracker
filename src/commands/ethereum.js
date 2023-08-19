const { FetchError } = require('../errors');
const { FETCH_ERROR } = require('../utils/errorMessages');

let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});


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

module.exports = {
    getEthereumPrice
};