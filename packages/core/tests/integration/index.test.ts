import { Fp } from '~babyjubjub'

describe('integration test', () => {
  it('field', () => {
    expect.hasAssertions()
    expect(Fp.from(1)).toBeDefined()
  })
})
