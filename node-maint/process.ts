// import * as readline from 'readline';
import { exec } from 'child_process';
import { logError } from './log';

export const subProcesses = [];

export function addSubProcess(subProcess) {
  subProcesses.push(subProcess);
}

export function catchExceptions(kill = false) {
  process
    .on('unhandledRejection', (reason, p) => {
      console.log(reason, 'Unhandled Rejection at Promise', p);
      logError(reason + '. Unhandled Rejection at Promise:' + p);
    })
    .on('uncaughtException', (err) => {
      console.log('Uncaught Exception thrown', kill, err);
      // logError(err + ". Uncaught Exception thrown" + err.stack)
      if (kill) {
        process.exit(1);
      }
    });
}

export function killSubProcesses() {
  console.log('Killing', subProcesses.length, 'child processes');

  for (const i in subProcesses) {
    if (!subProcesses[i]) continue;

    subProcesses[i].kill();
    subProcesses[i] = undefined;
  }

  try {
    const execPromise = require('util').promisify(exec);
    execPromise(
      "kill -9 `ps aux | grep /usr/bin/node | grep -v grep | awk '{ print $2 }'` && kill -9 `ps aux | grep RuneInfinite | grep -v grep | awk '{ print $2 }'` && pkill -f Infinite"
    ).catch(() => {});
  } catch (e2) {
    console.log(e2);
  }
}

export function cleanExit() {
  killSubProcesses();

  process.kill(0);
}

/* exit(1) will not force a restart on nodemon */
export default async function (msg) {
  console.log(`Exiting now... ${msg}`);
  process.exit(1);
}

// process.on('exit', cleanExit)
// process.on('SIGINT', cleanExit) // catch ctrl-c
// process.on('SIGTERM', cleanExit) // catch kill

/**
 * Prompts the user with a question and resolves or rejects based on the response.
 *
 * @param {string} q - The question to prompt the user. If empty, the promise resolves immediately.
 * @param {string} [defaultAnswer='y'] - The default answer to resolve with if no question is provided.
 * @returns {Promise<string>} - Resolves with the answer or rejects if the answer is not 'y'.
 */
export async function awaitEnter(question = '', defaultAnswer = 'y') {
  const readline = require('readline');
  // Create a readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ' + question,
  });

  // Return a promise that resolves or rejects based on user input
  return new Promise((resolve, reject) => {
    rl.on('error', (err) => {
      rl.close();
      reject(err);
    });

    rl.prompt();

    rl.on('line', async (answer: string) => {
      console.log(`You answered: ${answer}`); // Log the user's answer

      rl.close(); // Close the readline interface

      if (answer.trim().toLowerCase() === 'n') {
        reject(new Error('Aborting.'));
      } else if (!question || answer.trim().toLowerCase() === 'y') {
        resolve(answer); // Resolve if the answer is 'y' or 'Y'
      } else {
        reject(new Error('Aborting.'));
      }
    });
  });
}
