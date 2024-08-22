import { Router } from "express";
import UserController from"../controllers/user/user.controller.js";
import uploadHandler from "../middlewares/upload.middleware.js";

class UserRoutes extends UserController {

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post("/createTask",uploadHandler.image.single('image'), this.createTask);
    this.router.post("/deleteTask", this.deleteTask);
    this.router.post("/submitTask",uploadHandler.image.single('image'), this.submitTask);
    this.router.post("/deleteSubmitTask", this.deleteSubmitTask);
    this.router.get("/getTask", this.getTask);
    this.router.get("/getResponse", this.getResponse);
    this.router.post("/acceptOrDeclineTask", this.acceptTask);
    this.router.get("/accountCount", this.accountCount);
    this.router.get("/whoIAm", this.whoIAm);
    this.router.get("/getMyChildren", this.getMyChildren);
    this.router.post("/asignTask", this.asignTask);
    this.router.post("/removeChild", this.removeChild);

  } 

}

export default new UserRoutes().router;
