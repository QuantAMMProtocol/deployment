import { MONTH } from '@helpers/time';
import { Task, TaskMode } from '@src';
import { bn, fp } from '@helpers/numbers';
import { ZERO_ADDRESS } from '@helpers/constants';
import { BigNumber } from 'ethers';

export type QuantAMMDeploymentInputParams = {
  Vault: string;
  PauseWindowDuration: number;
  ETH: string;
  WBTC: string;
  USDC: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedUSDC: string;
};

//TODO double check with Jeff this is network specific
const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

const BtcChainlinkOracleWrapper = new Task('20250419-v3-btc-oraclewrapper', TaskMode.READ_ONLY);

const UsdcChainlinkOracleWrapper = new Task('20250419-v3-usdc-oraclewrapper', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250415-v3-btc-pool' };

export default {
  Vault,
  ChainlinkFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  sepolia: {
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  },
  mainnet: {
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', //https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
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
  usdcContract: string,
  usdcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [wbtcContract, usdcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));

  //TODO MW/CH change to initialised lambdas
  const lambdas = [bn('976526300000000000'), bn('974561500000000000')];

  //TODO MW/CH change to initialised moving avg values
  const movingAverages = [bn('87294577274510000000000'), bn('1000000000000000000')];

  //TODO MW/CH change to initialised intermediate values
  const intermediateValues = [bn('1000000000000000000'), bn('1000000000000000000')];

  //TODO MW/CH change to initialised kappa requirements
  const parameters = [
    [bn('69394810000000000000'), bn('9854956000000000000')], //kappa
    [bn('006378590000000000'), bn('002665890000000000')], //width
    [bn('001469020000000000'), bn('001033990000000000')], //amplitude
    [bn('1425192741481919900'), bn('1217790317532691600')], //exponents
    [bn('541500000000000000'), bn('541500000000000000')], //inverse scaling
    [bn('000742510000000000'), bn('000209740000000000')], //pre-exp scaling
    [bn('0000000000000000000')], //use raw price
  ];

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [wbtcOracle], // WBTC
    [usdcOracle], // USDC
  ];

  //TODO MW/CH change to initialised weights
  const normalizedWeights = [fp(0.5), fp(0.5)];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [
    ['overview', 'adaptabilityScore', 'number', '5'],
    ['strategy', 'name', 'string', 'Momentum'],
  ];

  const poolSettings: PoolSettings = {
    assets: tokens,
    rule: ruleAddress,
    oracles,
    updateInterval: 3600,
    lambda: lambdas,
    epsilonMax: fp(0.0003),
    absoluteWeightGuardRail: fp(0.03),
    maxTradeSizeRatio: fp(0.01),
    ruleParameters: parameters,
    poolManager: sender,
  };

  return {
    name: 'Test BTF',
    symbol: 'BTF',
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
