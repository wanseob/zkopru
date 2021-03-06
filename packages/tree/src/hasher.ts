import { soliditySha3 } from 'web3-utils'
import { poseidon } from 'circomlib'
import { Fp } from '@zkopru/babyjubjub'
import { hexify } from '@zkopru/utils'
import BN from 'bn.js'

export interface Hasher<T extends Fp | BN> {
  parentOf(left: T, right: T): T
  preHash: T[]
}

function getPreHash<T extends Fp | BN>(
  zero: T,
  parentOf: (left: T, right: T) => T,
  depth: number,
): T[] {
  const preHash: T[] = []
  preHash.push(zero)
  for (let level = 0; level < depth; level += 1) {
    const topValue = preHash[preHash.length - 1]
    preHash.push(parentOf(topValue, topValue))
  }
  return preHash
}

export function genesisRoot<T extends Fp | BN>(hasher: Hasher<T>): T {
  return hasher.preHash.slice(-1)[0]
}

export function keccakHasher(depth: number): Hasher<BN> {
  const parentOf = (left: BN, right: BN) => {
    const val = soliditySha3(hexify(left, 32), hexify(right, 32)) || '0x'
    return new BN(val.substr(2), 16)
  }
  const preHash = getPreHash<BN>(new BN(0), parentOf, depth)
  return { parentOf, preHash }
}

export function poseidonHasher(depth: number): Hasher<Fp> {
  const parentOf = (left: Fp, right: Fp) => {
    return Fp.from(poseidon([left.toBigInt(), right.toBigInt()]).toString())
  }
  const preHash = getPreHash(Fp.zero, parentOf, depth)
  return { parentOf, preHash }
}
