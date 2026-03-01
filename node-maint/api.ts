// arken/packages/node/api.ts

import Mongoose from 'mongoose';
import axios from 'axios';

interface FetchQuery {
  [key: string]: any;
}
// Safely escape user text for a regex
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getFilter(query: any): Record<string, any> {
  const where = query?.where;
  if (!where || typeof where !== 'object') return {};

  // Helper to turn a single field condition into a Mongo filter fragment
  const buildField = (field: string, cond: any) => {
    if (cond == null) return undefined;

    const normalizedField = field === 'id' || field === '_id' ? '_id' : field;

    if (typeof cond !== 'object') {
      return { [normalizedField]: cond };
    }

    if (Array.isArray(cond)) {
      return { [normalizedField]: { $in: cond } };
    }

    const isPlainObject =
      Object.prototype.toString.call(cond) === '[object Object]' &&
      (Object.getPrototypeOf(cond) === Object.prototype || Object.getPrototypeOf(cond) === null);

    if (!isPlainObject) {
      return { [normalizedField]: cond };
    }

    if ('equals' in cond) {
      return { [normalizedField]: cond.equals };
    }

    if ('contains' in cond) {
      const term = cond.contains ?? '';
      if (typeof term === 'string' && term.length === 0) return undefined;
      return {
        [normalizedField]: { $regex: escapeRegExp(String(term)), $options: 'i' },
      };
    }

    if ('in' in cond && Array.isArray(cond.in)) {
      return { [normalizedField]: { $in: cond.in } };
    }

    return { [normalizedField]: cond };
  };

  const parseWhereNode = (node: any): Record<string, any> | undefined => {
    if (!node || typeof node !== 'object') return undefined;

    const andClauses: any[] = [];
    const orClauses: any[] = [];

    for (const key of Object.keys(node)) {
      if (key === 'OR' || key === 'AND') continue;
      const frag = buildField(key, node[key]);
      if (frag) andClauses.push(frag);
    }

    if (Array.isArray(node.OR)) {
      for (const child of node.OR) {
        const parsed = parseWhereNode(child);
        if (parsed) orClauses.push(parsed);
      }
    }

    if (Array.isArray(node.AND)) {
      for (const child of node.AND) {
        const parsed = parseWhereNode(child);
        if (parsed) andClauses.push(parsed);
      }
    }

    if (andClauses.length && orClauses.length) {
      return { $and: [...andClauses, { $or: orClauses }] };
    }
    if (andClauses.length) {
      return andClauses.length === 1 ? andClauses[0] : { $and: andClauses };
    }
    if (orClauses.length) {
      return { $or: orClauses };
    }

    return undefined;
  };

  return parseWhereNode(where) ?? {};
}
export async function fetch(url: string, query: FetchQuery): Promise<any> {
  const res = await axios.post(url, query, {
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
  return res.data;
}
