import { ZERO_ADDRESS } from '@helpers/constants';
import { Task, TaskMode } from '@src';

const EthChainlinkOracleWrapper = new Task('20250419-v3-eth-oraclewrapper', TaskMode.READ_ONLY);

export type QuantAMMDeploymentInputParams = {
  QuantAMMAdmin: string;
  ChainlinkFeedETH: string;
};

export default {
  sepolia: {
    QuantAMMAdmin: ZERO_ADDRESS,
    ChainlinkFeedETH: EthChainlinkOracleWrapper,
  },
  mainnet: {
    QuantAMMAdmin: 'TODO',
    ChainlinkFeedETH: EthChainlinkOracleWrapper,
  },
};
