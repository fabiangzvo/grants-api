const GrantService = require('../services/grants')
const scraper = require('./scraping/index')

/**
 * Function validationData
 * 
 * Verify that there are records in the database,
 * if doesn't have, the scraping script is run
 * to populate the database
 * 
 */
const validationData = async () => {
  try {
    const grantService = new GrantService()
    //get size of collection 
    const sizeOfCollection = await grantService.getSizeCollection()
    //check if there is data in the database
    if (sizeOfCollection < 1) {
      console.log('execute scrapper')
      //execute script of scraping
      const grants = await scraper()
      //inserts all the data obtained from the scraping into the database
      await grantService.insertGrants(grants)
    }
    return
  } catch (error) {
    throw (error)
  }
}

module.exports = validationData