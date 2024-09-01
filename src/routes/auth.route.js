import { Router } from"express";
import AuthController from "../controllers/auth/auth.controller.js";
import uploadHandler from "../middlewares/upload.middleware.js";

class AuthRoutes extends AuthController {
  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  routes() {

    this.router.post("/registerUser", this.signupUser);
    this.router.post("/verifyEmailorTel", this.verifyEmailorTel);
    this.router.post("/sendVerificationCodeEmailOrTel", this.sendVerificationCodeEmailOrTel);
    this.router.post("/loginUser", this.loginUser);
    this.router.post("/sendPasswordResetLink", this.sendPasswordResetLink);
    this.router.post("/resetPassword", this.resetPassword);
    this.router.post("/initiatePayment", this.initiatePayment);


    this.router.post("/webHookMonify",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.webHookMonify);
    this.router.post("/webHookMonifyRefund",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.webHookMonifyRefund);

  }
}

export default new AuthRoutes().router;
