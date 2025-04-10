export type QuantAMMDeploymentInputParams = {
  WBTC: string;
  ChainlinkDataFeedBTC: string;
};

const ChainlinkSepoliaDataFeedBTC = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';

//https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=btc+%2F+usd
const ChainlinkMainnetDataFeedBTC = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';

export default {
  sepolia: {
    ChainlinkDataFeedBTC: ChainlinkSepoliaDataFeedBTC,
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
  },
  mainnet: {
    ChainlinkDataFeedBTC: ChainlinkMainnetDataFeedBTC,
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
};
