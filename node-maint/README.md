<div align="center">
  <br>

  <img src=".erb/img/logo.png" width="60%" />

  <br>
  <br>

  <h2><strong>Arken Node</strong> is a <code>free and open source Node library</code></h2>

[![Build Status][github-actions-status]][github-actions-url] [![Github Tag][github-tag-image]][github-tag-url]
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.arken.gg)

</div>

<br>

## Introduction

<p>
  Welcome to Arken Node, designed for the Arken Realms open initiative. Arken Node uses TypeScript.
</p>

## Install

Clone the repo and install dependencies:

```bash
git clone --depth 1 --branch main https://github.com/arkenrealms/node.git your-project-name
cd your-project-name
rush update
```

**Having issues installing? See our [debugging guide](https://github.com/arkenrealms/node/issues/1)**

## Starting Development

Start the app in the `dev` environment:

```bash
rushx dev
```

## Compile Circuits

```bash
circom data/zk/circuits/updateLeaf.circom --r1cs --wasm --sym -o data/zk
node_modules/.bin/snarkjs powersoftau new bn128 15 data/zk/pot15_0000.ptau -v
node_modules/.bin/snarkjs powersoftau prepare phase2 data/zk/pot15_0000.ptau data/zk/pot15_final.ptau
node_modules/.bin/snarkjs groth16 setup data/zk/updateLeaf.r1cs data/zk/pot15_final.ptau data/zk/updateLeaf.zkey
circom data/zk/circuits/updateLeaf.circom --r1cs --wasm --sym -o data/zk -l node_modules/circomlib/circuits
```

## Docs

See our [docs and guides here](https://docs.arken.gg/installation)

### Model Structure and Entity Relationships

In our framework, every model extends from the base class `Entity`, which includes the mandatory field `applicationId`.
This field is required for all models except for `Omniverse`, `Metaverse`, and `Application`.

#### Hierarchical Model Relationships

- **Omniverse**: Acts as the highest-level entity that encompasses multiple `Metaverses`.
- **Metaverse**: Each `Metaverse` can contain multiple `Applications`.
- **Application**: When enabled, an `Application` integrates all its associated models into the corresponding
  `Metaverse`.

All models linked to a specific `Application` must have an `applicationId` to maintain a clear association within the
`Metaverse` structure.

#### Ownership and Permission

Each `Entity` in the system must have an `owner`, represented as a `Profile` of an `Account`. An `Account` can own
multiple `Profiles`, allowing for a flexible user representation. This structure ensures that every change made to an
`Entity` can be tracked back to a specific `Profile` and `Account`.

#### Collaborative and Social Framework

Our framework is designed to encourage global collaboration and sharing within different `Metaverses`:

- **Contributions**: Anyone can create content for another user's `Metaverse`. If the `Metaverse` owner approves, this
  content can be included in their `Metaverse`.
- **Authority Types**: Approval can be managed directly by the `Metaverse` owner or be automated through community
  votes, depending on the `Metaverse`'s authority type.

#### Future Expansion with Node Schema

Once the `Node` schema is fully implemented, it will enable any model to connect with any other model without the need
for additional schemas. This flexibility will allow entities such as `Products`, `Games`, `NPCs`, etc., to have direct
relationships with models like `Rating` through `Node`. This will streamline community-driven features such as voting
and reduce the amount of code required to manage these relationships.


🧠 ZK Merkle Architecture with Web3 Signatures

Arken Node combines verifiable data structures, cryptographic signatures, and zero-knowledge proofs to ensure secure and tamper-resistant state updates across distributed nodes.

✳️ Core Architecture Components

| Layer | Purpose |
| -------- | ------- |
| Merkle Tree |	Efficiently tracks and hashes all items or entity states |
| Web3 Signature | Verifies the authenticity of each change (who made it) |
| zk-SNARK Proof | Verifies the correctness of the change (what was changed) |

🔐 How it works
1.	State is stored in a Merkle tree, and each node keeps a copy.
1.	When an entity (like an item, profile, or model) is updated:
    1. The client creates a zk-SNARK proof showing that:
    1. The item existed at a given Merkle root
    1. A valid transition occurred (e.g. oldLeaf → newLeaf)
    1. The resulting Merkle root is correctly computed
    1. The action is signed using an Ethereum wallet (eth_sign or EIP-712) to prove who authorized it.
1. The event is broadcast to peer nodes, who:
    1. Verify the Web3 signature
    1. Verify the zk-SNARK proof
    1. Confirm that their local Merkle root matches the old root
    1. Accept and apply the change if all checks pass

🧱 Why this matters
1. ✅ Verifiable State Transitions: Peers don’t trust each other — they trust math.
1. ✅ Immutable Item History: Every item/action is Merkle-protected.
1. ✅ Signature-backed Authority: Only valid Ethereum accounts can authorize changes.
1. ✅ Public zk Proofs: The system is transparent — all proofs and public roots are shareable.

🔗 Bonus: On-Chain Compatibility

The zk-SNARK proofs generated by Arken Node can be verified directly on Ethereum via a Groth16 verifier smart contract. This makes it possible to:
1. Post state transitions onchain
1. Trigger L1 contracts from off-chain logic
1. Prove historical state claims onchain (e.g., in disputes, games, etc.)

## Quick Links

- 🌐 [Arken Discord](https://discord.arken.gg)
- 🌐 [Arken Telegram](https://telegram.arken.gg)
- 📺 [Arken Realms](https://arken.gg/)
- 📖 [Return Portal](http://return.gg/portal)
- 💻 [Return Portal Web](https://github.com/arkenrealms/portal-web)
- 💻 [Return Portal UI](https://github.com/arkenrealms/portal-ui)
- 🔗 [Arken Seer](https://github.com/arkenrealms/seer)

## License

[MIT](LICENSE)

[github-actions-status]: https://github.com/arkenrealms/node/workflows/Test/badge.svg
[github-actions-url]: https://github.com/arkenrealms/node/actions
[github-tag-image]: https://img.shields.io/github/tag/arkenrealms/node.svg?label=version
[github-tag-url]: https://github.com/arkenrealms/node/releases/latest




  "main": "build/index.js",
  "types": "build/types.d.ts",
  "exports": {
    ".": {
      "types": "./build/index.d.ts",
      "default": "./build/index.js"
    },
    "./trpc/socketLink": {
      "types": "./build/trpc/socketLink.d.ts",
      "default": "./build/trpc/socketLink.js",
      "development": "./src/trpc/socketLink.ts"
    },
    "./trpc/socketServer": {
      "types": "./build/trpc/socketServer.d.ts",
      "default": "./build/trpc/socketServer.js",
      "development": "./trpc/socketLink.ts"
    },
    "./mongo": {
      "types": "./build/mongo.d.ts",
      "default": "./build/mongo.js"
    },
    "./rpc": {
      "types": "./build/rpc.d.ts",
      "default": "./build/rpc.js"
    },
    "./schema": {
      "types": "./build/schema.d.ts",
      "default": "./build/schema.js"
    },
    "./util": {
      "types": "./build/util.d.ts",
      "default": "./build/util.js"
    },
    "./decoder": {
      "types": "./build/decoder.d.ts",
      "default": "./build/decoder.js"
    },
    "./db": {
      "types": "./build/db.d.ts",
      "default": "./build/db.js"
    },
    "./config": {
      "types": "./build/config.d.ts",
      "default": "./build/config.js"
    },
    "./guid": {
      "types": "./build/guid.d.ts",
      "default": "./build/guid.js"
    },
    "./objects": {
      "types": "./build/objects.d.ts",
      "default": "./build/objects.js"
    },
    "./api": {
      "types": "./build/api.d.ts",
      "default": "./build/api.js"
    },
    "./number": {
      "types": "./build/number.d.ts",
      "default": "./build/number.js"
    },
    "./string": {
      "types": "./build/string.d.ts",
      "default": "./build/string.js"
    },
    "./log": {
      "types": "./build/log.d.ts",
      "default": "./build/log.js"
    },
    "./math": {
      "types": "./build/math.d.ts",
      "default": "./build/math.js"
    },
    "./process": {
      "types": "./build/process.d.ts",
      "default": "./build/process.js"
    },
    "./web3": {
      "types": "./build/web3.d.ts",
      "default": "./build/web3.js"
    },
    "./json": {
      "types": "./build/json.d.ts",
      "default": "./build/json.js"
    },
    "./format": {
      "types": "./build/format.d.ts",
      "default": "./build/format.js"
    },
    "./merkle": {
      "types": "./build/merkle.d.ts",
      "default": "./build/merkle.js"
    },
    "./object": {
      "types": "./build/object.d.ts",
      "default": "./build/object.js"
    },
    "./zk": {
      "types": "./build/zk.d.ts",
      "default": "./build/zk.js"
    },
    "./array": {
      "types": "./build/array.d.ts",
      "default": "./build/array.js"
    },
    "./time": {
      "types": "./build/time/index.d.ts",
      "default": "./build/time/index.js"
    },
    "./time/*": {
      "types": "./build/time/*.d.ts",
      "default": "./build/time/*.js"
    },
    "./legacy/contractInfo": {
      "types": "./build/legacy/contractInfo.d.ts",
      "default": "./build/legacy/contractInfo.js"
    },
    "./legacy/types": {
      "types": "./build/legacy/types.d.ts",
      "default": "./build/legacy/types.js"
    },
    "./legacy/*": {
      "default": "./build/legacy/*"
    },
    "./legacy/*/*": {
      "default": "./build/legacy/*/*"
    },
    "./legacy/*/*/*": {
      "default": "./build/legacy/*/*/*"
    }
  },