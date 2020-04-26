const { MongoClient, ObjectId } = require('mongodb')
const { config } = require('../config')
//get info to connect with database
const USER = config.user
const PASSWORD = config.password
const DB_NAME = config.db_name
const HOST = config.host
//set mongodb uri connect with the cluster
const MONGO_URI = `mongodb+srv://${USER}:${PASSWORD}@${HOST}/${DB_NAME}?retryWrites=true&w=majority`;

/**
 * Class mongoLib
 * 
 * this class is responsible for connecting the API
 * with the mongodb cluster as well as providing
 * the basic crud methods.
 */
class MongoLib {
  constructor() {
    this.client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    this.dbName = DB_NAME;
  }
  /**
   * @function connect
   * mount connection with database
   * 
   * @returns { Object} connection
   */
  connect() {
    //check if connection already exists
    if (!MongoLib.connection) {
      //wait for connection
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect(err => {
          if (err) {
            reject(err)
          }

          console.log('Connected succesfully to mongo');
          //set name of database
          resolve(this.client.db(this.dbName))
        });
      });
    }
    return MongoLib.connection;
  }
  /**
   * @function getSize
   * get size of collection since your name
   * 
   * @param {String} collection name of collection to get size 
   * 
   * @returns {Number} size of collection
   */
  getSize(collection) {
    //await for connection
    return this.connect().then(db => {
      return db
        .collection(collection)
        .countDocuments()
    });
  }

  /**
   * @function getAll
   * function in charge of obtaining a quantity
   * of data from a limit number and an index of any collection
   * 
   * @param {String} collection collection execute the query
   * @param {Object} query fields to get
   * @param {Number} since position of the index from where the data is obtained
   * @param {Number} limit number of records to return
   * 
   * @returns {Array}
   */
  getAll(collection, query, since, limit) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .find({})
        .project(query)
        .sort({ postedDate: 1 })
        .skip(parseInt(since))
        .limit(parseInt(limit))
        .toArray()
    });
  }

  /**
   * @function get
   * get full details of a collection item since your id
   * 
   * @param {string} id_grant id of item to get full details
   * 
   * @returns {Object}
   */
  get(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: ObjectId(id) })
    });
  }

  /**
   * @function update
   * update a record of collection since your id
   * 
   * @param {String} id id of collection item to update
   * @param {Object} data fields to update
   * 
   * @returns {String}
   */
  update(collection, id, data) {
    return this.connect()
      .then(db => {
        return db
          .collection(collection)
          .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true })
      })
      .then(result => result.upsertedId || id)
  }

  /**
   * @function delete
   * delete a record of collection since your id
   * 
   * @param {String} collection name of collection to execute query
   * @param {String} id id of item to delete
   */
  delete(collection, id) {
    return this.connect()
      .then(db => {
        return db.collection(collection).deleteOne({ _id: ObjectId(id) })
      })
      .then(() => id)
  }

  /**
   * @function insertMany
   * create records of many items to any collection
   * 
   * @param {String} collection name of collection to insert
   * @param {Array} list items of grants to insert
   * 
   * @returns {Object}
   */
  insertMany(collection, list) {
    return this.connect()
      .then(db => {
        return db.collection(collection).insertMany(list)
      })
      .then((result) => result)
  }
}

module.exports = MongoLib
