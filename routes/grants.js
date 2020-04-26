const express = require('express')
const GrantService = require('../services/grants')

/**
 * @function grantsApi
 * manager of the routes and actions
 * that can be executed on the collection of grants
 * 
 * @param {Object} app express app
 * 
 */
const grantsApi = (app) => {
  const router = express.Router()
  const grantService = new GrantService()
  //route base
  app.use('/api/grants', router)

  /**
   * route to get basic info about grants collection
   * @param {number} since passed by req.query, index from where the information is extracted 
   * @param {number} limit passed by req.query, size of records to return 
   * 
   * @returns on success json { data,size,message }
   *          on error json {message}
   */
  router.get('/', async (req, res) => {
    const { since, limit } = req.query
    try {
      //get basic info about a range of records
      const grants = await grantService.getBasicInfoGrants(since, limit)
      //get size of the collection
      const size = await grantService.getSizeCollection()
      //response success
      return res.status(200).json({
        data: grants,
        size: size,
        message: 'Grants listed'
      })
    } catch (error) {
      //response error
      return res.status(500).json({
        message: 'Internal error'
      })
    }
  })

  /**
   * route to get details about grant
   * since your id
   * 
   * @param {String} idGrant passed by req.params,id of grant to get more details
   *   
   * @returns on success { data,message }
   *          on error { message }
   */
  router.get('/detail/:idGrant', async (req, res) => {
    const { idGrant } = req.params
    try {
      //get details about grant
      const grant = await grantService.getGrant(idGrant)
      //response success
      return res.status(200).json({
        data: grant,
        message: 'grant found'
      })
    } catch (error) {
      //response error
      return res.status(500).json({
        message: 'grant not found'
      })
    }
  })

  /**
   * route to update grant
   * since your id
   * 
   * @param {String} idGrant passed by req.params,id of grant to update
   * @param {Object} grant passed by req.body,fields to update
   *   
   * @returns on success { data,message }
   *          on error { message }
   */
  router.put('/:idGrant', async (req, res, next) => {
    const { idGrant } = req.params
    const { grant } = req.body
    try {
      //update grant
      const id = await grantService.updateGrant(idGrant, grant)
      //reponse success
      return res.status(200).json({
        data: id,
        message: 'grant updated'
      })
    } catch (error) {
      //reponse error
      return res.status(500).json({
        message: 'Grant not be updated'
      })
    }
  })
}

module.exports = grantsApi