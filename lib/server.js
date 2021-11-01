'use strict'

const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
const bunyanMiddleware = require('bunyan-middleware')
const pkg = require('../package.json')

module.exports = function (config) {
  validateConfig(config)

  const loggerConfig = getLoggerConfig(config)
  const logger = bunyan.createLogger(loggerConfig)

  if (config.stream) {
    logger.streams = []
    logger.addStream(config.stream)
  }
  if (config.format === 'pretty') {
    const PrettyStream = require('bunyan-prettystream')
    const prettyStdOut = new PrettyStream()
    prettyStdOut.pipe(process.stdout)

    logger.streams = []
    logger.addStream({ level: config.level, stream: prettyStdOut })
  }
  /* istanbul ignore next */
  if (config.api) {
    const tracer = config.api.trace.getTracer(pkg.name, pkg.version)
    logger.addStream({
      name: 'opentelemetry-logger',
      type: 'raw',
      stream: {
        write: data => {
          if (data.event === 'REQUEST') return
          const span = tracer.startSpan('log')
          span.setAttributes(flatten(data))
          span.end()
        }
      },
      level: 'debug'
    })
  }
  logger.middleware = bunyanMiddleware(getMiddlewareConfig(config, logger))
  return logger
}

function validateConfig (config) {
  const requiredOptions = ['name', 'team', 'product', 'environment']

  if (!config) {
    throw new Error('config object is required')
  }

  requiredOptions.forEach(option => {
    if (!config[option]) {
      throw new Error(`${option} is required`)
    }
  })
}

function getMiddlewareConfig (config, logger) {
  const alwaysObscureHeaders = [
    'authorization',
    'cookie',
    'x-kuali-authm',
    'x-kuali-authm-service'
  ]

  return {
    headerName: 'X-Request-Id',
    propertyName: 'requestId',
    logName: 'requestId',
    obscureHeaders: alwaysObscureHeaders.concat(config.obscureHeaders || []),
    excludeHeaders: config.excludeHeaders || [],
    filter: config.middlewareFilter,
    additionalRequestFinishData: (req, res) => {
      return Object.assign(
        {
          event: 'REQUEST',
          tenant: req.headers['x-kuali-tenant'],
          lane: req.headers['x-kuali-lane']
        },
        config.additionalRequestFinishData
          ? config.additionalRequestFinishData(req, res)
          : {}
      )
    },
    logger
  }
}
function flatten (obj, keys = []) {
  /* istanbul ignore next */
  let result = {}
  for (const key in obj) {
    if (typeof obj[key] !== 'object') {
      result[[...keys, key].join('.')] = obj[key]
    } else {
      result = { ...result, ...flatten(obj[key], [...keys, key]) }
    }
  }
  return result
}

function getLoggerConfig (config) {
  const loggerConfig = {
    name: config.name,
    team: config.team,
    product: config.product,
    environment: config.environment,
    level: config.level || 'info',
    serializers: Object.assign(
      { err: bunyan.stdSerializers.err },
      config.serializers || {}
    ),
    streams: [
      {
        level: config.level || 'info',
        stream: bunyanFormat({
          outputMode: config.format || 'bunyan',
          levelInString: true
        })
      }
    ],
    src: config.src || false
  }
  return loggerConfig
}
