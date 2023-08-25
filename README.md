# Crypto Values Tracking Discord bot

This project represents independetly driven work around Discord services to fetch a latest data about most valuable crypto currencies BTC and ETH. It also provides few analytical functionalities to achieve better insight of the past values and their flow.

# Initialize Discord server

# Run the program

# Unit test

# Message prompts
In order to get precise data from the bot, you have to use very specific format of messages. Here is the main list of prompts and explanation on what they're going to response:

| Message Command | Description |
|-----------------|-------------|
| `!bitcoin`      | Retrieves current value for BTC in EUR and USD.| 
| `!bitcoin [days] [currency]` | Retrieves the graphical representation of Bitcoin values for the specified number of past days in the given currency. The currency flag is optional, and default one is USD.|
| `!ethereum`     | Retrieves current value for ETH in EUR and USD.|
| `!ethereum [days] [currency]` | Retrieves the graphical representation of Ethereum values for the specified number of past days in the given currency. The currency flag is optional, and default one is USD.|

## Conclusion
The main idea behind this bot was to build a project that implements several design patterns like `Module pattern`, and `Centralized error handling`. Using those design conventions keeps the code maintainable and easier for potential expansion, securing scalability and clean code. Beside that, I wrote unit test as commonly good development practice to check error handlers and their response. Current functionalities are done for 2 crypto currencies, which means that there is much of space to increase the complexity of this bot by involving much other currencies.