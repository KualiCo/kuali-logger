'use strict'

require('./array.includes.polyfill')

function isNode () {
  return process && process.release && process.release.name === 'node'
}

module.exports = config => {
  return isNode() ? require('./server')(config) : require('./client')
}
