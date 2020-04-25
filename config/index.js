require('dotenv').config()

const config = {
  port: process.env.PORT || 3000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  db_name: process.env.DB_NAME,
  host: process.env.DB_HOST
}

module.exports = { config }