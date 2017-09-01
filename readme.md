# ToDo
* add licensing

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
* Logs to Kuali Logging Standards
* Loggly-ready json output
* pretty output format for development
* Ability to add custom serializers
* Ability to replace default stream
* Express-ready middleware for rich request/response log output
* Ability to obscure headers
* Ability to exclude headers
* Standard bunyan interface

## Usage

### Configuration
A configuration object is required when the logger is initialized. Typically [node-config](https://github.com/lorenwest/node-config) is used to manage the configuration. A `log` section can be created for the log configuration options and then that section is passed when the log is initialized.

```js
const log = require('kuali-logger')(config.get('log'))
```

These are the supported configuration options:

| Option | Type | Valid values or examples | Default |
| --- | --- | --- | --- |
| name (required) | string | res-coi-production | test |
| team (required) | string | res | |
| product (required) | string | coi | |
| environment (required) | string | production | |
| level | string | trace, debug, info, warn, error, fatal | info |
| format | string | short, long, simple, json, bunyan, pretty | json |
| obscureHeaders | array of strings | ['x-newrelic-id', 'ip'] | ['authorization', 'cookie'] |
| excludeHeaders | array of strings | ['x-real-ip','x-newrelic-transaction'] | [] |
| stream | object |  ```{ name: 'myStream', stream: process.stdout, level: 'debug', outputFormat: 'json' }```  | bunyan-format stream |


| Command | Description |
| --- | --- |
| git status | List all new or modified files |
| git diff | Show file differences that haven't been staged |

### Log Example

```js
const logConfig = {
  name: 'res-coi-production',
  team: 'res',
  product: 'coi',
  environment: 'production'
}
const log = require('kuali-logger')(logConfig)

log.info({ event: 'user_login_failed' }, 'User login failed')

log.error({ err, event: 'error'}, 'An error occurred')
```

### Middleware Example
```js
const express = require('express')
const log = require('kuali-logger')(config.get('log'))

const app = express()
app.use(log.middleware)
app.get('/', (req, res) => {
  req.log.info('Homepage request')
  res.sendStatus(200)
})
```

## Events
The event parameter is a string used to log events with a unique, searchable id. A list of events is maintained in the Logging Standards. Examples include:
* `user_login_succeeded`
* `user_login_failed`
* `course_created`
* `protocol_viewed`
* `report_generated`
* `notification_sent`
* `error`

## Logging an error
The standard bunyan error serializer is available. It can be invoked this way. Always set `event: 'error'` for these.

```js
if(err) {
  log.error({ err, event: 'error' }, 'An error occurred')
}
```

## Configure a custom stream
You can override the default stream configuration with your own stream configuration.

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
    submittedDate: course.submittedDate,
    author: course.author
  }
}

const log = require('kuali-logger')(logConfig)

log.addSerializer({ course: courseSerializer })

log.info({ course, event: 'course_created' }, 'New course created')
```
