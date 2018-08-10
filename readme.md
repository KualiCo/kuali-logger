[![CircleCI](https://circleci.com/gh/KualiCo/kuali-logger/tree/master.svg?style=shield&circle-token=b8b3696e50f3bce018f444658e7bd9c738d41751)](https://circleci.com/gh/KualiCo/kuali-logger/tree/master)
[![codecov](https://codecov.io/gh/KualiCo/kuali-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/KualiCo/kuali-logger)

# Kuali Logger

Standardized logger for Kuali applications. The logger simplifies the process of making log output follow the Kuali Logging Standards.

The logger uses Bunyan and related libraries. Bunyan docs can help with most configuration issues.

## Bunyan Docs
* [bunyan](https://github.com/trentm/node-bunyan)
* [bunyan-format](https://github.com/thlorenz/bunyan-format)
* [bunyan-middleware](https://github.com/tellnes/bunyan-middleware)
* [bunyan-prettystream](https://github.com/mrrama/node-bunyan-prettystream)

## Requirements
* Node 4 or later

## Features
* Follows Kuali Logging Standards
* Loggly-ready json output
* pretty output format for development
* Ability to add custom serializers
* Ability to replace default stream
* Express-ready middleware for simple request/response log output
* Ability to obscure headers
* Ability to exclude headers
* Standard bunyan interface
* Automatically adds x-request-id header if not present and adds it to log outpu
* Works when present in browser for components that run in both server and client
* Ability to export src info *(don't use in production)*

## Usage

### Configuration
A configuration object is required when the logger is initialized. Typically [node-config](https://github.com/lorenwest/node-config) is used to manage the configuration. A `log` section can be created for the log configuration options and then that section is passed when the log is initialized.

```js
const log = require('kuali-logger')(config.get('log'))
```

These are the supported configuration options:

| Option             | Type                                                                       | Valid values or examples                                                                 | Default                       | Required |
| ------------------ | :------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------- | :---------------------------: | :------: |
| `name`             | string                                                                     | res-coi-production                                                                       |                               | X        |
| `team`             | string                                                                     | res                                                                                      |                               | X        |
| `product`          | string                                                                     | coi                                                                                      |                               | X        |
| `environment`      | string                                                                     | production                                                                               |                               | X        |
| `level`            | string                                                                     | `trace`, `debug`, `info`, `warn`, `error`, `fatal`                                       | `info`                        |
| `format`           | string                                                                     | `short`, `long`, `simple`, `json`, `bunyan`, `pretty`                                    | `json`                        |
| `obscureHeaders`   | array of strings                                                           | `['x-newrelic-id', 'ip']`                                                                | `['authorization', 'cookie']` |
| `excludeHeaders`   | array of strings                                                           | `['x-real-ip','x-newrelic-transaction']`                                                 | `[]`                          |
| `stream`           | object                                                                     | ```{ name: 'myStream', stream: process.stdout, level: 'debug', outputFormat: 'json' }``` | bunyan-format stream          |
| `src`              | boolean                                                                    | false, true *(Slows output, don't use in production)*                                    | false                         |
| `serializers`      | [object with functions](https://github.com/trentm/node-bunyan#serializers) | valid javascript serializer functions                                                    |                               |
| `middlewareFilter` | function                                                                   |                                                                                          | valid javascript function     |          |

### Log Example

```js
const logConfig = {
  name: 'stu-cm-production',
  team: 'stu',
  product: 'cm',
  environment: 'production'
}
const log = require('kuali-logger')(logConfig)

log.info({ event: 'COURSE_CREATE' }, 'New course create')
```

#### Output

```json
{
  "name": "stu-cm-production",
  "team": "stu",
  "product": "cm",
  "environment": "production",
  "hostname": "230ff563d429",
  "pid": 71132,
  "level": "INFO",
  "event": "COURSE_CREATE",
  "msg": "New course created",
  "time": "2017-09-04T19:04:26.481Z",
  "v": 0
}
```

### Middleware Example
Adding the logger middleware will automatically log all request and response events. The log entries will always contain `{ msg: request finished, event: REQUEST }`.

```js
const express = require('express')
const log = require('kuali-logger')({
  ...config.get('log'),
  additionalRequestFinishData: (req, res) => ({
    userId: req.userInfo.id,
    userName: req.userInfo.userName
  },
  filter: (req, res) => req.url.includes('/api/v1/health')
)

const app = express()
app.use(log.middleware)
```

#### Output

```js
{
"name": "fin-accounts-production",
"team": "fin",
"product": "accounts",
"environment": "production",
"hostname": "230ff563d429",
"pid": 71132,
"requestId": "a4ee9850-91a9-11e7-a102-2bb7f248d18e",
"level": "INFO",
"res":
  { "statusCode": 200,
    "header": "HTTP/1.1 200 OK
      X-Request-Id: a4ee9850-91a9-11e7-a102-2bb7f248d18e
      Content-Type: text/plain; charset=utf-8
      Content-Length: 2
      ETag: W2-nOO9QiTIwXgNtWtBJezz8kv3SLc
      Date: Mon, 04 Sep 2017 19:45:46 GMT
      Connection: keep-alive",
"duration": 0.5717479999999999,
"req":
  { "method": "GET",
    "url": "/",
    "headers":
    { "host": "127.0.0.1:59758",
      "accept-encoding": "gzip, deflate",
      "user-agent": "node-superagent/3.6.0",
      "x-kuali-tenant": "iu",
      "x-kuali-lane": "prd",
      "connection": "close" },
    "query": {},
    "remoteAddress": "::ffff:127.0.0.1",
    "remotePort": 59759 },
"event": "REQUEST",
"tenant": "iu",
"lane": "prd",
"msg": "request finish",
"time": "2017-09-04T19:45:46.070Z",
"v": 0 }
```

## Events
The event parameter is a string constant used to log events with a unique, searchable id. A list of events is maintained in the Kuali Logging Standards. Examples include:
* `LOGIN_SUCCESS`
* `LOGIN_FAILURE`
* `COURSE_CREATE`
* `PROTOCOL_READ`
* `REPORT_DELETE`
* `NOTIFICATION_SEND_SUCCESS`
* `ERROR`
* `REQUEST`

## Logging an error
The standard bunyan error serializer is available. It can be invoked this way. Always set `event: 'ERROR'` for these.

```js
if(err) {
  log.error({ err, event: 'ERROR' }, 'An error occurred')
}
```

#### Output

```js
{
  "name": "res-coi-production",
  "team": "res",
  "product": "coi",
  "environment": "production",
  "hostname": "230ff563d429",
  "pid": 71132,
  "level": "ERROR",
  "err": {
    "message": "An error occurred",
    "name": "Error",
    "stack": "Error: An error occurred
        at Object.test (\/tests\/log.test.js:87:19)
        at Object.asyncFn (\/node_modules\/jest-jasmine2\/build\/jasmine-async.js:68:30)
        at e (\/node_modules\/jest-jasmine2\/build\/queueRunner.js:38:12)
        at mapper (\/node_modules\/jest-jasmine2\/build\/queueRunner.js:31:21)
        at Promise.resolve.then.el (\/node_modules\/p-map\/index.js:42:16)
        at process._tickCallback (internal\/process\/next_tick.js:109:7)"
  },
  "event": "ERROR",
  "msg": "An error occurred",
  "time": "2017-09-04T18:19:41.193Z",
  "v": 0
}
```

## Filter log output
You can filter log output by creating a function that modifies the `req` and `res` objects and applying it to the log configuration.

```js
function myMiddlewareFilter (req, res) {
  const pattern = /(\/readyz$|\/healthz$|\/metrics$|\/health$)/
  return req.headers['x-synthetic'] || pattern.test(req.url)
}

module.exports = {
  log: {
    middlewareFilter: myMiddlewareFilter
  }
}
```

## Configure a custom stream
You can override the default stream configuration with your own [stream configuration](https://github.com/trentm/node-bunyan#streams).

```js
const streamConfig = {
  name: 'myStream',
  stream: process.stdout,
  level: 'debug',
  outputFormat: 'json'

}

const logConfig = {
  name: 'res-coi-production',
  team: 'res',
  product: 'coi',
  environment: 'production',
  stream: streamConfig
}

const log = require('kuali-logger')(logConfig)
```

## Replace a standard serializer
You can replace the built-in serializers (`req` and `res`) with your own functions.

```js
function myResSerializer(res) {
  return {
    statusCode: res.statusCode,
    header: res._header
  }
}

module.exports = {
  log: {
    serializers: {
      res: myResSerializer
    }
  }
}
```

## Add a custom serializer
You can use the standard bunyan method to [add a custom serializer](https://github.com/trentm/node-bunyan#serializers).


```js
function courseSerializer(course) {
  return {
    title: course.title,
    createdAt: course.createdAt,
    author: course.author
  }
}

const log = require('kuali-logger')(config.get('log'))

log.addSerializer({ course: courseSerializer })

log.info({ course, event: 'COURSE_CREATE' }, 'New course create')
```

## Development
PRs are welcome!

### Tests
Test coverage must always stay at 100% in order to pass builds. To run the test suite, first install the dependencies, then run `yarn test`:

```bash
$ yarn install
$ yarn test
```

### Continuous Integration

[CircleCI](https://circleci.com) handles continuous integration. Successful updates to the master branch are automatically published to the [public npm registry](https://www.npmjs.com/package/kuali-logger).
