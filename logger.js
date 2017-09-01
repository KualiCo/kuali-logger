const bunyan = require('bunyan')
const bunyanFormat = require('bunyan-format')
const bunyanMiddleware = require('bunyan-middleware')

module.exports = config => {
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
  const middleConfig = {
    headerName: 'X-Request-Id',
    propertyName: 'requestId',
    logName: 'requestId',
    obscureHeaders: ['Authorization'].concat(config.obscureHeaders || []),
    excludeHeaders: config.excludeHeaders || [],
    additionalRequestFinishData: req => {
      const extraFields = {
        event: 'request',
        tenant: req.headers['x-kuali-tenant'],
        lane: req.headers['x-kuali-lane']
      }
      return extraFields
    }
  }

  const middlewareConfig = Object.assign({}, middleConfig, { logger })
  return middlewareConfig
}

function getLoggerConfig (config) {
  const loggerConfig = {
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
    ]
  }
  return loggerConfig
}
