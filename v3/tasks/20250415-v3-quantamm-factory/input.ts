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
  WETH: string;
  DAI: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedUSDC: string;
  ChainlinkDataFeedBTC: string;
};

const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250410-v3-quantamm-factory' };

export default {
  Vault,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  sepolia: {
    ChainlinkFeedETH: '0xebd5B40FF5cF434c1474b9dD13B6127eEA2a55Cb',
    ChainlinkDataFeedUSDC: '0x8A493D14A9870f8D02027009273De605a1e7f79e',
    ChainlinkDataFeedBTC: '0x8381b86e307112bB88c3a15Dd0a46610AE53D372',
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    DAI: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
  },
  mainnet: {
    ChainlinkFeedETH: '0xebd5B40FF5cF434c1474b9dD13B6127eEA2a55Cb',
    ChainlinkDataFeedUSDC: '0x8A493D14A9870f8D02027009273De605a1e7f79e',
    ChainlinkDataFeedBTC: '0x8381b86e307112bB88c3a15Dd0a46610AE53D372',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    DAI: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
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
  ethContract: string,
  ethOracle: string,
  daiContract: string,
  daiOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [wtbcContract, ethContract, usdcContract, daiContract];

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));

  const sortedTokenConfig = tokenConfig.sort((a, b) => a.token.localeCompare(b.token));

  const lambdas = [bn('20000000000000000')];

  const intermediateValueStubs = [
    bn('1000000000000000000'),
    bn('1000000000000000000'),
    bn('1000000000000000000'),
    bn('1000000000000000000'),
  ];

  const parameters = [[bn('20000000000000000000')]];

  const oracles = [
    [wbtcOracle], // WBTC
    [ethOracle], // WETH
    [usdcOracle], // USDC
    [daiOracle], // DAI
  ];

  const normalizedWeights = [fp(0.25), fp(0.25), fp(0.25), fp(0.25)];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [['overview', 'adaptabilityScore', 'number', '5']];

  const poolSettings: PoolSettings = {
    assets: tokens,
    rule: ruleAddress,
    oracles,
    updateInterval: 3600,
    lambda: lambdas,
    epsilonMax: fp(0.999),
    absoluteWeightGuardRail: fp(0.01),
    maxTradeSizeRatio: fp(0.01),
    ruleParameters: parameters,
    poolManager: sender,
  };

  return {
    name: 'test long running 4 tokens new',
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
