
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
 *     summary: Verify Email or Telephone with a Verification Code
 *     description: Verifies the user's email or telephone number using a verification code. The request body also specifies the context (`validateFor`) and the type (`email`, `tel`, or `nin`).
 *     tags:
 *       - Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationCode
 *               - validateFor
 *               - type
 *             properties:
 *               verificationCode:
 *                 type: integer
 *                 description: The 6-digit verification code sent to the user.
 *                 example: 123456
 *               validateFor:
 *                 type: string
 *                 description: The context in which the validation is being done (e.g., list, rent, admin).
 *                 enum:
 *                   - list
 *                   - rent
 *                   - admin
 *                 example: "list"
 *               type:
 *                 type: string
 *                 description: Specifies whether the verification is for email, telephone, or NIN.
 *                 enum:
 *                   - email
 *                   - tel
 *                   - nin
 *                 example: "email"
 *     responses:
 *       200:
 *         description: Successfully verified the email or telephone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "12345"
 *                     verificationCode:
 *                       type: integer
 *                       example: 123456
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid verification code or type"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during verification"
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



/**
 * @swagger
 * /auth/validateBankAccount:
 *   post:
 *     summary: Validate bank account details
 *     description: Validates bank account details by checking the account number and bank code with an external API. Returns the validation result.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankCode:
 *                 type: string
 *                 description: The bank code for the bank account
 *                 example: "123456"
 *               accountNumber:
 *                 type: string
 *                 description: The account number to validate
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: Bank account validation successful
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
 *                   example: "Bank account validated successfully"
 *                 data:
 *                   type: object
 *                   description: The result of the validation
 *                   properties:
 *                     requestSuccessful:
 *                       type: boolean
 *                       description: Indicates if the validation request was successful
 *                       example: true
 *                     responseBody:
 *                       type: object
 *                       description: The response data from the validation API
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /auth/intializePayment:
 *   post:
 *     summary: Initializes a payment process for the user.
 *     tags:
 *       - Tenant API
 *     description: Endpoint to initialize a payment process. It validates the payment details and processes the transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionReference:
 *                 type: string
 *                 description: Unique reference for the payment transaction.
 *                 example: "abc123456789"
 *     responses:
 *       200:
 *         description: Payment initialized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "successful"
 *                 data:
 *                   type: object
 *                   description: Contains the details of the initialized payment.
 *                   example: {
 *                     transactionId: "tx_123456",
 *                     amount: 1000,
 *                     currency: "USD"
 *                   }
 *       400:
 *         description: Bad request, validation error for missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid transaction reference"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the payment"
 */




/**
 * @swagger
 * /auth/getRegion:
 *   get:
 *     summary: Retrieve region preferences
 *     description: Fetches region preferences from the settings model.
 *     tags:
 *       - Region
 *     responses:
 *       200:
 *         description: Successfully retrieved region preferences.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "successful"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "North America"
 *       404:
 *         description: Settings not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Settings not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve region preferences"
 */


/**
 * @swagger
 * /auth/getMaritalStatus:
 *   get:
 *     summary: Retrieve marital status options.
 *     description: Fetches the marital status options stored in the system settings.
 *     responses:
 *       200:
 *         description: Successfully retrieved marital status options.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Single", "Married", "Divorced", "Widowed"]
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "NotFoundError"
 *                     message:
 *                       type: string
 *                       example: "Settings not found"
 */






/**
 * @swagger
 * /auth/getReligion:
 *   get:
 *     summary: Get the list of religions
 *     description: Fetches a list of religions from the system settings. If no religions are found, an error is thrown.
 *     responses:
 *       200:
 *         description: Successfully fetched the list of religions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "successful"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "Christianity"
 *       500:
 *         description: Internal Server Error, settings not found or database issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Settings not found"
 *                 error:
 *                   type: string
 *                   example: "SystemError"
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
    this.router.post("/validateBankAccount", this.validateBankAccount);
    this.router.get("/getRegion", this.getRegion);
    this.router.get("/getMaritalStatus", this.getMaritalStatus);
    this.router.get("/getReligion", this.getReligion);

    this.router.get("/pingme", this.pingme); 
    this.router.post("/intializePayment", this.intializePayment);
    

    this.router.post("/webHookMonify", this.validateMonnifyIP, this.validateTransactionHash, this.webHookCollectionMonify);
    this.router.post("/webHookMonifyRefund", this.validateMonnifyIP, this.validateTransactionHash, this.webHookMonifyRefund);
    this.router.post("/webHookMonifyDisbursement", this.validateMonnifyIP, this.validateTransactionHash, this.webHookMonifyDisbursement);

    this.router.post("/authorizeTransfer", /*this.validateMonnifyIP, this.validateTransactionHash,*/ this.authorizeTransfer);

  }
}

export default new AuthRoutes().router;
