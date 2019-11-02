/* eslint-env jest */
'use strict'

require('../lib/array.includes.polyfill')

describe('array includes polyfill', () => {
  test('includes returns true', () => {
    expect(['what', 'hey'].includes('hey')).toBe(true)
  })

  test('includes return true with indexof -1', () => {
    expect(['what', 'hey'].includes('hey', -1)).toBe(true)
  })

  test('includes returns true with numbers', () => {
    expect([1, 2].includes(2)).toBe(true)
  })

  test('includes returns true with NaNs', () => {
    expect([NaN, 2].includes(NaN)).toBe(true)
  })

  test('includes returns true with empty array', () => {
    expect([].includes('hey')).toBe(false)
  })
})
