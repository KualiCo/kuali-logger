'use strict'

var toArray = require('lodash.toarray')

// Modified copy of https://github.com/sfarthin/intercept-stdout
// Intercept stdout and stderr to pass output thru callback.
//
//  Optionally, takes two callbacks.
//    If two callbacks are specified,
//      the first intercepts stdout, and
//      the second intercepts stderr.
//
// returns an unhook() function, call when done intercepting
module.exports = (stdoutIntercept, stderrIntercept) => {
  stderrIntercept = stderrIntercept || stdoutIntercept

  var oldStdOutWrite = process.stdout.write
  var oldStdErrWrite = process.stderr.write

  process.stdout.write = (write => {
    return (string, encoding, fd) => {
      var args = toArray(arguments)
      args[0] = interceptor(string, stdoutIntercept)
      // write.apply(process.stdout, args)   commented to suppress output to screen
    }
  })(process.stdout.write)

  process.stderr.write = (write => {
    return (string, encoding, fd) => {
      var args = toArray(arguments)
      args[0] = interceptor(string, stderrIntercept)
      // write.apply(process.stderr, args)     commented to suppress output to screen
    }
  })(process.stderr.write)

  function interceptor (string, callback) {
    // only intercept the string
    var result = callback(string)
    if (typeof result === 'string') {
      string =
        result.replace(/\n$/, '') + (result && /\n$/.test(string) ? '\n' : '')
    }
    return string
  }

  // puts back to original
  return function unhook () {
    process.stdout.write = oldStdOutWrite
    process.stderr.write = oldStdErrWrite
  }
}
