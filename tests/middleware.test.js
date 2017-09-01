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

  describe('additional fields', () => {
    beforeEach(async () => {
      res = await request(app)
        .get('/')
        .set('x-kuali-tenant', 'tenant')
        .set('x-kuali-lane', 'lane')
    })

    test('logs kuali tenant', () => {
      expect(catcher.last.req.tenant).toBe('tenant')
    })
    test('logs kuali lane', () => {
      expect(catcher.last.req.lane).toBe('lane')
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
