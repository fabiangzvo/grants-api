const GrantService = require('../../services/grants')

const validationData = async (req, res, next) => {
  try {


    const grantService = new GrantService()

    const size = await grantService.getSizeCollections()

    if (size < 1) {

    }

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = validationData