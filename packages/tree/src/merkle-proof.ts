import { Fp } from '@zkopru/babyjubjub'
import BN from 'bn.js'
import { Hasher } from './hasher'

export interface MerkleProof<T extends Fp | BN> {
  root: T
  index: T
  leaf: T
  siblings: T[]
}

export function verifyProof<T extends Fp | BN>(
  hasher: Hasher<T>,
  proof: MerkleProof<T>,
): boolean {
  let path = new BN(proof.index)
  let node = proof.leaf
  for (let i = 0; i < proof.siblings.length; i += 1) {
    if (path.isEven()) {
      // right sibling
      node = hasher.parentOf(node, proof.siblings[i])
    } else {
      // left sibling
      node = hasher.parentOf(proof.siblings[i], node)
    }
    path = path.shrn(1)
  }
  return node.eq(proof.root)
}

export function startingLeafProof<T extends Fp | BN>(
  hasher: Hasher<T>,
  root: T,
  index: T,
  siblings: T[],
): boolean {
  const depth = siblings.length
  // calculate the siblings validity
  let path = new BN(index)
  for (let i = 0; i < depth; i += 1) {
    if (path.isEven()) {
      // Right sibling should be a prehashed zero
      if (!siblings[i].eq(hasher.preHash[i])) return false
    }
    path = path.shrn(1)
  }
  return verifyProof<T>(hasher, {
    root,
    index,
    leaf: hasher.preHash[0],
    siblings,
  })
}
