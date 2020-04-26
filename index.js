const express = require('express')
const cors = require('cors')
const grantsApi = require('./routes/grants')
const validationData = require('./utils/validationData')

const { config } = require('./config/index')

//create application
const app = express()
//config middlewares
app.use(express.json())
app.use(cors())
//check the data in mongo and in case you don't have run the scraping
validationData()
//routes to grants 
grantsApi(app)
//set port at server and execute function when server are running
app.listen(config.port, () => {
  console.log(`Server listening at http://localhost:${config.port}`)
})
