import { Task, TaskRunOptions } from '@src';
import { QuantAMMDeploymentInputParams } from './input';

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as QuantAMMDeploymentInputParams;

  const chainlinkUsdcOracleWrapper = await task.deployAndVerify(
    'ChainlinkOracle',
    [input.ChainlinkDataFeedUSDC],
    from,
    force
  );

  console.log('usdcOracle', input.ChainlinkDataFeedUSDC);
  console.log('chainlinkUsdcOracleWrapper', chainlinkUsdcOracleWrapper.address);

  await task.save({ ChainlinkUsdcOracle: chainlinkUsdcOracleWrapper });
};
