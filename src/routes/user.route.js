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

    this.router.post("/updateProfile",uploadHandler.image.single('image'), this.updateProfile);
    this.router.post("/listBuilding",uploadHandler.image.fields([
      { name: 'bedroomSizeImage', maxCount: 1 }, 
      { name: 'kitchenSizeImage', maxCount: 1 },  
      { name: 'livingRoomSizeImage', maxCount: 1 }, 
      { name: 'diningAreaSizeImage', maxCount: 1 },
      { name: 'propertyTerms', maxCount: 1 },
    ]), this.listBuilding);


    this.router.post("/inspectionAction", this.inspectionAction);
    this.router.post("/chat",uploadHandler.image.single('image'), this.chat);
    this.router.get("/getMyProperty", this.getMyProperty);
    this.router.post("/quitNoticeAction", this.quitNoticeAction);
    this.router.post("/reviewTenant", this.reviewTenant);
    this.router.get("/getALLreviewTenant", this.getALLreviewTenant);
    this.router.get("/getTenantsWithDueRent", this.getTenantsWithDueRent);
    this.router.get("/getUpcomingInspection", this.getUpcomingInspection);
    this.router.get("/getBuildings", this.getBuildings);
    this.router.get("/getBuildingDetails", this.getBuildingDetails);
    this.router.get("/getChat", this.getChat);
    this.router.get("/getTransaction", this.getTransaction);
    this.router.get("/getTransactionRefund", this.getTransactionRefund);
    this.router.get("/getInspectionDetails", this.getInspectionDetails);



    

    this.router.get("/whoIAm", this.whoIAm);
    

  } 

}

export default new UserRoutes().router;
