//server/app.ts
export{}
require("dotenv").config({ path: "./config.env" });

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const { connect, disconnect } = require('./data/db');
const router  = require('./routes/index');

class App {

    public app: any;
    

    constructor(){
        this.app = express()
        this.setupMiddlewares()
        // this.dbConnection()
        this.setRouting()
    }

    setupMiddlewares() {
        this.app.get('/', (req: any, res: any) => {
            res.send('Hello World!')
        })
        this.app.use(cors()); 
        this.app.use(express.json())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: false }))
    }

    async dbConnection(isTest: boolean = false){
        await connect(isTest)
    }

    async close() {
        await disconnect(); // Disconnect from MongoDB
    }

    setRouting() {
        this.app.use(router)
    }
}

module.exports = new App()