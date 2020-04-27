const MongoLib = require('../lib/mongo')
/**
 * @class GrantsService
 * 
 * class in charge of invoking the methods
 * required to interact with the database
 * 
 */
class GrantsService {
  constructor() {
    this.collection = 'grants'
    this.MongoDB = new MongoLib()
  }
  /**
   * @function getGrants
   * function in charge of obtaining all grants.
   * 
   * @returns {Array}
   */
  async getGrants() {
    //get a part of all record
    const grants = await this.MongoDB.getAll(this.collection, query)

    return grants || []
  }

  /**
   * @function getSizeCollection
   * get size of the collection
   * 
   * @returns {Number}
   */
  async getSizeCollection() {
    //get size of collection
    return await this.MongoDB.getSize(this.collection)
  }

  /**
   * @function updateGrant
   * update grant since your id
   * 
   * @param {String} id id of grant to update
   * @param {Object} grant fields to update
   * 
   * @returns {String}
   */
  async updateGrant(id, grant) {
    return await this.MongoDB.update(this.collection, id, grant)
  }

  /**
   * @function insertGrants
   * create record of many grants
   * 
   * @param {Array} grants list of grants to insert
   * 
   * @returns {Object}
   */
  async insertGrants(grants) {
    return await this.MongoDB.insertMany(this.collection, grants)
  }

}

module.exports = GrantsService