module.exports = config => {
  let logger

  if (process.release.name === 'node') {
    // return server-side bunyan-based logger
    logger = require('./server')(config)
  } else {
    // return browser client-side console logger
    logger = require('./client')
  }
  return logger
}
