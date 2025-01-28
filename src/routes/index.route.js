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
        message: "Welcome To Lag Property  App API",
        data: { 
          service: "Lag-Property",
          version: "1.0.0",
        },
      });
    });
 

    
    this.router.use(`${rootAPI}/auth`, authRoute)

    this.router.get('*', (req, res, next) => {
      const requestedPath = req.path;


      // Check if path ends with .html
      if (requestedPath.endsWith('.html')) {
        res.sendFile(path.join(__dirname, '../../public/lagproperty-admin', requestedPath), (err) => {
          if (err) {
            next(); // Pass to next handler if file not found
          }
        });
      } else if (requestedPath === '/admin') {
        // Serve index.html for /admin route
        res.sendFile(path.join(__dirname, '../../public/lagproperty-admin', 'index.html'));
      } 
      else if(requestedPath.endsWith('.map')){
          return
      }
      else {
        next(); // Pass to next handler
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
