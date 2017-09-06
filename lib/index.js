function isNode () {
  try {
    return process.release.name === 'node'
  } catch (e) {
    return false
  }
}

module.exports = config => {
  let logger

  if (isNode()) {
    // return server-side bunyan-based logger
    logger = require('./server')(config)
  } else {
    // return browser client-side console logger
    logger = require('./client')
  }
  return logger
}
