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
   * @function getBasicInfoGrants
   * function in charge of obtaining a quantity
   * of data from a limit number and an index.
   * 
   * the following fields are retrieved from the data:
   * {_id,title,dataDue, agencyName, image}
   * 
   * @param {Number} since index from where data is obtained 
   * @param {Number} limit límite de número de datos para obtener
   * 
   * @returns {Array}
   */
  async getBasicInfoGrants(since, limit) {
    //fields to get
    const query = { _id: 1, title: 1, dateDue: 1, agencyName: 1, image: 1 }
    //get a part of all record
    const grants = await this.MongoDB.getAll(this.collection, query, since, limit)

    return grants || []
  }
  /**
   * @function getGrant
   * get full details of a grant since your id
   * 
   * @param {string} id_grant id of grant to get full details
   * 
   * @returns {Object}
   */
  async getGrant(id_grant) {
    //get details about grant
    const grant = await this.MongoDB.get(this.collection, id_grant)
    return grant || {}
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