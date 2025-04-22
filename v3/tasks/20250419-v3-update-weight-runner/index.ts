import hre from 'hardhat';
import { Task, TaskRunOptions } from '@src';
import { QuantAMMDeploymentInputParams } from './input';
import { ZERO_ADDRESS } from '@helpers/constants';

export default async (task: Task, { force, from }: TaskRunOptions = {}): Promise<void> => {
  const input = task.input() as QuantAMMDeploymentInputParams;
  const accounts = await hre.ethers.getSigners();
  const accountAddress = accounts[0].address;

  console.log('accountAddress', accountAddress);

  console.log('input', input.QuantAMMAdmin);
  let admin = input.QuantAMMAdmin;
  //test cases and deployment
  if (!input.QuantAMMAdmin || input.QuantAMMAdmin == ZERO_ADDRESS) {
    console.log('Setting QuantAMMAdmin to sender address');
    admin = accountAddress;
  }

  const updateWeightRunnerArgs = [admin, input.ChainlinkFeedETH];
  console.log('updateWeightRunnerArgs', updateWeightRunnerArgs);
  const updateWeightRunner = await task.deployAndVerify('UpdateWeightRunner', updateWeightRunnerArgs, from, force);
  await task.save({ UpdateWeightRunner: updateWeightRunner });
};
