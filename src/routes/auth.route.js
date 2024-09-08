
/**
 * @swagger
 * /auth/registerUser:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *                 example: John
 *                 required: true
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *                 example: Doe
 *                 required: true
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: john.doe@example.com
 *                 required: true
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: password123
 *                 required: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The user's profile image
 *                 required: true
 *               type:
 *                 type: string
 *                 description: Type of user, either rent or list
 *                 enum: ["rent", "list"]  
 *                 example: rent
 *                 required: true
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/verifyEmailorTel:
 *   post:
 *     summary: Verify a user's email or telephone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 description: The ID of the user to be verified
 *                 example: 123
 *                 required: true
 *               validateFor:
 *                 type: string
 *                 description: Validation context, either rent or list
 *                 enum: ["rent", "list"]
 *                 example: rent
 *                 required: true
 *               verificationCode:
 *                 type: number
 *                 description: The verification code sent to the user
 *                 example: 456789
 *                 required: true
 *               type:
 *                 type: string
 *                 description: Specifies whether the verification is for email or telephone
 *                 enum: ["email", "tel"]
 *                 example: email
 *                 required: true
 *     responses:
 *       200:
 *         description: Email or telephone verified successfully
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /auth/sendVerificationCodeEmailOrTel:
 *   post:
 *     summary: Send a verification code to email or telephone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 description: The ID of the user to send the verification code to
 *                 example: 123
 *                 required: true
 *               validateFor:
 *                 type: string
 *                 description: Validation context, either rent or list
 *                 enum: ["rent", "list"]
 *                 example: rent
 *                 required: true
 *               type:
 *                 type: string
 *                 description: Specifies the type of contact method for sending the code (e.g., email or tel)
 *                 example: email
 *                 required: true
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /auth/loginUser:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user based on email address and password. Differentiates between user types (`list` or `rent`) and checks email validity and account status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: "userpassword123"
 *                 required: true
 *               type:
 *                 type: string
 *                 description: The type of user (e.g., `rent` or `list`)
 *                 enum: ["rent", "list"]
 *                 example: "list"
 *                 required: true
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: The user's email address
 *                 example: "user@example.com"
 *                 required: true
 *     responses:
 *       200:
 *         description: Login successful, returns user information or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: The authenticated user object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The user ID
 *                     emailAddress:
 *                       type: string
 *                       format: email
 *                       description: The user's email address
 *                     type:
 *                       type: string
 *                       description: The type of user
 *                 status:
 *                   type: string
 *                   description: Status of the login attempt, such as `disabled` if the account is disabled
 *                   example: "disabled"
 *       400:
 *         description: Bad request, validation error
 *       401:
 *         description: Unauthorized, invalid credentials
 *       404:
 *         description: Not found, user not found
 *       500:
 *         description: Internal server error
 */




/**
 * @swagger
 * /auth/sendPasswordResetLink:
 *   post:
 *     summary: Send a password reset link
 *     description: Sends a password reset link to the user’s email address or phone number. Initiates the password reset process.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 description: The email address or phone number of the user requesting a password reset
 *                 example: "user@example.com"  # or "1234567890"
 *                 required: true
 *               type:
 *                 type: string
 *                 description: The type of user (e.g., `rent`, `list`, or `admin`)
 *                 enum: ["rent", "list", "admin"]
 *                 example: "rent"
 *                 required: true
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "A reset link was sent to your email"
 *       400:
 *         description: Bad request, validation error
 *       404:
 *         description: Not found, user not found or invalid request
 *       500:
 *         description: Internal server error
 */




/**
 * @swagger
 * /resetPassword:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user’s password using the provided reset password key and new password. The reset key is typically sent via email or SMS.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password for the user
 *                 example: "newpassword123"
 *                 minLength: 6
 *                 required: true
 *               resetPasswordKey:
 *                 type: string
 *                 description: The reset password key used to verify the reset request
 *                 example: "resetKey123456"
 *                 minLength: 1
 *                 required: true
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Password updated successfully"
 *       400:
 *         description: Bad request, validation error
 *       404:
 *         description: Not found, invalid reset key or user
 *       500:
 *         description: Internal server error
 */



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
    

    this.router.post("/webHookMonify",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.webHookCollectionMonify);
    this.router.post("/webHookMonifyRefund",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.webHookMonifyRefund);
    this.router.post("/webHookMonifyDisbursement",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.webHookMonifyDisbursement);

    this.router.post("/authorizeTransfer",/* this.validateMonnifyIP, this.validateTransactionHash,*/ this.authorizeTransfer);


  }
}

export default new AuthRoutes().router;
