const express = require('express')
const cors = require('cors')

const { config } = require('./config/index')

//create application
const app = express()

app.use(cors())

app.listen(config.port, () => {
  console.log(`Server listening at http://localhost:${config.port}`)
})
