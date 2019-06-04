'use strict'

require('./array.includes.polyfill')

function isNode () {
  return (
    typeof process === 'object' &&
    process &&
    process.release &&
    process.release.name === 'node'
  )
}

module.exports = config => {
  return isNode() ? require('./server')(config) : require('./client')
}
