const intercept = require('./helpers/intercept-stdout')
let capturedText = ''
let log
let unhookIntercept
const originalRelease = process.release

beforeAll(() => {
  process.release = { name: 'not node' }
  log = require('../lib')()

  unhookIntercept = intercept(text => {
    capturedText += text
  })
})

afterAll(() => {
  unhookIntercept()
  process.release = originalRelease
})

beforeEach(() => {
  capturedText = ''
})

describe('client logger', () => {
  const testParams = { sample: 'test', works: true }
  const commands = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

  commands.forEach(command => {
    test(`responds correctly to ${command}`, () => {
      log[command](testParams, command)
      expect(capturedText).toContain(command)
    })
  })
})
