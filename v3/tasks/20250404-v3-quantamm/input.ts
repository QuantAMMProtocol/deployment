import { MONTH } from '@helpers/time';
import { Task, TaskMode } from '@src';
import { bn, fp } from '@helpers/numbers';
import { ZERO_ADDRESS } from '@helpers/constants';
import { BigNumber } from 'ethers';

export type QuantAMMDeploymentInputParams = {
  Vault: string;
  PauseWindowDuration: number;
  USDC: string;
  WBTC: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedUSDC: string;
  ChainlinkDataFeedBTC: string;
};

const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const ChainlinkSepoliaDataFeedETH = '0x694AA1769357215DE4FAC081bf1f309aDC325306';
const ChainlinkSepoliaDataFeedUSDC = '0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E';
const ChainlinkSepoliaDataFeedBTC = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';

//https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=eth+%2F+usd
const ChainlinkMainnetDataFeedETH = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';

//https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=usdc+%2F+usd
const ChainlinkMainnetDataFeedUSDC = '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6';

//https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=btc+%2F+usd
const ChainlinkMainnetDataFeedBTC = '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43';

const BaseVersion = { version: 1, deployment: '20250313-v3-quantamm' };

export default {
  Vault,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  sepolia: {
    ChainlinkFeedETH: ChainlinkSepoliaDataFeedETH,
    ChainlinkDataFeedUSDC: ChainlinkSepoliaDataFeedUSDC,
    ChainlinkDataFeedBTC: ChainlinkSepoliaDataFeedBTC,
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
  },
  mainnet: {
    ChainlinkFeedETH: ChainlinkMainnetDataFeedETH,
    ChainlinkDataFeedUSDC: ChainlinkMainnetDataFeedUSDC,
    ChainlinkDataFeedBTC: ChainlinkMainnetDataFeedBTC,
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },
};

type PoolRoleAccounts = {
  // Define the structure based on Solidity contract
};

type TokenConfig = {
  token: string;
  rateProvider?: string;
  tokenType: number;
};

type PoolSettings = {
  assets: string[];
  rule: string;
  oracles: string[][];
  updateInterval: number;
  lambda: BigNumber[];
  epsilonMax: BigNumber;
  absoluteWeightGuardRail: BigNumber;
  maxTradeSizeRatio: BigNumber;
  ruleParameters: BigNumber[][];
  poolManager: string;
};

export type CreationNewPoolParams = {
  name: string;
  symbol: string;
  tokens: TokenConfig[];
  normalizedWeights: BigNumber[];
  roleAccounts: PoolRoleAccounts;
  swapFeePercentage: BigNumber;
  poolHooksContract: string;
  enableDonation: boolean;
  disableUnbalancedLiquidity: boolean;
  salt: string;
  _initialWeights: BigNumber[];
  _poolSettings: PoolSettings;
  _initialMovingAverages: BigNumber[];
  _initialIntermediateValues: BigNumber[];
  _oracleStalenessThreshold: BigNumber;
  poolRegistry: BigNumber;
  poolDetails: string[][];
};

export async function createPoolParams(
  usdcContract: string,
  usdcOracle: string,
  wtbcContract: string,
  wbtcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [
    usdcContract, // USDC Sepolia
    wtbcContract, // WBTC Sepolia
  ];

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));

  const sortedTokenConfig = tokenConfig.sort((a, b) => a.token.localeCompare(b.token));

  const lambdas = [bn('200000000000000000')];

  const intermediateValueStubs = [bn('1000000000000000000'), bn('1000000000000000000')];

  const parameters = [[bn('200000000000000000')]];

  const oracles = [
    [usdcOracle], // USDC
    [wbtcOracle], // WBTC
  ];

  const normalizedWeights = [fp(0.5), fp(0.5)];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [['overview', 'adaptabilityScore', 'number', '5']];

  const poolSettings: PoolSettings = {
    assets: tokens,
    rule: ruleAddress,
    oracles,
    updateInterval: 60,
    lambda: lambdas,
    epsilonMax: fp(0.01),
    absoluteWeightGuardRail: fp(0.01),
    maxTradeSizeRatio: fp(0.01),
    ruleParameters: parameters,
    poolManager: sender,
  };

  return {
    name: 'test quantamm pool 3',
    symbol: 'test',
    tokens: sortedTokenConfig,
    normalizedWeights,

    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    swapFeePercentage: fp(0.01),
    poolHooksContract: ZERO_ADDRESS,
    enableDonation: false,
    disableUnbalancedLiquidity: false,
    salt: salt,
    _initialWeights: intNormalizedWeights,
    _poolSettings: poolSettings,
    _initialMovingAverages: intermediateValueStubs,
    _initialIntermediateValues: intermediateValueStubs,
    _oracleStalenessThreshold: bn('360000000'),
    poolRegistry: bn('16'),
    poolDetails,
  };
}
