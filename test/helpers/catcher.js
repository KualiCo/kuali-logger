'use strict'

class Catcher {
  constructor () {
    this.records = []
  }

  write (record) {
    this.records.push(record)
  }

  clear () {
    this.records = []
  }

  get last () {
    if (this.records.length > 0) {
      return JSON.parse(this.records[this.records.length - 1])
    }
  }
}

const catcher = new Catcher()

module.exports = catcher
