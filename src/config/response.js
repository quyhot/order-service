module.exports = class IDatabaseResult {
  constructor ({ updated = 0, inserted = 0, deleted = 0, data = {}, err = {} }) {
    this.data = data
    this.err = err
    this.updated = updated
    this.inserted = inserted
    this.deleted = deleted
  }
}
