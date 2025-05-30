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
  SONIC: string;
  USDC: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedSONIC: string;
  ChainlinkDataFeedUSDC: string;
};

//TODO double check with Jeff this is network specific
const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

const BtcChainlinkOracleWrapper = new Task('20250419-v3-btc-oraclewrapper', TaskMode.READ_ONLY);

const UsdcChainlinkOracleWrapper = new Task('20250419-v3-usdc-oraclewrapper', TaskMode.READ_ONLY);

const SonicChainlinkOracleWrapper = new Task('20250419-v3-sonic-oraclewrapper', TaskMode.READ_ONLY);

const UpdateWeightRunner = new Task('20250419-v3-update-weight-runner', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250530-v3-sonic-quantamm' };

export default {
  Vault,
  ChainlinkFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedSONIC: SonicChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  UpdateWeightRunner,
  sepolia: {
    WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
    SONIC: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', //no PAXG on Sepolia
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
    WETH: '0x45804880de22913dafe09f4980848ece6ecbaf78',
  },
  sonic: {
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    SONIC: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    WETH: '0x45804880de22913dafe09f4980848ece6ecbaf78',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
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
  sonicContract: string,
  sonicOracle: string,
  ethContract: string,
  ethOracle: string,
  usdcContract: string,
  usdcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [wbtcContract, sonicContract, ethContract, usdcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));
  //NOTE: this is order BTC, PAXG, USDC
  const lambdas = [
    bn('811035769801363300'),
    bn('781490597023096500'),
    bn('289524066401247700'),
    bn('289524066401247700'),
  ];
  //const lambdas = [bn('0.811035769801363300'), bn('0.781490597023096500'), bn('0.289524066401247700')];

  const movingAverages = [
    bn('94942928796381976374946'),
    bn('3318477539169648631581'),
    bn('999995937643198773'),
    bn('999995937643198773'),
  ];
  //const movingAverages = [bn('94942.928796381976374946'), bn('3318.477539169648631581'), bn('0.999995937643198773')];

  const intermediateValues = [
    bn('47164825037595406235540'),
    bn('269029300295401773334'),
    bn('14503442449845'),
    bn('14503442449845'),
  ];
  //const intermediateValues = [bn('47164.825037595406235540'), bn('269.029300295401773334'), bn('0.000014503442449845')];

  //NOTE: this is order BTC, PAXG, USDC
  const parameters = [
    [
      bn('1390968414526753800000'),
      bn('806695362159777100000'),
      bn('255928993330991830000'),
      bn('255928993330991830000'),
    ], //kappa
    [bn('1531232793117663900'), bn('1000000000000000100'), bn('1000000000000000100'), bn('1000000000000000100')], //exponents
  ];

  //const parameters = [
  //  [bn('1390.968414526753800000'), bn('806.695362159777100000'), bn('255.928993330991830000')], //kappa
  //  [bn('1.531232793117663900'), bn('1.000000000000000100'), bn('1.000000000000000100')], //exponents
  //];

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [wbtcOracle], // WBTC
    [sonicOracle], // PAXG
    [ethOracle], // USDC
    [usdcOracle], // USDC
  ];

  const normalizedWeights = [
    bn('439096623000000000'),
    bn('462022194000000000'),
    bn('98881183000000000'),
    bn('98881183000000000'),
  ];
  //const normalizedWeights = [bn('0.439096623000000000'), bn('0.462022194000000000'), fp('0.098881183000000000')];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [
    ['overview', 'adaptabilityScore', 'number', '5'],
    ['ruleDetails', 'updateRuleName', 'string', 'Power Channel'],
  ];

  const poolSettings: PoolSettings = {
    assets: tokens,
    rule: ruleAddress,
    oracles,
    updateInterval: 86100,
    lambda: lambdas,
    epsilonMax: fp(0.432),
    absoluteWeightGuardRail: fp(0.03),
    maxTradeSizeRatio: fp(0.1),
    ruleParameters: parameters,
    poolManager: sender,
  };

  return {
    name: 'TEST - SONIC - DO NOT USE',
    symbol: 'TESTBTFS',
    tokens: tokenConfig,
    normalizedWeights,
    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    swapFeePercentage: fp(0.02),
    poolHooksContract: ZERO_ADDRESS,
    enableDonation: false,
    disableUnbalancedLiquidity: false,
    salt: salt,
    _initialWeights: intNormalizedWeights,
    _poolSettings: poolSettings,
    _initialMovingAverages: movingAverages,
    _initialIntermediateValues: intermediateValues,
    _oracleStalenessThreshold: bn('86760'), //1 day and 1 hour
    poolRegistry: bn('17'), //1 perform update, 3 getdata, 16 admin controlled.
    poolDetails,
  };
}
