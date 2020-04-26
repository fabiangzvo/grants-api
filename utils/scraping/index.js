const puppeteer = require('puppeteer')
/**
 * @function getId
 * this function get the id of a grant from a regular expression
 * 
 * @param {String} str string that contain grant id
 * 
 * @returns {Object}
 */
const getId = (str) => {
  //search the id in the string
  const array = str.match(/[0-9]*/g)
  //clean array to get only id
  array.filter(item => item)

  return {
    id: array.join('')
  }
}
/**
 * @function getDates
 * get a date from a selector,
 * in case of error the optional selector
 * is used and validated with the key text
 * 
 * @param {Object} page current page of puppeteer
 * @param {String} selector selector css to get the text
 * @param {String} optionalSelector optional selector css to get the text on error case
 * @param {String} validation text key to validate
 * 
 * @returns {String | null}
 */
const getDates = async (page, selector, optionalSelector, validation) => {
  return await page.evaluate(
    (selector, optionalSelector, validation) => {
      try {
        //get text from span
        return document.querySelector(selector).textContent
      } catch (error) {
        //get all posibles fields
        elements = document.querySelectorAll(optionalSelector)
        //the elements obtained are destructured and mapped
        let items = [...elements].map(
          //check all posibles values and return the text or null
          item => (item.cells[0].innerText == validation) ? item.cells[1].innerText : null
        )
        //clean all nulls values and return only the text
        return items.filter(text => text).join('')
      }
      //valriables to pass at the function evaluate
    }, selector, optionalSelector, validation)
}
/**
 * @function generalInformation
 * get data of general about grant from
 * the selectors and position are ubicated 
 * 
 * @param {Object} page current page of puppeteer
 * @param {String} selector selector css to get the text
 * @param {String} optionalSelector optional selector css to get the text on error case
 * @param {Number} position number of position of item
 * 
 * @returns {String | null}
 */
const generalInformation = async (page, selector, optionaSelector, position) => {
  return await page.$eval(`${selector} > table > tbody > tr:nth-child(${position}) > td > span`,
    element => element.innerText)
    .catch(e => page.$eval(`${optionaSelector} > table > tbody > tr:nth-child(${position}) > td > span`,
      element => element.innerText))
}

/**
 * @function searchValueFromText
 * get a value from a selector checking the key text,
 * in case of error the optional selector is used
 * 
 * @param {Object} page current page of puppeteer
 * @param {String} selector selector css to get the text
 * @param {String} optionalSelector optional selector css to get the text on error case
 * @param {String} validation text key to validate 
 * @param {String} optionalValidation optional text key to validate 
 * 
 * @returns {String}
 */
const searchValueFromText = async (page, selector, optionalSelector, validation, optionalValidation) => {
  return await page.evaluate(
    (selector, optionalSelector, validation, optionalValidation) => {
      //get all elements that match with the selector
      let elements = document.querySelectorAll(selector)
      //check if elements were not obtained
      if (!elements) {
        //execute the optional selector to get elements
        elements = document.querySelectorAll(optionalSelector)
      }
      //the elements obtained are destructured and mapped
      let items = [...elements].map(
        //check all posibles values and return the text or null
        item => (item.cells[0].innerText == validation || item.cells[0].innerText == optionalValidation) ? item.cells[1].innerText : null
      )
      //clean the null value and cast the array to string
      return items.filter(text => text).join('')

    }, selector, optionalSelector, validation, optionalValidation)
}

/**
 * @function scraper
 * scraping all data posible about grants 
 * 
 * @returns {Array}
 */
const scraper = async () => {
  try {
    //launch new browser 
    browser = await puppeteer.launch()
    //open a new page
    page = await browser.newPage()
    //go to the url and wait until it is loaded to continue
    await page.goto(process.env.MAIN_URL, { waitUntil: 'networkidle0' })
    //select the frame that content all data about grants
    let frame = await page.$('iframe#embeddedIframe')

    let contentFrame = await frame.contentFrame()
    let array = []
    //iterate to get all ids of the grants
    for (var i = 0; i < 44; i++) {
      const items = await page.evaluate(() => {
        //select the iframe
        const embedded = document.querySelector('iframe#embeddedIframe');
        //get the elements obtained in the query and destructured to after mapped the results and return the attribute href
        return [...embedded.contentDocument.querySelectorAll('#searchResultsDiv > table > tbody > tr > td:first-child > a')].map(n => n.href)
      })
      //delete head and tail of results obtained because it's a nav
      items.shift()
      items.pop()
      //mapped all data obtained to get id of all grants
      let item_array = items.map(str => getId(str))
      //pass the data to higher scope
      array.push(...item_array)
      //make click on next page of results
      await contentFrame.click('#paginationTop > a:last-child')
      //wait for load the new results
      await contentFrame.waitFor('#searchResultsDiv > table')
    }
    let grants = []
    //iterate all ids if grants obtained
    for (const item of array) {
      //go to the url and wait until it is loaded to continue
      await page.goto(process.env.DETAIL_URL + item.id, { waitUntil: 'networkidle0' })
      //wait for load the expected results
      await page.waitFor('#synopsisDetailsGeneralInfoTableLeft')
      //grant data
      const opportunityNumber = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 2)
      const title = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 3)
      const category = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 7)
      const cfda = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 10)
      const matchingRequired = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 11)
      const postedDate = await getDates(page, '#forecastDetailsGeneralInfoTableRight > table > tbody > tr:nth-child(2) > td > span', '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', 'Posted Date:')
      const dateDue = await getDates(page, '#forecastDetailsGeneralInfoTableRight > table > tbody > tr:nth-child(5) > td > span', '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', 'Current Closing Date for Applications:')
      const totalFunding = await searchValueFromText(page, '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', '#forecastDetailsGeneralInfoTableRight > table > tbody > tr', 'Estimated Total Program Funding:')
      const awardCeiling = await searchValueFromText(page, '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', '#forecastDetailsGeneralInfoTableRight > table > tbody > tr', 'Award Ceiling:')
      const awardFloor = await searchValueFromText(page, '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', '#forecastDetailsGeneralInfoTableRight > table > tbody > tr', 'Award Floor:')
      const applicants = await generalInformation(page, '#synopsisDetailsEligibilityTable', '#forecastDetailsEligibilityTable', 1)
      const eligibilityapplicants = await generalInformation(page, '#synopsisDetailsEligibilityTable', '#forecastDetailsEligibilityTable', 1)
      const informationEligibility = await generalInformation(page, '#synopsisDetailsEligibilityTable', '#forecastDetailsEligibilityTable', 2)
      const image = await page.$eval('#topAgencyLogo > img', (element) => element.src)
      //agency data
      const agencyName = await page.$eval('#agencyNameHeading', (element) => element.innerText)
      const agencyDescription = await generalInformation(page, '#synopsisDetailsAdditionalInfoTable', '#forecastDetailsAdditionalInfoTable', 2)
      const agencyContact = await generalInformation(page, '#synopsisDetailsAdditionalInfoTable', '#forecastDetailsAdditionalInfoTable', 4)
      //convert data obtained on object and add into array
      grants.push({
        opportunityNumber,
        title,
        image,
        category,
        cfda,
        matchingRequired,
        postedDate,
        dateDue,
        totalFunding,
        awardCeiling,
        awardFloor,
        applicants,
        eligibilityapplicants,
        informationEligibility,
        agencyName,
        agencyDescription,
        agencyContact
      })
    }
    //wait for end all process and close the browser
    await browser.close()

    return grants
  } catch (error) {
    return []
  }
}

module.exports = scraper
