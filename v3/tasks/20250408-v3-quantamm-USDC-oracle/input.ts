export type QuantAMMDeploymentInputParams = {
  USDC: string;
  ChainlinkDataFeedUSDC: string;
};

const ChainlinkSepoliaDataFeedUSDC = '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E';

//https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=usdc+%2F+usd
const ChainlinkMainnetDataFeedUSDC = '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6';

export default {
  sepolia: {
    ChainlinkDataFeedUSDC: ChainlinkSepoliaDataFeedUSDC,
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  },
  mainnet: {
    ChainlinkDataFeedUSDC: ChainlinkMainnetDataFeedUSDC,
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
};
