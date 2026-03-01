export function weightedRandom(items: { weight: number }[]): any {
  let table = items.flatMap((item) => Array(item.weight).fill(item));
  return table[Math.floor(Math.random() * table.length)];
}
