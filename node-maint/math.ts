export function median(values) {
  if (values.length === 0) return 0;

  values.sort(function (a, b) {
    return a - b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export function toFixed(num, decimals = 2) {
  if (decimals === 0) return (num + '').match(new RegExp('^-?\\d+(?:\\.\\d{0,' + decimals + '})?'))[0].replace('.', '');

  return (num + '').match(new RegExp('^-?\\d+(?:\\.\\d{0,' + decimals + '})?'))[0];
}

export function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function average(arr: any) {
  return arr.reduce((p: any, c: any) => p + c, 0) / arr.length;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function rand(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function round(num, digits = 2) {
  if (isNaN(num)) return null;

  return parseFloat(parseFloat(num + '').toFixed(digits));
}
