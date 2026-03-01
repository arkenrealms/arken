// arken/packages/node/legacy/getAddressByOldUsername.ts

import axios from 'axios';

const profileApi = 'https://s1.relay.arken.asi.sh';

const cache = {
  getUserAddressByUsername: {},
  getUsername: {},
};

export default async (name: string): Promise<string> => {
  try {
    if (cache.getUserAddressByUsername[name]) return cache.getUserAddressByUsername[name];

    const response = await axios(`${profileApi}/users/${name}`);

    if (!response?.data) {
      return '';
    }

    // @ts-ignore
    const username = await response.text();

    cache.getUserAddressByUsername[name] = username;

    return username;
  } catch (error) {
    return '';
  }
};
