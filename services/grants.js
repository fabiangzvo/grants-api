const MongoLib = require('../lib/mongo')

class GrantsService {
  constructor() {
    this.collection = 'grants'
    this.MongoDB = new MongoLib()
  }

  async getGrants(since, limit) {
    const query = { _id: 1, title: 1, dateDue: 1, agencyName: 1, image: 1, opportunityNumber: 1 }
    const grants = await this.MongoDB.getAll(this.collection, query, since, limit)
    return grants || []
  }

  async getGrant(id) {
    const grant = await this.MongoDB.get(this.collection, id)
    return grant || {}
  }

  async getSizeCollection() {
    const size = await this.MongoDB.getSize(this.collection)

    return size
  }

  async updateGrant(id, grant) {
    return await this.MongoDB.update(this.collection, id, grant)
  }

  async insertGrants(grants) {
    const grantses = await this.MongoDB.insertMany(this.collection, grants)
    return grantses
  }

}

module.exports = GrantsService