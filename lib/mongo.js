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

  connect() {
    if (!MongoLib.connection) {
      MongoLib.connection = new Promise((resolve, reject) => {
        this.client.connect(err => {
          if (err) {
            reject(err)
          }

          console.log('Connected succesfully to mongo');
          resolve(this.client.db(this.dbName))
        });
      });
    }

    return MongoLib.connection;
  }

  getSize(collection) {
    return this.connect().then(db => {
      return db
        .collection(collection)
        .countDocuments()
    });
  }

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

  get(collection, id) {
    return this.connect().then(db => {
      return db.collection(collection).findOne({ _id: ObjectId(id) })
    });
  }

  create(collection, data) {
    return this.connect()
      .then(db => {
        return db.collection(collection).insertOne(data)
      })
      .then(result => result.insertedId)
  }

  update(collection, id, data) {
    return this.connect()
      .then(db => {
        return db
          .collection(collection)
          .updateOne({ _id: ObjectId(id) }, { $set: data }, { upsert: true })
      })
      .then(result => result.upsertedId || id)
  }

  delete(collection, id) {
    return this.connect()
      .then(db => {
        return db.collection(collection).deleteOne({ _id: ObjectId(id) })
      })
      .then(() => id)
  }

  insertMany(collection, list) {
    return this.connect()
      .then(db => {
        return db.collection(collection).insertMany(list)
      })
      .then((result) => result)
  }
}

module.exports = MongoLib
