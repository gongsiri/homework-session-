const { Pool } = require("pg")
require("dotenv").config()

const connectPostgres = async () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT
    })

    return pool
}

module.exports = connectPostgres
