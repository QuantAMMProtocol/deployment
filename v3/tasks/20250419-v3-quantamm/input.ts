import { MONTH } from '@helpers/time';
import { Task, TaskMode } from '@src';
import { bn, fp } from '@helpers/numbers';
import { ZERO_ADDRESS } from '@helpers/constants';
import { BigNumber } from 'ethers';

export type QuantAMMDeploymentInputParams = {
  Vault: string;
  PauseWindowDuration: number;
  UpdateWeightRunner: string;
  ETH: string;
  WBTC: string;
  PAXG: string;
  USDC: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedPAXG: string;
  ChainlinkDataFeedUSDC: string;
};

//TODO double check with Jeff this is network specific
const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

const BtcChainlinkOracleWrapper = new Task('20250419-v3-btc-oraclewrapper', TaskMode.READ_ONLY);

const UsdcChainlinkOracleWrapper = new Task('20250419-v3-usdc-oraclewrapper', TaskMode.READ_ONLY);

const PaxgChainlinkOracleWrapper = new Task('20250419-v3-paxg-oraclewrapper', TaskMode.READ_ONLY);

const UpdateWeightRunner = new Task('20250419-v3-update-weight-runner', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250419-v3-quantamm' };

export default {
  Vault,
  ChainlinkFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedPAXG: PaxgChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  UpdateWeightRunner,
  sepolia: {
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    PAXG: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', //no PAXG on Sepolia
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  },
  mainnet: {
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', //https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
    PAXG: '0x45804880de22913dafe09f4980848ece6ecbaf78', //https://etherscan.io/token/0x45804880de22913dafe09f4980848ece6ecbaf78
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
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
  wbtcContract: string,
  wbtcOracle: string,
  paxgContract: string,
  paxgOracle: string,
  usdcContract: string,
  usdcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [wbtcContract, paxgContract, usdcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));

  //TODO MW/CH change to initialised lambdas
  const lambdas = [bn('20000000000000000'), bn('20000000000000000'), bn('20000000000000000')];

  //TODO MW/CH change to initialised moving avg values
  const movingAverages = [bn('1000000000000000000'), bn('1000000000000000000'), bn('1000000000000000000')];

  //TODO MW/CH change to initialised intermediate values
  const intermediateValues = [bn('1000000000000000000'), bn('1000000000000000000'), bn('1000000000000000000')];

  //TODO MW/CH change to initialised kappa requirements
  const parameters = [
    [bn('20000000000000000000'), bn('20000000000000000000'), bn('20000000000000000000')], //kappa
    [bn('1000000000000000100'), bn('1000000000000000100'), bn('1000000000000000100')], //exponents
  ]; //exponents

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [wbtcOracle], // WBTC
    [paxgOracle], // PAXG
    [usdcOracle], // USDC
  ];

  //TODO MW/CH change to initialised weights
  const normalizedWeights = [fp(0.33333334), fp(0.33333333), fp(0.33333333)];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [
    ['overview', 'adaptabilityScore', 'number', '5'],
    ['strategy', 'name', 'string', 'Power Channel'],
    ['strategy', 'memoryDays', 'array', '[TODO]'],
    ['strategy', 'aggressiveness', 'number', 'TODO'],
  ];

  const poolSettings: PoolSettings = {
    assets: tokens,
    rule: ruleAddress,
    oracles,
    updateInterval: 86400,
    lambda: lambdas,
    epsilonMax: fp(0.999),
    absoluteWeightGuardRail: fp(0.03),
    maxTradeSizeRatio: fp(0.01),
    ruleParameters: parameters,
    poolManager: sender,
  };

  return {
    name: 'Safe Haven BTF',
    symbol: 'SH-BTF',
    tokens: tokenConfig,
    normalizedWeights,
    //TODO check with Juani re swapFeeManager and PauseManager and poolCreator
    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    //TODO confirm with Balancer what the swap fee percentage should be
    swapFeePercentage: fp(0.01),
    poolHooksContract: ZERO_ADDRESS,
    //TODO confirm if this should be set to true
    enableDonation: false,
    disableUnbalancedLiquidity: false,
    salt: salt,
    _initialWeights: intNormalizedWeights,
    _poolSettings: poolSettings,
    _initialMovingAverages: movingAverages,
    _initialIntermediateValues: intermediateValues,
    _oracleStalenessThreshold: bn('86760'), //1 day and 1 hour, TODO MW too generous?
    poolRegistry: bn('20'), //1 perform update, 3 getdata, 16 admin controlled.
    poolDetails,
  };
}
