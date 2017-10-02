'use strict'

exports.trace = () => {
  console.trace.apply(console, arguments)
}

exports.debug = () => {
  console.log.apply(console, arguments)
}

exports.info = () => {
  console.info.apply(console, arguments)
}

exports.warn = () => {
  console.warn.apply(console, arguments)
}

exports.error = () => {
  console.error.apply(console, arguments)
}

exports.fatal = () => {
  console.error.apply(console, arguments)
}
