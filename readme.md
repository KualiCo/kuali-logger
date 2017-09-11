[![bitHound Overall Score](https://www.bithound.io/projects/badges/2258aae0-8f63-11e7-b68c-bd8234fdabb6/score.svg)](https://www.bithound.io/github/KualiCo/kuali-logger)
[![bitHound Dependencies](https://www.bithound.io/projects/badges/2258aae0-8f63-11e7-b68c-bd8234fdabb6/dependencies.svg)](https://www.bithound.io/github/KualiCo/kuali-logger/master/dependencies/npm)
[![codecov](https://codecov.io/gh/KualiCo/kuali-logger/branch/master/graph/badge.svg?token=OMwRfQrCqY)](https://codecov.io/gh/KualiCo/kuali-logger)
[![CircleCI](https://circleci.com/gh/KualiCo/kuali-logger/tree/master.svg?style=shield&circle-token=b8b3696e50f3bce018f444658e7bd9c738d41751)](https://circleci.com/gh/KualiCo/kuali-logger/tree/master)

# Kuali Logger

Standardized logger for Kuali applications. The logger simplifies the process of making log output follow the Kuali Logging Standards.

The logger uses bunyan and related libraries. So bunyan docs can help with most of the configuration issues.

## Bunyan Docs
* [bunyan](https://github.com/trentm/node-bunyan)
* [bunyan-format](https://github.com/thlorenz/bunyan-format)
* [bunyan-middleware](https://github.com/tellnes/bunyan-middleware)
* [bunyan-prettystream](https://github.com/mrrama/node-bunyan-prettystream)

## Requirements
* Node 6 or later

## Features
* Follows [Kuali Logging Standards](https://docs.google.com/document/d/1QyKF5EM7QnlQsmIDxtShCyBkJdTI_77WY7EoVLX2Fdg/edit#)
* Loggly-ready json output
* pretty output format for development
* Ability to add custom serializers
* Ability to replace default stream
* Express-ready middleware for rich request/response log output
* Ability to obscure headers
* Ability to exclude headers
* Standard bunyan interface
* Ability to export src info *(don't use in production)*

## Usage

### Configuration
A configuration object is required when the logger is initialized. Typically [node-config](https://github.com/lorenwest/node-config) is used to manage the configuration. A `log` section can be created for the log configuration options and then that section is passed when the log is initialized.

```js
const log = require('kuali-logger')(config.get('log'))
```

These are the supported configuration options:

| Option | Type | Valid values or examples | Default | Required |
| --- | :---: | --- | :---: | :---: |
| `name` | string | res-coi-production | | X |
| `team` | string | res | | X |
| `product` | string | coi | | X |
| `environment` | string | production | | X |
| `level` | string | `trace`, `debug`, `info`, `warn`, `error`, `fatal` | `info` ||
| `format` | string | `short`, `long`, `simple`, `json`, `bunyan`, `pretty` | `json` ||
| `obscureHeaders` | array of strings | `['x-newrelic-id', 'ip']` | `['authorization', 'cookie']` ||
| `excludeHeaders` | array of strings | `['x-real-ip','x-newrelic-transaction']` | `[]` ||
| `stream` | object |  ```{ name: 'myStream', stream: process.stdout, level: 'debug', outputFormat: 'json' }```  | bunyan-format stream ||
| `src` | boolean | false, true *(Slows output, don't use in production)* | false ||

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
Middleware log events will always add `{ msg: request finished, event: REQUEST }` to the log entry.

```js
const express = require('express')
const log = require('kuali-logger')(config.get('log'))

const app = express()
app.use(log.middleware)
app.get('/', (req, res) => {
  req.log.info()
  res.sendStatus(200)
})
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
The event parameter is a string used to log events with a unique, searchable id. A list of events is maintained in the Logging Standards. Examples include:
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
