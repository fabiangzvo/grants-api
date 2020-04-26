const puppeteer = require('puppeteer')
/**
 * Function formatItem
 * this function separate a item by regular expression and 
 * these result 
 * @param {String} str string to be splitted and fromatted
 */
const formatItem = (str) => {
  const array = str.match(/[0-9]*/g)
  array.filter(item => item)
  return {
    id: array.join('')
  }
}
const getDates = async (page, selector, optionalSelector, validation) => {
  return await page.evaluate(
    (selector, optionalSelector, validation) => {
      try {
        return document.querySelector(optionalSelector).textContent
      } catch (error) {
        elements = document.querySelectorAll(selector)

        let items = [...elements].map(
          item => (item.cells[0].innerText == validation) ? item.cells[1].innerText : null
        )

        return items.filter(text => text).join('')
      }
    }, selector, optionalSelector, validation)
}

const generalInformation = async (page, selector, optionaSelector, position) => {
  return await page.$eval(`${selector} > table > tbody > tr:nth-child(${position}) > td > span`,
    element => element.innerText)
    .catch(e => page.$eval(`${optionaSelector} > table > tbody > tr:nth-child(${position}) > td > span`,
      element => element.innerText))
}

const searchValueFromText = async (page, selector, optionalSelector, validation, optionalValidation) => {
  return await page.evaluate(
    (selector, optionalSelector, validation, optionalValidation) => {
      let elements = document.querySelectorAll(selector)
      if (!elements) {
        elements = document.querySelectorAll(optionalSelector)
      }

      let items = [...elements].map(
        item => (item.cells[0].innerText == validation || item.cells[0].innerText == optionalValidation) ? item.cells[1].innerText : null
      )

      return items.filter(text => text).join('')

    }, selector, optionalSelector, validation, optionalValidation)
}

const scraper = async () => {
  try {
    browser = await puppeteer.launch()

    page = await browser.newPage()

    await page.goto('https://www.grants.gov/web/grants/search-grants.html', { waitUntil: 'networkidle0' })

    let frame = await page.$('iframe#embeddedIframe')
    let contentFrame = await frame.contentFrame()
    let array = []

    for (var i = 0; i < 44; i++) {
      const items = await page.evaluate(() => {

        const embedded = document.querySelector('iframe#embeddedIframe');

        return [...embedded.contentDocument.querySelectorAll('#searchResultsDiv > table > tbody > tr > td:first-child > a')].map(n => n.href)
      })

      items.shift()
      items.pop()

      let item_array = items.map(str => formatItem(str))

      array.push(...item_array)

      await contentFrame.click('#paginationTop > a:last-child')

      await contentFrame.waitFor('#searchResultsDiv > table')
    }

    let grants = []

    for (const item of array) {
      await page.goto(`https://www.grants.gov/custom/viewOppDetails.jsp?oppId=${item.id}`, { waitUntil: 'networkidle0' })

      await page.waitFor('#synopsisDetailsGeneralInfoTableLeft')
      //grant data
      const opportunityNumber = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 2)
      const title = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 3)
      const category = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 7)
      const cfda = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 10)
      const matchingRequired = await generalInformation(page, '#synopsisDetailsGeneralInfoTableLeft', '#forecastDetailsGeneralInfoTableLeft', 11)
      const postedDate = await getDates(page, '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', '#forecastDetailsGeneralInfoTableRight > table > tbody > tr:nth-child(2) > td > span', 'Posted Date:')
      const dateDue = await getDates(page, '#synopsisDetailsGeneralInfoTableRight > table > tbody > tr', '#forecastDetailsGeneralInfoTableRight > table > tbody > tr:nth-child(5) > td > span', 'Current Closing Date for Applications:')
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

    await browser.close()

    return grants
  } catch (error) {
    console.log(error.stack)
  }
}

module.exports = scraper
