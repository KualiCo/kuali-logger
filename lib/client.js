exports.trace = (...message) => {
  console.trace(...message)
}

exports.debug = (...message) => {
  console.log(...message)
}

exports.info = (...message) => {
  console.info(...message)
}

exports.warn = (...message) => {
  console.warn(...message)
}

exports.error = (...message) => {
  console.error(...message)
}

exports.fatal = (...message) => {
  console.error(...message)
}
