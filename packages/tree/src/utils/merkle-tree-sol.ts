import { Field } from '@zkopru/babyjubjub'
import assert from 'assert'
import BN from 'bn.js'
import { Hasher } from '../hasher'

// This TS code corresponds to the MerkleTree.sol code file

function appendLeaf<T extends Field | BN>(
  hasher: Hasher<T>,
  index: T,
  leaf: T,
  siblings: T[],
): {
  nextRoot: T
  nextIndex: T
  nextSiblings: T[]
} {
  assert(siblings.length === hasher.preHash.length, 'Invalid sibling length')
  const nextSiblings = [...siblings]
  const path = index
  let node: T = leaf
  for (let level = 0; level < siblings.length; level += 1) {
    if (path.shrn(level).isEven()) {
      // Right empty sibling
      nextSiblings[level] = node // current node becomes the next merkle proof's left sibling
      node = hasher.parentOf(node, hasher.preHash[level])
    } else {
      // Left sibling
      nextSiblings[level] = siblings[level] // keep current sibling
      node = hasher.parentOf(siblings[level], node)
    }
  }
  const nextRoot = node
  const nextIndex = index.addn(1) as T
  return {
    nextRoot,
    nextIndex,
    nextSiblings,
  }
}

function startingLeafProof<T extends Field | BN>(
  hasher: Hasher<T>,
  root: T,
  index: T,
  siblings: T[],
): boolean {
  assert(siblings.length === hasher.preHash.length, 'Invalid sibling length')
  const path = index
  let node: T = hasher.preHash[0]
  for (let level = 0; level < siblings.length; level += 1) {
    if (path.shrn(level).isEven()) {
      // Right sibling should be the prehashed zero
      if (!siblings[level].eq(hasher.preHash[level])) return false
      node = hasher.parentOf(node, hasher.preHash[level])
    } else {
      // Left sibling should not be a prehahsed zero
      if (siblings[level].eq(hasher.preHash[level])) return false
      node = hasher.parentOf(siblings[level], node)
    }
  }
  return root.eq(node)
}

export function merkleRoot<T extends Field | BN>(
  hasher: Hasher<T>,
  leaf: T,
  index: T,
  siblings: T[],
): T {
  assert(siblings.length === hasher.preHash.length, 'Invalid sibling length')
  const path = index
  let node: T = leaf
  for (let level = 0; level < siblings.length; level += 1) {
    if (path.shrn(level).isEven()) {
      // Right sibling
      node = hasher.parentOf(node, siblings[level])
    } else {
      // Left sibling
      node = hasher.parentOf(siblings[level], node)
    }
  }
  return node
}

export function merkleProof<T extends Field | BN>(
  hasher: Hasher<T>,
  root: T,
  leaf: T,
  index: T,
  siblings: T[],
): boolean {
  return merkleRoot(hasher, leaf, index, siblings).eq(root)
}

export function append<T extends Field | BN>(
  hasher: Hasher<T>,
  startingRoot: T,
  index: T,
  leaves: T[],
  initialSiblings: T[],
): T {
  assert(
    startingLeafProof(hasher, startingRoot, index, initialSiblings),
    'Invalid merkle proof of starting leaf node',
  )
  let nextRoot = startingRoot
  let nextIndex = index
  let nextSiblings = [...initialSiblings]
  for (let i = 0; i < leaves.length; i += 1) {
    const updated = appendLeaf(hasher, nextIndex, leaves[i], nextSiblings)
    nextRoot = updated.nextRoot
    nextIndex = updated.nextIndex
    nextSiblings = updated.nextSiblings
  }
  return nextRoot
}

// Sub tree library
function subTreeRoot<T extends Field | BN>(
  hasher: Hasher<T>,
  subTreeDepth: number,
  leaves: T[],
): T {
  // Example of a sub tree with depth 3
  //                      1
  //          10                       11
  //    100        101         110           [111]
  // 1000 1001  1010 1011   1100 [1101]  [1110] [1111]
  //   o   o     o    o       o    x       x       x
  //
  // whereEmptyNodeStart (1101) = leaves.length + tree_size
  // []: nodes that we can use the pre hashed zeroes
  //
  // * ([1101] << 0) is gte than (1101) => we can use the pre hashed zeroes
  // * ([1110] << 0) is gte than (1101) => we can use the pre hashed zeroes
  // * ([1111] << 0) is gte than (1101) => we can use pre hashed zeroes
  // * ([111] << 1) is gte than (1101) => we can use pre hashed zeroes
  // * (11 << 2) is less than (1101) => we cannot use pre hashed zeroes
  // * (1 << 3) is less than (1101) => we cannot use pre hashed zeroes
  const treeSize = 1 << subTreeDepth
  assert(leaves.length <= treeSize, 'Overflowed')
  const nodes: (T | undefined)[] = Array(treeSize << 1) // we'll not use nodes[0]
  let emptyNode = treeSize + (leaves.length - 1) // we do not hash if we can use pre hashed zeroes
  let leftMostOfTheFloor = treeSize

  // From the bottom to the top
  for (let level = 0; level <= subTreeDepth; level += 1) {
    // From the right to the left
    for (
      let nodeIndex = (treeSize << 1) - 1;
      nodeIndex >= leftMostOfTheFloor;
      nodeIndex -= 1
    ) {
      if (nodeIndex <= emptyNode) {
        // This node is not an empty node
        if (level === 0) {
          // Leaf node
          nodes[nodeIndex] = leaves[nodeIndex - treeSize]
        } else {
          // Parent node
          const leftChildIndex = nodeIndex << 1
          const rightChildIndex = leftChildIndex + 1
          const leftNode = nodes[leftChildIndex]
          const rightNode = nodes[rightChildIndex]
          assert(!!leftNode, 'left child not exist')
          assert(!!rightNode, 'right child not exist')
          nodes[nodeIndex] = hasher.parentOf(leftNode, rightNode)
        }
      } else {
        // Use pre hashed
        nodes[nodeIndex] = hasher.preHash[level]
      }
    }
    leftMostOfTheFloor >>= 1
    emptyNode >>= 1
  }
  const rootNode = nodes[1]
  assert(!!rootNode, 'Root node is not computed')
  return rootNode
}

function appendSubTree<T extends Field | BN>(
  hasher: Hasher<T>,
  index: T,
  subTreeDepth: number,
  leaves: T[],
  siblings: T[],
): {
  nextRoot: T
  nextIndex: T
  nextSiblings: T[]
} {
  const subTreeSize = 1 << subTreeDepth
  assert(leaves.length <= subTreeSize, 'Overflowed')
  const nextSiblings: T[] = [...siblings] // we'll not use nodes[0]
  const subTreePath = index.shrn(subTreeDepth)
  let path = subTreePath
  let node = subTreeRoot(hasher, subTreeDepth, leaves)
  for (let level = 0; level < siblings.length; level += 1) {
    if (path.isEven()) {
      // right empty sibling
      nextSiblings[level] = node // current node will be the next merkle proof's left sibling
      node = hasher.parentOf(node, hasher.preHash[level + subTreeDepth])
    } else {
      // left sibling
      nextSiblings[level] = siblings[level] // keep current sibling
      node = hasher.parentOf(siblings[level], node)
    }
    path = path.shrn(1)
  }
  const nextRoot = node
  const nextIndex = index.addn(1 << subTreeDepth) as T
  return {
    nextRoot,
    nextIndex,
    nextSiblings,
  }
}

function emptySubTreeProof<T extends Field | BN>(
  hasher: Hasher<T>,
  root: T,
  index: T,
  subTreeDepth: number,
  siblings: T[],
): boolean {
  const subTreePath = index.shrn(subTreeDepth)
  let path = subTreePath
  for (let level = 0; level < siblings.length; level += 1) {
    if (path.isEven()) {
      // right sibling should be a prehashed zero
      if (!siblings[level].eq(hasher.preHash[level + subTreeDepth]))
        return false
    } else {
      // left sibling should not be a prehashed zero
      // eslint-disable-next-line no-lonely-if
      if (siblings[level].eq(hasher.preHash[level + subTreeDepth])) return false
    }
    path = path.shrn(1)
  }
  return merkleProof(
    hasher,
    root,
    hasher.preHash[subTreeDepth],
    subTreePath,
    siblings,
  )
}

export function splitToSubTrees<T extends Field | BN>(
  hasher: Hasher<T>,
  leaves: T[],
  subTreeDepth: number,
): T[][] {
  const subTreeSize = 1 << subTreeDepth
  const numOfSubTrees =
    leaves.length / subTreeSize + (leaves.length % subTreeSize === 0 ? 0 : 1)
  const subTrees: T[][] = Array(numOfSubTrees).fill(
    Array(subTreeSize).fill(hasher.preHash[0]),
  )
  let index = 0
  let subTreeIndex = 0
  for (let i = 0; i < leaves.length; i += 1) {
    subTrees[subTreeIndex][index] = leaves[i]
    if (index < subTreeSize - 1) {
      index += 1
    } else {
      index = 0
      subTreeIndex += 1
    }
  }
  return subTrees
}

export function appendAsSubTrees<T extends Field | BN>(
  hasher: Hasher<T>,
  startingRoot: T,
  index: T,
  subTreeDepth: number,
  leaves: T[],
  subTreeSiblings: T[],
): T {
  assert(index.modn(1 << subTreeDepth) === 0, 'Cannot merge subtree')
  assert(
    emptySubTreeProof(
      hasher,
      startingRoot,
      index,
      subTreeDepth,
      subTreeSiblings,
    ),
    'Insertion is not allowed.',
  )
  let nextRoot = startingRoot
  let nextIndex = index
  let nextSiblings = [...subTreeSiblings]
  const subTrees = splitToSubTrees(hasher, leaves, subTreeDepth)
  for (let i = 0; i < leaves.length; i += 1) {
    const updated = appendSubTree(
      hasher,
      nextIndex,
      subTreeDepth,
      subTrees[i],
      nextSiblings,
    )
    nextRoot = updated.nextRoot
    nextIndex = updated.nextIndex
    nextSiblings = updated.nextSiblings
  }
  return nextRoot
}
