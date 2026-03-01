// arken/packages/node/legacy/getOldUsername.ts

import fetch from 'axios';

const profileApi = 'https://s1.relay.arken.asi.sh';

const cache = {
  getUserAddressByUsername: {},
  getUsername: {},
};

export default async (address: string): Promise<string> => {
  try {
    if (cache.getUsername[address]) return cache.getUsername[address];

    const response = await fetch(`${profileApi}/users/${address}`);

    if (!response.data) {
      return '';
    }

    const { username = '' }: any = response.data;

    cache.getUsername[address] = username;

    return username;
  } catch (error) {
    return '';
  }
};
