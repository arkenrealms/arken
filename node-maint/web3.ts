import md5 from 'js-md5';
// import _Web3 from 'web3';
// import HDWalletProvider from '@truffle/hdwallet-provider';
import CryptoJS from 'crypto-js';
// import ethersAddress from '@ethersproject/address';
// import { Contract } from '@ethersproject/contracts';
// import { Web3Provider } from '@ethersproject/providers';
// import { ethers } from 'ethers';
import { log, logError } from './log';

// const fetchPrice = async (id, vs = 'usd') => {
//   const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`)

//   return parseFloat((await response.json())[id][vs])
// }
// const fetchPrices = async () => {
// const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
// prices = (await response.json())
// }

// export const Web3 = _Web3;

export const getRandomProvider = (HDWalletProvider, secret) => {
  return new HDWalletProvider(
    secret.mnemonic,
    process.env.PROVIDER_URI //networks[Math.floor(Math.random() * networks.length)]
  );
};

export async function iterateBlocks(app, name, address, fromBlock, toBlock, event, processLog, updateConfig) {
  if (!toBlock) return;
  if (fromBlock === toBlock) return;

  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    const toBlock2 = fromBlock + 5000 < toBlock ? fromBlock + 5000 : toBlock;

    const filter = {
      address,
      fromBlock,
      toBlock: toBlock2,
      topics: event.topics,
    };

    log(name, 'Iterating block', fromBlock, 'to', toBlock2, 'eventually', toBlock, 'for', event.topics);

    const logs = await app.ethersProvider.bsc.getLogs(filter);

    for (let i = 0; i < logs.length; i++) {
      await processLog(logs[i], false);
    }

    // await wait(3 * 1000)

    if (updateConfig && toBlock2 > 0) {
      await updateConfig(toBlock2);
    }

    await iterateBlocks(app, name, address, toBlock2, toBlock, event, processLog, updateConfig);
  } catch (e) {
    logError('Iterate Blocks Error', e);
    logError(name, address, fromBlock, toBlock, event);
    // process.exit(1)
  }
}

export const getAddress = (address) => {
  const mainNetChainId = 56;
  const chainId =
    // @ts-ignore
    typeof window !== 'undefined' && window?.location?.hostname === 'testnet.arken.gg'
      ? 97
      : process.env.REACT_APP_CHAIN_ID;
  return address[chainId] ? address[chainId] : address[mainNetChainId];
};

export function isValidRequest(web3, req) {
  log('Verifying', req);
  try {
    // const hashedData = md5(JSON.stringify(req.signature.data));
    return (
      // hashedData === req.signature.hash &&
      web3.eth.accounts.recover(req.signature.data, req.signature.hash).toLowerCase() ===
      req.signature.address.toLowerCase()
    );
  } catch (e) {
    logError(e);
    return false;
  }
}

export async function getSignedRequest(web3, secret, data) {
  log('Signing', data);
  try {
    //const hashedData = md5(JSON.stringify(data));
    return {
      address: secret.address,
      hash: (await web3.eth.accounts.sign(data, secret.key)).signature,
      data,
    };
  } catch (e) {
    logError(e);
    return null;
  }
}

// Get the topic signature hex
export function getTopicSignatureHex(ethers, topicSignature) {
  return ethers.utils.id(topicSignature);
}

// Returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(ethers, value) {
  try {
    return ethers.utils.getAddress(value);
  } catch {
    return false;
  }
}

// Shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(ethers, address, chars = 4) {
  const parsed = isAddress(ethers, address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}

// account is optional
export function getContract(ethers, address, ABI, library, account) {
  // pass in ethers
  if (!isAddress(ethers, address) || address === ethers.constants.AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new ethers.Contract(address, ABI, getProviderOrSigner(library, account));
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account);
}

// account is optional
export function getProviderOrSigner(library, account) {
  return account ? getSigner(library, account) : library;
}

export function encrypt(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString();
}

export function decrypt(data, key) {
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}

export function toBytes32(ethers, text) {
  let data = ethers.utils.toUtf8Bytes(text);
  if (data.length > 32) {
    throw new Error('too long');
  }
  data = ethers.utils.zeroPad(data, 32);
  return ethers.utils.hexlify(data);
}

export default function getLibrary(ethers, provider) {
  const library = new ethers.providers.Web3Provider(provider); // pass in ethers.providers.Web3Provider
  library.pollingInterval = 15000;
  return library;
}
