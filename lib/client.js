'use strict'

exports.trace = function () {
  console.trace.apply(console, arguments)
}

exports.debug = function () {
  console.log.apply(console, arguments)
}

exports.info = function () {
  console.info.apply(console, arguments)
}

exports.warn = function () {
  console.warn.apply(console, arguments)
}

exports.error = function () {
  console.error.apply(console, arguments)
}

exports.fatal = function () {
  console.error.apply(console, arguments)
}
