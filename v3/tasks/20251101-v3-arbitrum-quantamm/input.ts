import { MONTH } from '@helpers/time';
import { Task, TaskMode } from '@src';
import { bn, fp } from '@helpers/numbers';
import { ZERO_ADDRESS } from '@helpers/constants';
import { BigNumber } from 'ethers';

export type QuantAMMDeploymentInputParams = {
  Vault: string;
  PauseWindowDuration: number;
  UpdateWeightRunner: string;
  WBTC: string;
  WETH: string;
  ARB: string;
  USDC: string;
  FactoryVersion: string;
  PoolVersion: string;
  ChainlinkDataFeedBTC: string;
  ChainlinkDataFeedETH: string;
  ChainlinkDataFeedARB: string;
  ChainlinkDataFeedUSDC: string;
};

//TODO double check with Jeff this is network specific
const Vault = new Task('20241204-v3-vault', TaskMode.READ_ONLY);

const BtcChainlinkOracleWrapper = new Task('20250419-v3-btc-oraclewrapper', TaskMode.READ_ONLY);

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

const ArbitrumChainlinkOracleWrapper = new Task('20251101-v3-arbitrum-oraclewrapper', TaskMode.READ_ONLY);

const UsdcChainlinkOracleWrapper = new Task('20250419-v3-usdc-oraclewrapper', TaskMode.READ_ONLY);

const UpdateWeightRunner = new Task('20250419-v3-update-weight-runner', TaskMode.READ_ONLY);

const BaseVersion = { version: 1, deployment: '20250429-v3-quantamm' };

export default {
  Vault,
  ChainlinkDataFeedBTC: BtcChainlinkOracleWrapper,
  ChainlinkDataFeedETH: EthChainlinkOracleWrapper,
  ChainlinkDataFeedARB: ArbitrumChainlinkOracleWrapper,
  ChainlinkDataFeedUSDC: UsdcChainlinkOracleWrapper,
  PauseWindowDuration: 4 * 12 * MONTH,
  FactoryVersion: JSON.stringify({ name: 'QuantAMMWeightedPoolFactory', ...BaseVersion }),
  PoolVersion: JSON.stringify({ name: 'QuantAMMWeightedPool', ...BaseVersion }),
  UpdateWeightRunner,
  arbitrum: {
    WBTC: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', //https://arbiscan.io/token/0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f
    WETH: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', //https://arbiscan.io/token/0x82af49447d8a07e3bd95bd0d56f35241523fbab1
    ARB:  '0x912ce59144191c1204e64559fe8253a0e49e6548', //https://arbiscan.io/token/0x912ce59144191c1204e64559fe8253a0e49e6548
    USDC: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', //https://arbiscan.io/token/0xaf88d065e77c8cc2239327c5edb3a432268e5831
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
  wethContract: string,
  wethOracle: string,
  arbitrumContract: string,
  arbitrumOracle: string,
  usdcContract: string,
  usdcOracle: string,
  ruleAddress: string,
  salt: string,
  sender: string
): Promise<CreationNewPoolParams> {
  const tokens = [wbtcContract, wethContract, arbitrumContract, usdcContract]; //address ordering as in InputHelper.sortTokens

  const rateProviders: string[] = [];

  const tokenConfig: TokenConfig[] = tokens.map((token, i) => ({
    token,
    rateProvider: rateProviders[i] || ZERO_ADDRESS,
    tokenType: 0,
  }));

  const lambdas = [
    bn('919711527604995600'),
    bn('822051697072590000'),
    bn('239792699294689700'),
    bn('827839649383967700'),
  ];
  //const lambdas = [bn('0.7872516012227267'), bn('0.5721879593136455'), bn('0.4479412201204208'), bn('0.929563018539273')];

  const movingAverages = [
    bn('111779933868326420000000'),
    bn('3847989961363638500000'),
    bn('295299998657162500'),
    bn('1000299751442566400'),
  ];
  //ewma/moving_averages: [109863.59970128881 2950.5316379195228 0.33858304282413315 0.99966178476072010]

  const intermediateValues = [
    bn('-248076638122501430000000'),
    bn('38636324709782'),
    bn('1342836237'),
    bn('248969021890'),
  ];

  //running_a / intermediate values: [712283.05767206685  101.10163817772678  0.30551803641640163 -0.00020296265410214614]

  //parameterDescriptions[0] = "Kappa: Kappa dictates the aggressiveness of response to a signal change.";
  //parameterDescriptions[1] = "Width: Width parameter for the mean reversion channel.";
  //parameterDescriptions[2] = "Amplitude: Amplitude of the mean reversion effect.";
  //parameterDescriptions[3] = "Exponents: Exponents for the trend following portion.";
  //parameterDescriptions[4] = "Inverse Scaling: Scaling factor for channel portion. "
  //    "If set to max(exp(-x^2/2)sin(pi*x/3)) [=0.541519...] "
  //    "then the amplitude parameter directly controls the channel height.";
  //parameterDescriptions[5] = "Pre-exp Scaling: Scaling factor before exponentiation in the trend following portion.";
  //parameterDescriptions[6] = "Use raw price: 0 = use moving average, 1 = use raw price for denominator of price gradient.";

  const parameters = [
    [bn('150654832733450560000000000'), bn('203110007931067010'), bn('9501338249305'), bn('241309454388379')], //kappa
    [bn('12633082257097033728'), bn('31308252581'), bn('202213781423'), bn('161112518936386404352')], //width
    [bn('604394164861942104064'), bn('8635367263'), bn('532118052'), bn('84604335206')], //amplitude
    [bn('10667670607134879744'), bn('98158358774211856'), bn('225615358466359168'), bn('67448682870645096')], //exponents
    [bn('541500000000000000'), bn('541500000000000000'), bn('541500000000000000'), bn('541500000000000000')], //inverse scaling factor
    [bn('52117438545786159759360'), bn('2379712256089681920'), bn('71022251927001989120'), bn('25014035401443512')], //Pre-exp Scaling
    [bn('0')], //Use Raw Price
  ];

  //const parameters = [
  //  [bn('1390.968414526753800000'), bn('806.695362159777100000'), bn('255.928993330991830000')], //kappa
  //  [bn('1.531232793117663900'), bn('1.000000000000000100'), bn('1.000000000000000100')], //exponents
  //];

  //again this is in InputHelper.sortTokens order
  const oracles = [
    [wbtcOracle], // WBTC
    [wethOracle], // WETH
    [arbitrumOracle], // ARB
    [usdcOracle], // USDC
  ];

  const normalizedWeights = [
    bn('910000000000000000'),
    bn('030000000000000000'),
    bn('030000000000000000'),
    bn('030000000000000000'),
  ];
  
  const intNormalizedWeights = [...normalizedWeights];

  const poolDetails = [
    ['overview', 'adaptabilityScore', 'number', '5'],
    ['ruleDetails', 'updateRuleName', 'string', 'Channel Following'],
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
    name: 'ARBITRUM MACRO BTF',
    symbol: 'ARBITRUM-MACRO-BTF',
    tokens: tokenConfig,
    normalizedWeights,
    roleAccounts: {
      pauseManager: ZERO_ADDRESS,
      swapFeeManager: ZERO_ADDRESS,
      poolCreator: ZERO_ADDRESS,
    },
    swapFeePercentage: fp(0.003),
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
