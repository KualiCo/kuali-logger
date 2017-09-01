const express = require('express')
const request = require('supertest')
const catcher = require('./helpers/catcher')

const stream = {
  name: 'testStream',
  stream: catcher,
  level: 'debug',
  outputFormat: 'json'
}

const obscureHeaders = ['obscure']
const excludeHeaders = ['exclude']

const log = require('../logger')({
  name: 'testLogger',
  team: 'testTeam',
  product: 'testProduct',
  environment: 'testEnvironment',
  stream,
  obscureHeaders,
  excludeHeaders
})
const logMiddleware = log.middleware

const app = express()
app.use(logMiddleware)
app.get('/', (req, res) => {
  req.log.info('hey')
  res.sendStatus(200)
})

beforeEach(() => {
  catcher.clear()
})

describe('middleware', () => {
  let res
  describe('requestId', () => {
    describe('no requestId', () => {
      beforeEach(async () => {
        res = await request(app).get('/')
      })

      test('sets x-request-id header', () => {
        expect(res.headers.hasOwnProperty('x-request-id')).toBe(true)
      })
      test('logs requestId', () => {
        expect(catcher.last.req.requestId).not.toBeNull()
      })
    })

    describe('existing requestId', () => {
      beforeEach(async () => {
        res = await request(app).get('/').set('X-Request-Id', 'test')
      })

      test('leaves x-request-id header unchanged', () => {
        expect(res.headers['x-request-id']).toBe('test')
      })
      test('logs correct requestId', () => {
        expect(catcher.last.requestId).toBe('test')
      })
    })
  })

  describe('additional fields', () => {
    beforeEach(async () => {
      res = await request(app)
        .get('/')
        .set('x-kuali-tenant', 'tenant')
        .set('x-kuali-lane', 'lane')
    })

    test('logs request event', () => {
      expect(catcher.last.event).toBe('request')
    })
    test('logs tenant field', () => {
      expect(catcher.last.tenant).toBe('tenant')
    })
    test('logs lane field', () => {
      expect(catcher.last.lane).toBe('lane')
    })
  })

  describe('obscureHeaders and excludeHeaders', () => {
    beforeEach(async () => {
      res = await request(app)
        .get('/')
        .set('obscure', 'test')
        .set('exclude', 'test')
        .set('Authorization', 'Bearer hey')
    })

    test('obscures correct headers', () => {
      expect(catcher.last.req.headers.obscure).toBeNull()
    })
    test('excludes correct headers', () => {
      expect(catcher.last.req.headers.hasOwnProperty('exclude')).toEqual(false)
    })
    test('obscures Authorization header', () => {
      expect(catcher.last.req.headers.authorization).toBeNull()
    })
  })
})
