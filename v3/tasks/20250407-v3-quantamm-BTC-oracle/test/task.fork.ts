import hre from 'hardhat';
import { describeForkTest, getForkedNetwork, Task, TaskMode } from '@src';

describeForkTest('QuantAMM_BTC_Oracle', 'sepolia', 7894343, function () {
  let task: Task;

  const TASK_NAME = '20250407-v3-quantamm';

  before('run task', async () => {
    task = new Task(TASK_NAME, TaskMode.TEST, getForkedNetwork(hre));
    await task.run({ force: true });
  });

  it('checks oracles', async () => {
    await task.instanceAt('ChainlinkOracle', task.output().ChainlinkBtcOracle);
  });
});
