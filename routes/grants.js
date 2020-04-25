const express = require('express')
const GrantService = require('../services/grants')
const validationData = require('../utils/middleware/validationData');

/**
 * 
 * 
 * @param {Object} app express app
 */
const grantsApi = (app) => {
  const router = express.Router()

  app.use('/api/grants', router)

  const grantService = new GrantService()

  router.get('/', validationData, async (req, res, next) => {
    const { range } = req.query
    try {
      const grants = await grantService.getGrants(range)

      return res.status(200).json({
        data: grants,
        message: 'grants listed'
      })

    } catch (error) {
      next(error)
    }

  })

}

module.exports = grantsApi