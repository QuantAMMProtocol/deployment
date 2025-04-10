import { Task, TaskRunOptions } from '@src';
import { QuantAMMDeploymentInputParams } from './input';

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as QuantAMMDeploymentInputParams;

  const chainlinkBtcOracleWrapper = await task.deployAndVerify(
    'ChainlinkOracle',
    [input.ChainlinkDataFeedBTC],
    from,
    force
  );
  console.log('btcOracle', input.ChainlinkDataFeedBTC);
  console.log('chainlinkBtcOracleWrapper', chainlinkBtcOracleWrapper.address);

  await task.save({ ChainlinkBtcOracle: chainlinkBtcOracleWrapper });
};
