export type QuantAMMDeploymentInputParams = {
  ChainlinkFeedETH: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedPAXG: string;
  ChainlinkDataFeedUSDC: string;
};

export default {
  sepolia: {
    ChainlinkFeedETH: '0x694AA1769357215DE4FAC081bf1f309aDC325306', //https://sepolia.etherscan.io/address/0x694AA1769357215DE4FAC081bf1f309aDC325306
    ChainlinkDataFeedBTC: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43', //https://sepolia.etherscan.io/address/0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
    ChainlinkDataFeedPAXG: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43', //no PAXG on Sepolia, duplicate btc
    ChainlinkDataFeedUSDC: '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E', //https://sepolia.etherscan.io/address/0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E
  },
  mainnet: {
    ChainlinkFeedETH: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', //https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
    ChainlinkDataFeedBTC: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', // https://etherscan.io/address/0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
    ChainlinkDataFeedPAXG: '0x9944D86CEB9160aF5C5feB251FD671923323f8C3', //https://etherscan.io/address/0x9944D86CEB9160aF5C5feB251FD671923323f8C3
    ChainlinkDataFeedUSDC: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6', //https://etherscan.io/address/0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6
  },
};
