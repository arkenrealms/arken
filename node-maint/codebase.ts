import { spawn, exec } from 'child_process';
import { wait } from '.';

export async function upgradeCodebase() {
  // Pull latest from Git
  const execPromise = require('util').promisify(exec);

  try {
    await execPromise('rm .git/index.lock');
  } catch (e2) {
    console.log(e2);
  }

  const { stdout, stderr } = await execPromise('git add -A && git stash && git pull', { uid: 1000 });

  console.log(stderr, stdout);

  await wait(100);
}

export async function upgradeGsCodebase() {
  // Pull latest from Git
  const execPromise = require('util').promisify(exec);

  // try {
  //   await execPromise('cd game-server && rm .git/index.lock', {uid: 1000})
  //   await wait(1000)
  // } catch(e2) {
  //   console.log(e2)
  // }

  const { stdout, stderr } = await execPromise('cd game-server && git add -A && git stash && git pull origin master', {
    uid: 1000,
  });

  console.log(stderr, stdout);

  await wait(100);
}

export async function cloneGsCodebase(repoUri) {
  // Pull latest from Git
  const execPromise = require('util').promisify(exec);

  // try {
  //   await execPromise('rm -rf game-server', {uid: 1000})
  // } catch(e2) {
  //   console.log(e2)
  // }

  const { stdout, stderr } = await execPromise(`git clone ${repoUri} game-server`, { uid: 1000 }); // git@github.com:RuneFarm/rune-evolution-game-server.git

  console.log(stderr, stdout);

  await wait(100);
}
