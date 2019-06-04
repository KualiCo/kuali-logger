/* eslint-env jest */

'use strict'

const mockConsoleMethods = ['trace', 'log', 'info', 'warn', 'error']
let consoleMocks, log

beforeAll(() => {
  const originalProcess = process
  global.process = undefined
  log = require('../lib')()
  global.process = originalProcess
})

beforeEach(() => {
  consoleMocks = mockConsoleMethods.reduce((mocks, method) => {
    mocks[method] = jest.spyOn(console, method).mockImplementation(() => {})
    return mocks
  }, {})
})

afterEach(() => {
  mockConsoleMethods.forEach(mock => consoleMocks[mock].mockRestore())
})

describe('client logger', () => {
  test.each([
    ['trace', 'trace'],
    ['debug', 'log'],
    ['info', 'info'],
    ['warn', 'warn'],
    ['error', 'error'],
    ['fatal', 'error']
  ])('response correctly to %s', (command, consoleMethod) => {
    log[command]({ sample: 'test', works: true }, command)
    const mock = consoleMocks[consoleMethod]
    expect(mock).toHaveBeenCalledWith({ sample: 'test', works: true }, command)
  })
})
