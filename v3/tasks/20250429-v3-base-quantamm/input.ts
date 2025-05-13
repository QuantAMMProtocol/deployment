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
  AERO: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkFeedETH: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedUSDC: string;
  ChainlinkDataFeedAERO: string;
};

//TODO double check with Jeff this is network specific
const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

const BtcChainlinkOracleWrapper = new Task('20250419-v3-btc-oraclewrapper', TaskMode.READ_ONLY);

const UsdcChainlinkOracleWrapper = new Task('20250419-v3-usdc-oraclewrapper', TaskMode.READ_ONLY);

const AeroChainlinkOracleWrapper = new Task('20250513-v3-aero-oraclewrapper', TaskMode.READ_ONLY);

const UpdateWeightRunner = new Task('20250419-v3-update-weight-runner', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250429-v3-quantamm' };

export default {
  Vault,
  ChainlinkFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  ChainlinkDataFeedAERO: AeroChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  UpdateWeightRunner,
  base: {
    WETH: '0x4200000000000000000000000000000000000006', //https://basescan.org/token/0x4200000000000000000000000000000000000006
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', //https://basescan.org/token/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
    AERO: '0x940181a94a35a4569e4529a3cdfb74e38fd98631', //https://basescan.org/token/0x940181a94a35a4569e4529a3cdfb74e38fd98631
    CBBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', //https://basescan.org/token/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf
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
  ethContract: string,
  ethOracle: string,
  usdcContract: string,
  usdcOracle: string,
  aeroContract: string,
  aeroOracle: string,
  cbbtcContract: string,
  cbbtcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [ethContract, usdcContract, aeroContract, cbbtcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));
  //NOTE: this is order USDC, BTC
  const lambdas = [
    bn('267951125131917500'), //ETH bn('0.2679511251319175')
    bn('600918238558535700'), //USDC bn('0.6009182385585357')
    bn('992592227383543500'), //AERO bn('0.9925922273835435')
    bn('978430901814435100'), //CBBTC bn('0.9784309018144351')
  ];

  const movingAverages = [
    bn('2499566457143231700000'), //ETH bn('2499.5664571432317')
    bn('999890611082409400'), //USDC bn('0.99989061108240940')
    bn('829783009056645150'), //AERO bn('0.82978300905664515')
    bn('91019006981608458000000'), //CBBTC bn('91019.006981608458')
  ];

  const intermediateValues = [
    bn('6549031836964776000'), //ETH bn('6.5490318369647760)
    bn('-126518006550601'), //USDC bn('-0.00012651800655060131')
    bn('-2479468808249065700000'), //AERO bn('-2479.4688082490657')
    bn('4301480063404688600000000'), //CBBTC bn('4301480.0634046886')
  ];

  const parameters = [
    [
      bn('22454340260829458000'), //ETH bn('22.454340260829458)
      bn('306592966262187470000'), //USDC bn('306.59296626218747)
      bn('15993676043305522000000'), //AERO bn('15993.676043305522)
      bn('938167832835294460000'), //CBBTC bn('938.16783283529446)
    ], //kappa
    [
      bn('1000000000000000010'), //ETH bn('1)
      bn('1000000000000000010'), //USDC bn('1)
      bn('2470546311020233300'), //AERO bn('2.4705463110202333)
      bn('1000000000000000010'), //CBBTC bn('1)
    ], //exponents
  ];

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [ethOracle], // ETH
    [usdcOracle], // USDC
    [aeroOracle], // AERO
    [cbbtcOracle], // CBBTC
  ];
  //[ETH, USDC, AERO, CBBTC]
  //[0.3962692683589116, 0.03, 0.03, 0.5437307316410883]
  const normalizedWeights = [
    bn('396269268000000000'),
    bn('30000000000000000'),
    bn('30000000000000000'),
    bn('543730732000000000'),
  ];
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
    name: 'BASE MACRO-WETH:USDC:AERO:cbBTC',
    symbol: 'BTF:BMAC',
    tokens: tokenConfig,
    normalizedWeights,
    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    swapFeePercentage: fp(0.0003),
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
