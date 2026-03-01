// arken/packages/node/scripts/zk-regen-updateLeaf.ts

#!/usr/bin/env ts-node

/**
 * zk-regen-updateLeaf.ts
 *
 * Rebuilds the full Groth16 proving/verifying setup for updateLeaf circuit.
 *
 * Requirements:
 *   - circom installed globally or locally (npm i -g circom)
 *   - snarkjs installed (npm i -g snarkjs)
 */

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..');
const ZK_DIR = path.join(ROOT, 'data/zk');
const CIRCUIT_DIR = path.join(ZK_DIR, 'circuits');
const BUILD_DIR = path.join(ZK_DIR, 'build');

const CIRCUIT = path.join(CIRCUIT_DIR, 'updateLeaf.circom');
const R1CS = path.join(BUILD_DIR, 'updateLeaf.r1cs');
const WASM_DIR = path.join(BUILD_DIR, 'updateLeaf_js');
const ZKEY = path.join(BUILD_DIR, 'updateLeaf.zkey');
const VKEY = path.join(BUILD_DIR, 'verification_key.json');

const PTAU_1 = path.join(BUILD_DIR, 'pot15_0000.ptau');
const PTAU_FINAL = path.join(BUILD_DIR, 'pot15_final.ptau');

function run(cmd: string) {
  console.log(`\n>>> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function main() {
  console.log('\n⛏️  REGENERATING updateLeaf CIRCUIT SETUP\n');

  ensureDir(ZK_DIR);
  ensureDir(CIRCUIT_DIR);
  ensureDir(BUILD_DIR);

  if (!fs.existsSync(CIRCUIT)) {
    console.error(`❌ Missing circuit file: ${CIRCUIT}`);
    process.exit(1);
  }

  // ---------------------------------------------------------------
  // 1. Download PTAU if missing
  // ---------------------------------------------------------------
  if (!fs.existsSync(PTAU_1)) {
    console.log('\n📥 Downloading pot15_0000.ptau (if needed)...');
    run(`wget -O "${PTAU_1}" https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau`);
  }

  // ---------------------------------------------------------------
  // 2. Verify PTAU
  // ---------------------------------------------------------------
  run(`snarkjs powersoftau verify "${PTAU_1}"`);

  // ---------------------------------------------------------------
  // 3. Contribute randomness (Phase2)
  // ---------------------------------------------------------------
  run(`snarkjs powersoftau contribute "${PTAU_1}" "${PTAU_FINAL}" --name="Arken Contributor" -v`);

  // ---------------------------------------------------------------
  // 4. Compile circuit
  // ---------------------------------------------------------------
  run(`circom "${CIRCUIT}" --r1cs --wasm --sym -o "${BUILD_DIR}"`);

  // ---------------------------------------------------------------
  // 5. Groth16 setup
  // ---------------------------------------------------------------
  run(`snarkjs groth16 setup "${R1CS}" "${PTAU_FINAL}" "${ZKEY}"`);

  // ---------------------------------------------------------------
  // 6. Export verification key
  // ---------------------------------------------------------------
  run(`snarkjs zkey export verificationkey "${ZKEY}" "${VKEY}"`);

  console.log('\n🎉 DONE!');
  console.log(`Artifacts written to: ${BUILD_DIR}`);
  console.log(`- ${R1CS}`);
  console.log(`- ${ZKEY}`);
  console.log(`- ${VKEY}`);
  console.log(`- wasm in ${WASM_DIR}/updateLeaf.wasm`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
