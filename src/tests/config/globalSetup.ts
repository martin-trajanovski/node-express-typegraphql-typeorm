import { exec } from 'child_process';
import * as util from 'util';

import { config } from 'dotenv';
config({ path: '.env.test' });

export default async () => {
  const CMD_DROP_SEED_DATABASE = `${__dirname}/../scripts/runDropAndSeedTestDB.sh`;
  const pExec = util.promisify(exec);

  await pExec(CMD_DROP_SEED_DATABASE);
};
