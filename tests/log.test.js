const catcher = require('./helpers/catcher')

const baseConfig = {
  name: 'testLogger',
  team: 'testTeam',
  product: 'testProduct',
  environment: 'testEnvironment'
}

const log = require('../logger')(baseConfig)

log.streams = []
log.addStream({
  name: 'testStream',
  stream: catcher,
  level: 'debug',
  outputFormat: 'json'
})

beforeEach(() => {
  catcher.clear()
})

describe('logger', () => {
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
      function createLog() {
        const log4 = require('../logger')()
      }
      expect(createLog).toThrow()
    })

    const requiredOptions = ['name', 'team', 'product', 'environment']

    function createLog(removeOption) {
      const newConfig = Object.assign({ level: 100 }, baseConfig)
      newConfig[removeOption] = null
      const log4 = require('../logger')(newConfig)
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
      const log3 = require('../logger')(
        Object.assign({}, baseConfig, { format: 'pretty', level: 100 })
      )
      log3.info('test')
      expect('no errors')
    })
  })
})
