const path = require('path');
const writeLogs = false;
const logPrefix = process.env.LOG_PREFIX || '[APP]';

export function nowReadable() {
  return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function dev(...props: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ARKEN]`, props);
  }
}

export const isDebug =
  process.env.HOME === '/Users/dev' ||
  process.env.HOME === '/home/dev' ||
  process.env.HOME === '/root' ||
  process.env.LOG === '1';

export function logError(...msgs) {
  console.log(logPrefix, nowReadable(), ...msgs);

  // const errorLog = jetpack.read(path.resolve('./public/data/errors.json'), 'json') || [];

  // for (const msg of msgs) {
  //   errorLog.push(JSON.stringify(msg));
  // }

  if (writeLogs) {
    // jetpack.write(path.resolve('./public/data/errors.json'), JSON.stringify(errorLog, null, 2), { atomic: true });
  }

  // console.log(msgs);

  // throw new Error(msgs.join('; '));
}

export function log(...msgs) {
  if (isDebug) {
    console.log(logPrefix, nowReadable(), ...msgs);
  }

  if (writeLogs) {
    // const logData = jetpack.read(path.resolve('../public/data/log.json'), 'json') || [];
    // for (const msg of msgs) {
    //   logData.push(JSON.stringify(msg));
    // }
    // jetpack.write(path.resolve('./public/data/log.json'), JSON.stringify(logData, null, 2));
  }
}
