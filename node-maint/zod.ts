import z from 'zod';

export const dateFromString = z.preprocess((val) => {
  if (typeof val === 'string') {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    return date;
  }
  return val;
}, z.date());

export default () => {};
