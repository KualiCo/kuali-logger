'use strict'

class Catcher {
  constructor () {
    this.records = []
  }

  write (record) {
    if (record.msg === 'request socket closed') return
    this.records.push(record)
  }

  clear () {
    this.records = []
  }

  get last () {
    if (this.records.length > 0) {
      return this.records[this.records.length - 1]
    }
  }
}

const catcher = new Catcher()

module.exports = catcher
