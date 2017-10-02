'use strict'

var intercept = require('./helpers/intercept-stdout')
var capturedText = ''
var log
var unhookIntercept
var originalRelease = process.release

beforeAll(() => {
  process.release = undefined
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
  var testParams = { sample: 'test', works: true }
  var commands = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

  commands.forEach(command => {
    test(`responds correctly to ${command}`, () => {
      log[command](testParams, command)
      expect(capturedText).toContain(command)
      expect(capturedText).toContain(testParams)
    })
  })
})
