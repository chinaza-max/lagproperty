import express from 'express';
import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Routes {

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes(){
    let rootAPI = "/api/v1";
    this.router.get("/").get(`${rootAPI}/`, (req , res) => {
      return res.status(200).json({                                                                                                                                      
        status: 200,
        message: "Welcome to giggle  App API",
        data: {
          service: "LAGProperty",
          version: "1.0.0",
        },
      });
    });
 

    
    this.router.use(`${rootAPI}/auth`, authRoute)



    this.router.get("/admin", (req, res) => {

      console.log("dddddddddd")
      console.log("dddddddddd")
      console.log("dddddddddd")


      

      try {
        console.log("ssssssssssssssss")
        res.sendFile(path.join(__dirname, '../../public/lagproperty-admin', 'index.html'));
        //res.sendFile(path.join(__dirname, 'public', 'lagproperty-admin', 'index.html'));
      } catch (error) {
        console.log("qqqqqqqqqqqqqqqqqqqq")
        console.log("qqqqqqqqqqqqqqqqqqqq")
        console.log("qqqqqqqqqqqqqqqqqqqq")

        console.log(error);
        res.status(500).send('Error serving file');
      }
    });

   
       
    this.router.use(authMiddleware.validateUserToken);

    this.router.use(`${rootAPI}/user`, userRoute)
    
  

    this.router.all("*", (req, res) => {
      res.status(404).json({  
        status: 404,
        message: 'Resource not found.',
      });

    });
  }
}

export default new Routes().router;
