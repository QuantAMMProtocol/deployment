import hre from 'hardhat';
import { Task, TaskRunOptions } from '@src';
import { QuantAMMDeploymentInputParams } from './input';
import { ZERO_ADDRESS } from '@helpers/constants';
import { Contract } from 'ethers';
import { bn } from '@helpers/numbers';

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
  console.log('updateWeightRunner', updateWeightRunner.interface.getSighash('addOracle'));
  const pool = '0x6fE415F986b12Da4381d7082CA0223a0a49771A9';
  const registryEntry = bn('17');
  console.log('add oracle Calldata:', updateWeightRunner.interface.encodeFunctionData('addOracle', [pool]));
  console.log(
    'setApprovedActionsForPool Calldata:',
    updateWeightRunner.interface.encodeFunctionData('setApprovedActionsForPool', [pool, registryEntry])
  );
  const futureDate = bn('10');
  console.log(
    'InitialisePoolLastRunTime Calldata:',
    updateWeightRunner.interface.encodeFunctionData('InitialisePoolLastRunTime', [pool, futureDate])
  );

  await task.save({ UpdateWeightRunner: updateWeightRunner });
};
