const MongoLib = require('../lib/mongo')

class GrantsService {
  constructor() {
    this.collection = 'grants'
    this.MongoDB = new MongoLib()
  }

  async getGrants({ start, end }) {
    const query = { name: { $gte: start, $lte: end } }
    const grants = await this.MongoDB.getAll(this.collection, query)

    return grants || []
  }

  async getSizeCollections() {
    const size = await this.MongoDB.getSize(this.collection)

    return size
  }
}

module.exports = GrantsService