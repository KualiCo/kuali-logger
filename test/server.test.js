/**
 * @testEnvironment node
 */

/* eslint-env jest */

const catcher = require('./helpers/catcher')
const { flatten } = require('../lib/server')

const baseConfig = {
  name: 'testLogger',
  team: 'testTeam',
  product: 'testProduct',
  environment: 'testEnvironment'
}

const log = require('../lib')(baseConfig)

function initTestStream (log) {
  log.streams = []
  log.addStream({
    name: 'testStream',
    stream: catcher,
    level: 'debug',
    type: 'raw',
    outputFormat: 'json'
  })
}

initTestStream(log)

beforeEach(() => {
  catcher.clear()
})

describe('server logger', () => {
  describe('outputs standard fields', () => {
    beforeEach(() => {
      log.info({ event: 'what' }, 'hey')
    })

    test('msg', () => {
      expect(catcher.last.msg).toBe('hey')
    })
    test('event', () => {
      expect(catcher.last.event).toBe('what')
    })
    test('name', () => {
      expect(catcher.last.name).toBe(baseConfig.name)
    })
    test('team', () => {
      expect(catcher.last.team).toBe(baseConfig.team)
    })
    test('product', () => {
      expect(catcher.last.product).toBe(baseConfig.product)
    })
    test('environment', () => {
      expect(catcher.last.environment).toBe(baseConfig.environment)
    })
  })

  describe('required options', () => {
    test('throws error when no config', () => {
      function createLog () {
        require('../lib')()
      }
      expect(createLog).toThrow()
    })

    const requiredOptions = ['name', 'team', 'product', 'environment']

    function createLog (removeOption) {
      const newConfig = Object.assign({ level: 100 }, baseConfig)
      newConfig[removeOption] = null
      require('../lib')(newConfig)
    }

    requiredOptions.forEach(option => {
      test(`throws error when missing ${option} option`, () => {
        expect(() => {
          createLog(option)
        }).toThrow()
      })
    })
  })

  describe('pretty', () => {
    test('create pretty stream', () => {
      const log3 = require('../lib')(
        Object.assign({}, baseConfig, { format: 'pretty', level: 100 })
      )
      log3.info('test')
      expect('no errors')
    })
  })

  describe('src', () => {
    test('src not output by default', () => {
      log.info('test')
      expect(catcher.last).not.toHaveProperty('src')
    })

    test('output src object', () => {
      const log4 = require('../lib')(
        Object.assign({}, baseConfig, { src: true, level: 100 })
      )
      initTestStream(log4)
      log4.info('test')
      expect(catcher.last).toHaveProperty('src')
    })
  })

  describe('error', () => {
    test('logs standard serialized error', () => {
      const errMessage = 'An error occurred'
      const err = new Error(errMessage)
      log.error({ err, event: 'error' })
      expect(catcher.last.msg).toBe(errMessage)
      expect(catcher.last.event).toBe('error')
    })
  })

  describe('flatten object', () => {
    test('A nested object passed into flatten function should be flat', () => {
      const data = {
        name: 'app-integrations-api',
        team: 'app',
        product: 'integrations-api',
        environment: 'default',
        hostname: 'f874aec7d23a',
        pid: 54,
        requestId: '97eb4ba0-3b5d-11ec-adac-3ba409dd4e94',
        level: 50,
        err: {
          message: 'getaddrinfo ENOTFOUND swapi.devtest',
          name: 'Error',
          stack:
            'Error: getaddrinfo ENOTFOUND swapi.devtest\n' +
            '    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:71:26)\n' +
            '    at GetAddrInfoReqWrap.callbackTrampoline (internal/async_hooks.js:130:17)',
          code: 'ENOTFOUND',
          signal: undefined
        },
        msg: 'Error in Integrations API',
        v: 0
      }
      expect(flatten(data)).toStrictEqual({
        name: 'app-integrations-api',
        team: 'app',
        product: 'integrations-api',
        environment: 'default',
        hostname: 'f874aec7d23a',
        pid: 54,
        requestId: '97eb4ba0-3b5d-11ec-adac-3ba409dd4e94',
        level: 50,
        'err.message': 'getaddrinfo ENOTFOUND swapi.devtest',
        'err.name': 'Error',
        'err.stack':
          'Error: getaddrinfo ENOTFOUND swapi.devtest\n    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:71:26)\n    at GetAddrInfoReqWrap.callbackTrampoline (internal/async_hooks.js:130:17)',
        'err.code': 'ENOTFOUND',
        'err.signal': undefined,
        msg: 'Error in Integrations API',
        v: 0
      })
    })

    test('isPlainObject function should ensure that arrays and null values are passed through properly', () => {
      const data = {
        name: 'app-integrations-api',
        team: 'app',
        product: 'integrations-api',
        environment: 'default',
        hostname: 'f874aec7d23a',
        pid: 54,
        requestId: '97eb4ba0-3b5d-11ec-adac-3ba409dd4e94',
        level: [50, 1, 2],
        err: {
          message: 'getaddrinfo ENOTFOUND swapi.devtest',
          name: 'Error',
          stack:
            'Error: getaddrinfo ENOTFOUND swapi.devtest\n' +
            '    at GetAddrInfoReqWrap.onlookup [as oncomplete] (dns.js:71:26)\n' +
            '    at GetAddrInfoReqWrap.callbackTrampoline (internal/async_hooks.js:130:17)',
          code: 'ENOTFOUND',
          signal: undefined
        },
        msg: null,
        v: 0
      }
      const flattenedData = flatten(data)
      expect(flattenedData.msg).toStrictEqual(null)
      expect(flattenedData.level).toStrictEqual([50, 1, 2])
    })
  })
})
