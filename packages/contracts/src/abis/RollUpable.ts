export const RollUpableABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum RollUpable.RollUpType',
        name: 'rollUpType',
        type: 'uint8',
      },
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'NewProofOfRollUp',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CHALLENGE_PERIOD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'MAX_UTXO_PER_TREE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'MAX_WITHDRAWAL_PER_TREE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'MINIMUM_STAKE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'NULLIFIER_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'REF_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'UTXO_SUB_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'UTXO_SUB_TREE_SIZE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'UTXO_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_SUB_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_SUB_TREE_SIZE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_TREE_DEPTH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'allowedMigrants',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'massDepositHash', type: 'bytes32' },
    ],
    name: 'committedDeposits',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'utxoRoot', type: 'bytes32' }],
    name: 'finalizedUTXOs',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'numOfInputs', type: 'uint8' },
      { internalType: 'uint8', name: 'numOfOutputs', type: 'uint8' },
    ],
    name: 'getVk',
    outputs: [
      { internalType: 'uint256[2]', name: 'alfa1', type: 'uint256[2]' },
      { internalType: 'uint256[2][2]', name: 'beta2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][2]', name: 'gamma2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][2]', name: 'delta2', type: 'uint256[2][2]' },
      { internalType: 'uint256[2][]', name: 'ic', type: 'uint256[2][]' },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'latest',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'massDepositId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'migrationHash', type: 'bytes32' },
    ],
    name: 'migrations',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'header', type: 'bytes32' }],
    name: 'parentOf',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'proposalId', type: 'bytes32' }],
    name: 'proposals',
    outputs: [
      { internalType: 'bytes32', name: 'header', type: 'bytes32' },
      { internalType: 'uint256', name: 'challengeDue', type: 'uint256' },
      { internalType: 'bool', name: 'slashed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'proposers',
    outputs: [
      { internalType: 'uint256', name: 'stake', type: 'uint256' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'uint256', name: 'exitAllowance', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'snapshotTimestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'stagedDeposits',
    outputs: [
      { internalType: 'bytes32', name: 'merged', type: 'bytes32' },
      { internalType: 'uint256', name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [],
    name: 'stagedSize',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'header', type: 'bytes32' }],
    name: 'utxoRootOf',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'uint256', name: 'idx', type: 'uint256' }],
    name: 'withdrawables',
    outputs: [
      { internalType: 'bytes32', name: 'root', type: 'bytes32' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'leaf', type: 'bytes32' }],
    name: 'withdrawn',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
    constant: true,
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'startingRoot', type: 'uint256' },
      { internalType: 'uint256', name: 'startingIndex', type: 'uint256' },
      { internalType: 'uint256[]', name: 'initialSiblings', type: 'uint256[]' },
    ],
    name: 'newProofOfUTXORollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'prevRoot', type: 'bytes32' }],
    name: 'newProofOfNullifierRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'startingRoot', type: 'uint256' },
      { internalType: 'uint256', name: 'startingIndex', type: 'uint256' },
    ],
    name: 'newProofOfWithdrawalRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256[]', name: 'leaves', type: 'uint256[]' },
    ],
    name: 'updateProofOfUTXORollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'bytes32[]', name: 'leaves', type: 'bytes32[]' },
      {
        internalType: 'bytes32[256][]',
        name: 'siblings',
        type: 'bytes32[256][]',
      },
    ],
    name: 'updateProofOfNullifierRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256[]', name: 'initialSiblings', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'leaves', type: 'uint256[]' },
    ],
    name: 'updateProofOfWithdrawalRollUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]