const express = require('express')
const GrantService = require('../services/grants')

/**
 * 
 * 
 * @param {Object} app express app
 */
const grantsApi = (app) => {
  const router = express.Router()

  app.use('/api/grants', router)

  const grantService = new GrantService()

  router.get('/', async (req, res, next) => {
    const { since, limit } = req.query

    try {

      const grants = await grantService.getGrants(since, limit)
      const size = await grantService.getSizeCollection()

      return res.status(200).json({
        data: grants,
        size: size,
        message: 'grants listed'
      })

    } catch (error) {
      next(error)
    }

  })

  router.get('/detail/:idGrant', async (req, res, next) => {
    const { idGrant } = req.params
    try {

      const grant = await grantService.getGrant(idGrant)

      return res.status(200).json({
        data: grant,
        message: 'grant listed'
      })

    } catch (error) {
      next(error)
    }
  })
  router.put('/:idGrant', async (req, res, next) => {
    const { idGrant } = req.params
    const { grant } = req.body

    try {

      const id = await grantService.updateGrant(idGrant, grant)

      return res.status(200).json({
        data: id,
        message: 'grant listed'
      })

    } catch (error) {
      next(error)
    }
  })

}

module.exports = grantsApi