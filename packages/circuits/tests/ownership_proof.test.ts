/**
 * @jest-environment node
 */
/* eslint-disable jest/no-expect-resolves */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable jest/no-hooks */

import { genSNARK, SNARKResult } from '~utils/snark'
import {
  checkPhase1Setup,
  compileCircuit,
  getArtifactPaths,
  phase2Setup,
  prepareArtifactsDirectory,
} from './helper'
import { utxos } from '~dataset/testset-utxos'
import { accounts } from '~dataset/testset-keys'

const fileName = 'ownership_proof.test.circom'
const artifacts = getArtifactPaths(fileName)
const { wasm, finalZkey, vk } = artifacts

describe('ownership_proof.test.circom', () => {
  beforeAll(() => {
    checkPhase1Setup()
    prepareArtifactsDirectory()
  })
  it('should compile circuits', () => {
    compileCircuit(fileName)
  })
  it('should setup phase 2 for the circuit', () => {
    phase2Setup(fileName)
  })
  it('should create SNARK proof', async () => {
    const utxo = utxos.utxo1_out_1
    const account = accounts.bob
    const eddsa = account.signEdDSA(utxo.hash())
    const inputs = {
      note: utxo.hash().toBigInt(),
      pG_x: account.getEdDSAPoint().x.toBigInt(),
      pG_y: account.getEdDSAPoint().y.toBigInt(),
      sig_r8x: eddsa.R8.x.toBigInt(),
      sig_r8y: eddsa.R8.y.toBigInt(),
      sig_s: eddsa.S.toBigInt(),
    }

    const result: SNARKResult = await genSNARK(inputs, wasm, finalZkey, vk)
    expect(result).toBeDefined()
  })
})
