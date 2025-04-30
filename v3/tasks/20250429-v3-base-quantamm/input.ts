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
  CBBTC: string;
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

const UpdateWeightRunner = new Task('20250419-v3-update-weight-runner', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250429-v3-quantamm' };

export default {
  Vault,
  ChainlinkFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  UpdateWeightRunner,
  base: {
    CBBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', //https://basescan.org/token/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', //https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
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
  cbbtcContract: string,
  cbbtcOracle: string,
  usdcContract: string,
  usdcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [usdcContract, cbbtcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));
  //NOTE: this is order USDC, BTC
  const lambdas = [bn('289524066401247700'), bn('811035769801363300')];
  //const lambdas = [bn('0.811035769801363300'), bn('0.289524066401247700')];

  const movingAverages = [bn('999975466198190900'), bn('90950694357815940000000')];
  //const movingAverages = [bn('90950.69435781594'), bn('0.9999754661981909')];

  const intermediateValues = [bn('76674211432404'), bn('101053147538869670000000')];
  //const intermediateValues = [bn('101053.14753886967'), bn('0.000076674211432404264')];

  //NOTE: this is order USDC, BTC
  const parameters = [
    [bn('255928993330991830000'), bn('1390968414526753800000')], //kappa
    [bn('1000000000000000100'), bn('1531232793117663900')], //exponents
  ];

  //const parameters = [
  //  [bn('1390.968414526753800000'), bn('806.695362159777100000'), bn('255.928993330991830000')], //kappa
  //  [bn('1.531232793117663900'), bn('1.000000000000000100'), bn('1.000000000000000100')], //exponents
  //];

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [usdcOracle], // USDC
    [cbbtcOracle], // cbbtc
  ];

  const normalizedWeights = [fp(0.03), fp(0.97)];
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [
    ['overview', 'adaptabilityScore', 'number', '5'],
    ['strategy', 'name', 'string', 'Power Channel'],
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
    name: 'TEST - DO NOT USE',
    symbol: 'BTF:TEST',
    tokens: tokenConfig,
    normalizedWeights,
    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    swapFeePercentage: fp(0.0001),
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
