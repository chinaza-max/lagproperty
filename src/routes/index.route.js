import express from "express";
import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authRoute from "./auth.route.js";
import userRoute from "./user.route.js";
import adminRoute from "./admin.route.js";
import analyticsRoute from "./analytics.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Routes {
  constructor() {
    this.router = Router();
    this.routes();
  }
  //
  routes() {
    let rootAPI = "/api/v1";
    this.router.get("/").get(`${rootAPI}/`, (req, res) => {
      return res.status(200).json({
        status: 200,
        message: "Welcome To Lag Property  App API",
        data: {
          service: "Lag-Property",
          version: "1.0.0",
        },
      });
    });

    this.router.use(`${rootAPI}/auth`, authRoute);

    // Serve Postman Collection JSON file
    this.router.get("/postman-collection", (req, res) => {
      res.sendFile(path.join(__dirname, "../../docs/LagProperty_Postman_Collection.json"));
    });
    this.router.get(`${rootAPI}/postman-collection`, (req, res) => {
      res.sendFile(path.join(__dirname, "../../docs/LagProperty_Postman_Collection.json"));
    });
    this.router.get("/admin-postman-collection", (req, res) => {
      res.sendFile(path.join(__dirname, "../../docs/LagProperty_Admin_Postman_Collection.json"));
    });
    this.router.get(`${rootAPI}/admin-postman-collection`, (req, res) => {
      res.sendFile(path.join(__dirname, "../../docs/LagProperty_Admin_Postman_Collection.json"));
    });
    this.router.get("/download-postman", (req, res) => {
      res.download(
        path.join(__dirname, "../../docs/LagProperty_Postman_Collection.json"),
        "LagProperty_Postman_Collection.json"
      );
    });

    this.router.get("*", (req, res, next) => {
      const requestedPath = req.path;

      // Check if path ends with .html
      if (requestedPath.endsWith(".html")) {
        res.sendFile(
          path.join(__dirname, "../../public/lagproperty-admin", requestedPath),
          (err) => {
            if (err) {
              next(); // Pass to next handler if file not found
            }
          }
        );
      } else if (requestedPath === "/admin") {
        // Serve index.html for /admin route
        res.sendFile(
          path.join(__dirname, "../../public/lagproperty-admin", "index.html")
        );
      } else if (requestedPath.endsWith(".map")) {
        return;
      } else {
        next(); // Pass to next handler
      }
    });

    this.router.use(authMiddleware.validateUserToken);

    this.router.use(`${rootAPI}/user`, userRoute);
    this.router.use(`${rootAPI}/admin`, adminRoute);
    this.router.use(`${rootAPI}/analytics`, analyticsRoute);

    this.router.all("*", (req, res) => {
      res.status(404).json({
        status: 404,
        message: "Resource not found.",
      });
    });
  }
}

export default new Routes().router;
