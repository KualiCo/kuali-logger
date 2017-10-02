'use strict'

exports.trace = function () {
  console.trace(Array.prototype.slice.call(arguments).toString())
}

exports.debug = function () {
  console.log(Array.prototype.slice.call(arguments).toString())
}

exports.info = function () {
  console.info(Array.prototype.slice.call(arguments).toString())
}

exports.warn = function () {
  console.warn(Array.prototype.slice.call(arguments).toString())
}

exports.error = function () {
  console.error(Array.prototype.slice.call(arguments).toString())
}

exports.fatal = function () {
  console.error(Array.prototype.slice.call(arguments).toString())
}
