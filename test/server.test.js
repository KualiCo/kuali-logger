var catcher = require('./helpers/catcher')

var baseConfig = {
  name: 'testLogger',
  team: 'testTeam',
  product: 'testProduct',
  environment: 'testEnvironment'
}

var log = require('../lib')(baseConfig)

function initTestStream (log) {
  log.streams = []
  log.addStream({
    name: 'testStream',
    stream: catcher,
    level: 'debug',
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

    var requiredOptions = ['name', 'team', 'product', 'environment']

    function createLog (removeOption) {
      var newConfig = Object.assign({ level: 100 }, baseConfig)
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
      var log3 = require('../lib')(
        Object.assign({}, baseConfig, { format: 'pretty', level: 100 })
      )
      log3.info('test')
      expect('no errors')
    })
  })

  describe('src', () => {
    test('src not output by default', () => {
      log.info('test')
      expect(catcher.last.hasOwnProperty('src')).toBe(false)
    })

    test('output src object', () => {
      var log4 = require('../lib')(
        Object.assign({}, baseConfig, { src: true, level: 100 })
      )
      initTestStream(log4)
      log4.info('test')
      expect(catcher.last.hasOwnProperty('src')).toBe(true)
    })
  })

  describe('error', () => {
    test('logs standard serialized error', () => {
      var errMessage = 'An error occurred'
      var err = new Error(errMessage)
      log.error({ err, event: 'error' })
      expect(catcher.last.msg).toBe(errMessage)
      expect(catcher.last.event).toBe('error')
    })
  })
})
