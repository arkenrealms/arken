// node/util/zk.ts

import { groth16 } from 'snarkjs';
import fs from 'fs';
import path from 'path';

type UpdateLeafInput = {
  oldLeaf: string;
  newLeaf: string;
  path: string; // leaf index (0-based as stringified bigint)
  siblings: string[]; // array of Poseidon hashes (depth size)
  oldRoot: string;
  newRoot: string;
};

// 🔧 adjust this to match your circom constant (e.g. 16, 32, etc.)
const TREE_DEPTH = 16;

/**
 * Normalize a string into a decimal field element string for circom/snarkjs.
 * - If it looks like hex, interpret it as 0x... and convert to decimal.
 * - If it already looks decimal, pass through.
 */
function toField(val: string): string {
  if (typeof val !== 'string') return String(val);

  const v = val.trim();

  // Decimal already
  if (/^[0-9]+$/.test(v)) return v;

  // Hex without 0x
  if (/^[0-9a-fA-F]+$/.test(v)) {
    return BigInt('0x' + v).toString();
  }

  // 0x-prefixed hex
  if (/^0x[0-9a-fA-F]+$/.test(v)) {
    return BigInt(v).toString();
  }

  return v; // let snarkjs crash if truly invalid
}

export async function generateProof({
  oldRoot,
  newRoot,
  oldLeaf,
  newLeaf,
  leafIndex,
  siblings,
}: {
  oldRoot: string;
  newRoot: string;
  oldLeaf: string;
  newLeaf: string;
  leafIndex: number;
  siblings: string[];
}) {
  if (siblings.length > TREE_DEPTH) {
    throw new Error(
      `siblings length (${siblings.length}) > TREE_DEPTH (${TREE_DEPTH}). ` +
        `Adjust TREE_DEPTH to your circuit's configured depth.`
    );
  }

  // pad siblings up to TREE_DEPTH with dummy values
  const paddedSiblings = [...siblings];
  while (paddedSiblings.length < TREE_DEPTH) {
    paddedSiblings.push('0');
  }

  const input: UpdateLeafInput = {
    oldLeaf: toField(oldLeaf),
    newLeaf: toField(newLeaf),
    path: leafIndex.toString(),
    siblings: paddedSiblings.map(toField),
    oldRoot: toField(oldRoot),
    newRoot: toField(newRoot),
  };

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    path.resolve(__dirname, '../data/zk/updateLeaf_js/updateLeaf.wasm'),
    path.resolve(__dirname, '../data/zk/updateLeaf.zkey')
  );

  return { proof, publicSignals };
}

export async function verifyProof(proof: any, publicSignals: string[]) {
  const vkey = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/zk/verification_key.json'), 'utf8'));
  return groth16.verify(vkey, publicSignals, proof);
}
