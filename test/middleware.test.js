/* eslint-env jest */

'use strict'

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

function createApp (customConfig) {
  const log = require('../lib')(
    Object.assign(
      {
        name: 'testLogger',
        team: 'testTeam',
        product: 'testProduct',
        environment: 'testEnvironment',
        stream,
        obscureHeaders,
        excludeHeaders
      },
      customConfig
    )
  )

  const app = express()
  app.use(log.middleware)
  app.get('/', (req, res) => {
    req.appSpecificReq = 'test'
    req.log.info()
    res.send('ok')
  })
  return app
}

beforeEach(() => {
  catcher.clear()
})

describe('middleware', () => {
  describe('requestId', () => {
    test('sets requestId correctly if no existing requestId', done => {
      const app = createApp()
      request(app)
        .get('/')
        .end((err, res) => {
          if (err) throw err
          expect(res.headers.hasOwnProperty('x-request-id')).toBe(true)
          expect(catcher.last.req.requestId).not.toBeNull()
          done()
        })
    })

    test('leaves existing requestId unchanged', done => {
      const app = createApp()
      request(app)
        .get('/')
        .set('X-Request-Id', 'test')
        .end((err, res) => {
          if (err) throw err
          expect(res.headers['x-request-id']).toBe('test')
          expect(catcher.last.requestId).toBe('test')
          done()
        })
    })
  })

  describe('additional fields', () => {
    const app = createApp()
    test('adds additional fields to log output', done => {
      request(app)
        .get('/')
        .set('x-kuali-tenant', 'tenant')
        .set('x-kuali-lane', 'lane')
        .end((err, res) => {
          if (err) throw err
          expect(catcher.last.event).toBe('REQUEST')
          expect(catcher.last.tenant).toBe('tenant')
          expect(catcher.last.lane).toBe('lane')
          done()
        })
    })
    test('adds app specific fields', done => {
      const app = createApp({
        additionalRequestFinishData: req => ({
          appSpecificReq: req.appSpecificReq
        })
      })
      request(app)
        .get('/')
        .set('x-kuali-tenant', 'tenant')
        .set('x-kuali-lane', 'lane')
        .end((err, res) => {
          if (err) throw err
          expect(catcher.last.event).toBe('REQUEST')
          expect(catcher.last.appSpecificReq).toBe('test')
          done()
        })
    })
  })

  describe('obscureHeaders and excludeHeaders', () => {
    test('obscures and excludes configured headers', done => {
      const app = createApp()
      request(app)
        .get('/')
        .set('obscure', 'test')
        .set('exclude', 'test')
        .set('Authorization', 'Bearer hey')
        .end((err, res) => {
          if (err) throw err
          expect(catcher.last.req.headers.obscure).toBeNull()
          expect(catcher.last.req.headers.hasOwnProperty('exclude')).toEqual(
            false
          )
          expect(catcher.last.req.headers.authorization).toBeNull()
          done()
        })
    })
  })

  describe('filters requests', () => {
    test('filters requests based on filter function', done => {
      const app = createApp({
        middlewareFilter: req => req.url.includes('filtered')
      })
      request(app)
        .get('/filtered')
        .end((err, res) => {
          if (err) throw err
          expect(catcher.last).toBeFalsy()
          done()
        })
    })
  })
})
