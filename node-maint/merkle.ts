// util/merkle.ts

import keccak256 from 'keccak256';
import crypto from 'crypto';
// import { MerkleNode } from '../modules/core/core.models';
import { generateProof } from './zk'; // your UpdateLeaf zk utils
import { buildPoseidon } from 'circomlibjs';

const TREE_DEPTH = 16; // must match UpdateLeaf(16)
const TREE_SIZE = 1 << TREE_DEPTH;

const MerkleNode = {} as any; // todo: fix

// -----------------------------------------------------------------------------
// Poseidon setup
// -----------------------------------------------------------------------------

let poseidonInstance: any = null;
let F: any = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
    F = poseidonInstance.F;
  }
  return { poseidon: poseidonInstance, F };
}

function fieldToHex(field: bigint): string {
  // F.toObject returns bigint in bn254 field
  const n = F.toObject(field) as bigint;
  return n.toString(16); // unpadded hex (you can pad if you want)
}

// -----------------------------------------------------------------------------
// Poseidon-based hash helpers
// -----------------------------------------------------------------------------

/**
 * Deterministic "empty" node hash per level using Poseidon.
 * We just feed the level number as a field element.
 */
async function emptyHash(level: number): Promise<string> {
  const { poseidon } = await getPoseidon();
  const h = poseidon([BigInt(level)]);
  return fieldToHex(h);
}

/**
 * Convert arbitrary leaf data -> field element -> Poseidon hash.
 *
 * We use keccak256(JSON) as a preimage hash to get a 256-bit value,
 * then interpret it as a field element, then hash once with Poseidon.
 * This is safe and consistent as long as you always do it the same way.
 */
async function hashLeafData(data: any): Promise<string> {
  const { poseidon } = await getPoseidon();

  const json = JSON.stringify(data ?? null);
  const k = keccak256(json).toString('hex'); // 256-bit hex
  const asField = BigInt('0x' + k); // will be reduced mod p by the field

  const h = poseidon([asField]);
  return fieldToHex(h);
}

/**
 * Poseidon-based parent hash: H(left, right)
 */
async function parentHash(leftHex: string, rightHex: string): Promise<string> {
  const { poseidon } = await getPoseidon();

  const l = BigInt('0x' + leftHex);
  const r = BigInt('0x' + rightHex);

  const h = poseidon([l, r]);
  return fieldToHex(h);
}

// -----------------------------------------------------------------------------
// Core Merkle tree operations (backed by MerkleNode collection)
// -----------------------------------------------------------------------------

export async function getMerkleRoot(): Promise<string> {
  const root = (await MerkleNode.findOne({ level: TREE_DEPTH, index: 0 }).lean().exec()) as any;
  if (root?.hash) return root.hash;

  // If no root yet, use Poseidon(0) as empty root
  const { poseidon } = await getPoseidon();
  const h = poseidon([0n]);
  return fieldToHex(h);
}

/**
 * Update a single leaf at `index` with `newLeafData`,
 * recomputing all parent nodes up to the root.
 * Stores hashes as hex strings (no 0x) in MerkleNode.
 */
export async function updateLeaf(index: number, newLeafData: any) {
  // 1) Hash leaf data (Poseidon on keccak(JSON))
  const leafHash = await hashLeafData(newLeafData);

  // 2) Save new leaf
  await MerkleNode.updateOne({ level: 0, index }, { hash: leafHash }, { upsert: true }).exec();

  // 3) Propagate up the tree
  let currentIndex = index;

  for (let level = 1; level <= TREE_DEPTH; level++) {
    const parentIndex = Math.floor(currentIndex / 2);
    const leftIndex = parentIndex * 2;
    const rightIndex = parentIndex * 2 + 1;

    const left = (await MerkleNode.findOne({ level: level - 1, index: leftIndex })
      .lean()
      .exec()) as any;
    const right = (await MerkleNode.findOne({ level: level - 1, index: rightIndex })
      .lean()
      .exec()) as any;

    const leftHash = left?.hash || (await emptyHash(level - 1));
    const rightHash = right?.hash || (await emptyHash(level - 1));

    const parent = await parentHash(leftHash, rightHash);

    await MerkleNode.updateOne({ level, index: parentIndex }, { hash: parent }, { upsert: true }).exec();

    currentIndex = parentIndex;
  }
}

/**
 * Get Merkle siblings for a given leaf index from the current tree.
 * Returned array has length = TREE_DEPTH; siblings[level] is the sibling
 * hash at that level (starting from leaf level 0).
 */
export async function getSiblingsFromDB(leafIndex: number): Promise<string[]> {
  const siblings: string[] = [];
  let index = leafIndex;

  for (let level = 0; level < TREE_DEPTH; level++) {
    const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;

    const sibling = (await MerkleNode.findOne({
      level,
      index: siblingIndex,
    })
      .lean()
      .exec()) as any;

    siblings.push(sibling?.hash || (await emptyHash(level)));
    index = Math.floor(index / 2);
  }

  return siblings;
}

/**
 * Batch update multiple leaves and recompute all affected parent nodes.
 */
export async function updateLeavesInBatch(updates: { index: number; data: any }[]) {
  // Step 1: Write leaves
  for (const update of updates) {
    const hash = await hashLeafData(update.data);
    await MerkleNode.updateOne({ level: 0, index: update.index }, { hash }, { upsert: true }).exec();
  }

  // Step 2: Collect affected nodes
  const affected = new Set<string>();
  for (const update of updates) {
    let index = update.index;
    for (let level = 0; level <= TREE_DEPTH; level++) {
      affected.add(`${level}:${index}`);
      index = Math.floor(index / 2);
    }
  }

  // Step 3: Update affected nodes from bottom to top
  const sorted = Array.from(affected)
    .map((key) => {
      const [level, index] = key.split(':').map(Number);
      return { level, index };
    })
    .sort((a, b) => a.level - b.level);

  for (const { level, index } of sorted) {
    if (level === 0) continue;

    const left = (await MerkleNode.findOne({ level: level - 1, index: index * 2 })
      .lean()
      .exec()) as any;
    const right = (await MerkleNode.findOne({ level: level - 1, index: index * 2 + 1 })
      .lean()
      .exec()) as any;

    const leftHash = left?.hash || (await emptyHash(level - 1));
    const rightHash = right?.hash || (await emptyHash(level - 1));

    const hash = await parentHash(leftHash, rightHash);

    await MerkleNode.updateOne({ level, index }, { hash }, { upsert: true }).exec();
  }

  const root = (await MerkleNode.findOne({ level: TREE_DEPTH, index: 0 }).lean().exec()) as any;
  if (root?.hash) return root.hash;

  const { poseidon } = await getPoseidon();
  const h = poseidon([0n]);
  return fieldToHex(h);
}

// -----------------------------------------------------------------------------
// zkSNARK integration: update leaf + generate proof (matches your UpdateLeaf.circom)
// -----------------------------------------------------------------------------

/**
 * Update a leaf at `index` with `newLeafData`, AND generate a zkSNARK proof
 * for the transition using your `UpdateLeaf(16)` circuit:
 *
 *  - oldRoot → newRoot
 *  - oldLeaf → newLeaf at path = leafIndex
 *  - siblings[] Merkle path for old tree
 *
 * This is what you call from your write path (e.g. saveCharacters) when you
 * want both a Merkle update and a zk proof for it.
 */
export async function updateLeafWithProof(index: number, newLeafData: any) {
  // Snapshot "old" state
  const oldRootHex = await getMerkleRoot();

  const existingLeaf = (await MerkleNode.findOne({ level: 0, index }).lean().exec()) as any;
  const oldLeafHex = existingLeaf?.hash || (await emptyHash(0));

  const siblingsHex = await getSiblingsFromDB(index); // from old tree

  // Apply the update to the Merkle tree (Poseidon-based)
  await updateLeaf(index, newLeafData);

  // Snapshot "new" state
  const newRootHex = await getMerkleRoot();
  const updatedLeaf = (await MerkleNode.findOne({ level: 0, index }).lean().exec()) as any;
  const newLeafHex = updatedLeaf?.hash || (await hashLeafData(newLeafData));

  // Prepare inputs for Circom / snarkjs:
  // Your zk.ts generateProof() handles hex/decimal normalization.
  const { proof, publicSignals } = await generateProof({
    oldRoot: oldRootHex,
    newRoot: newRootHex,
    oldLeaf: oldLeafHex,
    newLeaf: newLeafHex,
    leafIndex: index,
    siblings: siblingsHex,
  });

  return {
    oldRoot: oldRootHex,
    newRoot: newRootHex,
    oldLeaf: oldLeafHex,
    newLeaf: newLeafHex,
    leafIndex: index,
    siblings: siblingsHex,
    proof,
    publicSignals,
  };
}

// -----------------------------------------------------------------------------
// Generic hash helpers for Seer events / light clients
// -----------------------------------------------------------------------------

/**
 * Generic "thing with a hash field" – e.g. SeerEvent, or any
 * object that already stores a precomputed commitment.
 */
export interface MerkleLeafLike {
  hash?: string;
  [key: string]: any;
}

/**
 * Simple SHA-256 hex helper.
 */
export function sha256Hex(data: string | Buffer): string {
  const input = typeof data === 'string' ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Hash an array of events into a single commitment.
 *
 * Rules:
 * - If elements have a `hash` field, we concatenate those and hash.
 * - Otherwise, we hash the JSON of the whole array.
 */
export function hashEvents(events: MerkleLeafLike[] | MerkleLeafLike): string {
  // Normalize to array
  const arr = Array.isArray(events) ? events : [events];

  if (!arr.length) {
    // empty commitment
    return sha256Hex('');
  }

  // If items have `.hash`, treat those as leaf commitments
  if (arr[0].hash !== undefined) {
    const concat = arr.map((e) => String(e.hash)).join('|');
    return sha256Hex(concat);
  }

  // Fallback: hash full JSON (more expensive / more data-revealing)
  return sha256Hex(JSON.stringify(arr));
}

/**
 * Build a simple binary Merkle root from an array of leaf *hashes* (already hex).
 *
 * If you want to treat arbitrary payloads as leaves, hash them first before
 * passing here.
 */
export function merkleRootFromLeaves(leaves: string[]): string {
  if (!leaves.length) {
    return sha256Hex('');
  }

  // Normalize: ensure all leaves are strings
  let level = leaves.map((h) => h.toString());

  while (level.length > 1) {
    const next: string[] = [];

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left; // duplicate last if odd
      // Simple concatenation Merkle; you can swap this for Poseidon if you want
      next.push(sha256Hex(left + right));
    }

    level = next;
  }

  return level[0];
}
