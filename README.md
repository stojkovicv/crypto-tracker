# Crypto Values Tracking Discord bot
This (side) project represents independetly driven work around Discord services to fetch latest information about most valuable crypto currencies - BTC and ETH. It provides few analytical functionalities to achieve better insight of the past crypto values, their flow and overall information through news.

## Message prompts
In order to get precise data from the bot, you have to use very specific format of messages. Here is the main list of prompts and explanation on what they're going to response:

| Message Command | Description |
|-----------------|-------------|
| `!bitcoin`      | Retrieves current value for BTC in EUR and USD.| 
| `!bitcoin [days] [currency]` | Retrieves the graphical representation of Bitcoin values for the specified number of past days in the given currency. The currency flag is optional, and default one is USD.|
| `!ethereum`     | Retrieves current value for ETH in EUR and USD.|
| `!ethereum [days] [currency]` | Retrieves the graphical representation of Ethereum values for the specified number of past days in the given currency. The currency flag is optional, and default one is USD.|
| `!bitcoin alert [lower_bound][upper_bound]` | Starts price detecting in specified range for BTC, sending alerts on every 5 seconds about value changes.|
| `!ethereum alert [lower_bound][upper_bound]` | Starts price detecting in specified range for ETH, sending alerts on every 5 seconds about value changes.|
|`!bitcoin news`|Displays titles with links to latest 10 news for Bitcoin.|
|`!ethereum news`|Displays titles with links to latest 10 news for Ethereum.|

![Alt text]([https://user-images.githubusercontent.com/71947247/268233294-aee39799-c60c-4d39-8a4a-717705579173.png](https://user-images.githubusercontent.com/71947247/268234532-20d6388e-c8da-4ff3-9ca8-eda12ff5327d.png))

## Initialize Discord server
This bot project is not hosted at any of virtual machines of cloud providers. What you can do in order to run it is to follow the simple guide on how to create you own bot at Discord, generate URL and basically activate it on your own server. Then you have to use specific Discord API key in order to establish the connection between bot and Discord. Once the bot is running, you can test it and use it directly within your server. I am currently looking into various options on publishing it for wider Discord community.

## Run the program
Typically, you will run the JS program with `npm install` and `nodejs crypto-tracker.js`, however if you're providing changes, it's recommended to use `nodemon crypto-tracker.js` in order to track changes directly (hot reload). Please adapt your `package.json` accordingly.

## Fetching news API
Lot of news fetchers are coming with pricing, and since this idea is not what we want here - I found perfect news API at [RapidApi](https://rapidapi.com/hub) Hub. It's perfect place which gathers various APIs, and all you have to do is to register, subscribe for free licence and get you API key at your Developer space. The one that is utilized here for both crypto currencies is using `axios` and can be accessed, for more details, on its realted [page](https://rapidapi.com/Oliviervha/api/crypto-news11/).

## Unit test
Since there are many potential issues and wrong commands on which bot must to correspond accordingly, the unit test is written to test the code by mocking various messages, checking and proving if the implementation is working correctly. Be aware of dependencies needed for this test to run.
For running the unit test:
```
npx jest --clearCache
npx jest
```

## Conclusion
The main idea behind this project is "hands on" principle regarding several design patterns like `Module pattern`, and `Centralized error handling` as well as unit testing. Implementation of those design conventions keeps the project maintainable and easier for potential expansion, securing scalability and clean code. Current functionalities are done for 2 crypto currencies, which means that there is much of space to increase the complexity of this bot by involving plenty of other currencies. This project represent unique oportunity for improving development skills, but it also have potential to be used and expanded.
