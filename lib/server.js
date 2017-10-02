'use strict'

var bunyan = require('bunyan')
var bunyanFormat = require('bunyan-format')
var bunyanMiddleware = require('bunyan-middleware')

module.exports = function (config) {
  validateConfig(config)

  var loggerConfig = getLoggerConfig(config)
  var logger = bunyan.createLogger(loggerConfig)

  if (config.stream) {
    logger.streams = []
    logger.addStream(config.stream)
  }

  if (config.format === 'pretty') {
    var PrettyStream = require('bunyan-prettystream')
    var prettyStdOut = new PrettyStream()
    prettyStdOut.pipe(process.stdout)

    logger.streams = []
    logger.addStream({ level: config.level, stream: prettyStdOut })
  }

  logger.middleware = bunyanMiddleware(getMiddlewareConfig(config, logger))
  return logger
}

function validateConfig (config) {
  var requiredOptions = ['name', 'team', 'product', 'environment']

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
  var alwaysObscureHeaders = ['authorization', 'cookie']

  var middleConfig = {
    headerName: 'X-Request-Id',
    propertyName: 'requestId',
    logName: 'requestId',
    obscureHeaders: alwaysObscureHeaders.concat(config.obscureHeaders || []),
    excludeHeaders: config.excludeHeaders || [],
    additionalRequestFinishData: req => {
      var extraFields = {
        event: 'REQUEST',
        tenant: req.headers['x-kuali-tenant'],
        lane: req.headers['x-kuali-lane']
      }
      return extraFields
    }
  }

  var middlewareConfig = Object.assign({}, middleConfig, { logger })
  return middlewareConfig
}

function getLoggerConfig (config) {
  var loggerConfig = {
    name: config.name,
    team: config.team,
    product: config.product,
    environment: config.environment,
    level: config.level || 'info',
    serializers: { err: bunyan.stdSerializers.err },
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
