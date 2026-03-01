// arken/packages/node/time/index.ts

import _date from './date';
import _now from './now';
import _fancyTimeFormat from './fancyTimeFormat';

export const date = _date;
export const now = _now;
export const fancyTimeFormat = _fancyTimeFormat;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeTimezoneOffset(date) {
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  if (userTimezoneOffset >= 0) {
    return new Date(date.getTime() - userTimezoneOffset);
  }
  return new Date(date.getTime() + userTimezoneOffset);
}

export const convert = require('timestring');

export function timestamp() {
  const now = new Date();
  const secondsSinceEpoch = Math.round(now.getTime() / 1000);

  return secondsSinceEpoch;
}

type Task = {
  func: () => Promise<void>;
  delay: number;
};

export const createTaskQueue = () => {
  const queue: Task[] = [];
  let isProcessing = false;

  const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {
      const task = queue.shift();
      if (task) {
        try {
          if (task.delay) await new Promise((resolve) => setTimeout(resolve, task.delay));
          await task.func();
        } catch (error) {
          console.error('Task failed', error);
        }
      }
    }

    isProcessing = false;

    // If a task was enqueued during the tail handoff window,
    // immediately restart processing so no task is stranded.
    if (queue.length > 0) {
      processQueue();
    }
  };

  const enqueue = (func: () => Promise<any>, delay: number = 1000) => {
    queue.push({ func, delay });
    processQueue();
  };

  return { enqueue };
};

type Func = (...args: any[]) => any;

export function debounce(func: Func, wait: number, immediate: boolean = false): Func {
  let timeout: NodeJS.Timeout | null = null;
  let args: any;
  let context: any;
  let timestamp: number;
  let result: any;

  const later = () => {
    const last = Date.now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args: any[]) {
    context = this;
    timestamp = Date.now();
    const callNow = immediate && !timeout;

    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * @description 将时间戳转换为年-月-日-时-分-秒格式
 * @param {number} timestamp
 * @returns {string} 年-月-日-时-分-秒
 */
export function timestampToTime(timestamp: number): string {
  const date = new Date(timestamp);
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth() + 1).toString().padStart(2, '0') + '-';
  const D = date.getDate().toString().padStart(2, '0') + ' ';
  const h = date.getHours().toString().padStart(2, '0') + ':';
  const m = date.getMinutes().toString().padStart(2, '0') + ':';
  const s = date.getSeconds().toString().padStart(2, '0');

  return Y + M + D + h + m + s;
}

export default {
  sleep,
  date,
  now,
  fancyTimeFormat,
  removeTimezoneOffset,
  timestamp,
  createTaskQueue,
  debounce,
  timestampToTime,
};
