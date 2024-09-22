/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - BearerAuth: []
 */


/**
 * @swagger
 * /user/updateProfile:
 *   post:
 *     summary: Update landlord or agent profile
 *     description: Updates the user's profile with new information including personal details and an optional image. Differentiates based on user roles and includes additional fields for specific types  .
 *     tags:
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *                 example: "Doe"
 *               tel:
 *                 type: integer
 *                 description: The user's telephone number
 *                 example: 1234567890
 *               telCode:
 *                 type: string
 *                 description: The telephone code
 *                 example: "+1"
 *               lasrraId:
 *                 type: string
 *                 description: The LASRRA ID
 *                 example: "LASRRA12345"
 *               nin:
 *                 type: integer
 *                 description: The NIN (National Identification Number)
 *                 example: 1234567890
 *               country:
 *                 type: string
 *                 description: The user's country
 *                 example: "Nigeria"
 *               state:
 *                 type: string
 *                 description: The user's state
 *                 example: "Abuja"
 *               lga:
 *                 type: string
 *                 description: The Local Government Area
 *                 example: "Gwagwalada"
 *               image:
 *                 type: object
 *                 description: Image details if provided
 *                 properties:
 *                   size:
 *                     type: integer
 *                     description: Size of the uploaded image in bytes
 *                     example: 204800
 *               type:
 *                 type: string
 *                 description: Type of user or role
 *                 enum: ["landLord", "agent", "unset"]
 *                 example: "agent"
 *               agentBankCode:
 *                 type: string
 *                 description: The bank code for agents (required if type is 'agent')
 *                 example: "123456"
 *               agentBankAccount:
 *                 type: string
 *                 description: The bank account for agents (required if type is 'agent')
 *                 example: "0123456789"
 *               landlordBankCode:
 *                 type: string
 *                 description: The bank code for landlords
 *                 example: "654321"
 *               landlordBankAccount:
 *                 type: string
 *                 description: The bank account for landlords
 *                 example: "9876543210"
 *               companyName:
 *                 type: string
 *                 description: The name of the company (if applicable)
 *                 example: "Landlord Inc."
 *               agentRegistrationNO:
 *                 type: string
 *                 description: The registration number for agents
 *                 example: "AG123456"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Updated successfully"
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */



/**
 * @swagger
 * /user/listBuilding:
 *   post:
 *     summary: List a building with multiple images
 *     description: Allows property managers to list a building by providing property details and uploading multiple images related to the building's different areas.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               propertyPreference:
 *                 type: string
 *                 description: Type of property
 *                 example: 'flats'
 *               propertyLocation:
 *                 type: string
 *                 description: Location of the property
 *                 example: 'Downtown'
 *               city:
 *                 type: string
 *                 description: City where the property is located
 *                 example: 'New York'
 *               address:
 *                 type: string
 *                 description: Full address of the property
 *                 example: '123 Main St'
 *               lat:
 *                 type: string
 *                 description: Latitude of the property location
 *                 example: '40.712776'
 *               lng:
 *                 type: string
 *                 description: Longitude of the property location
 *                 example: '-74.005974'
 *               numberOfFloors:
 *                 type: integer
 *                 description: Number of floors in the property
 *                 example: 3
 *               numberOfRooms:
 *                 type: integer
 *                 description: Number of rooms in the property
 *                 example: 5
 *               amenity:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Amenities available in the property
 *                 example: ['WiFi', 'Pool']
 *               roomPreference:
 *                 type: string
 *                 description: Preferred room type
 *                 example: 'suite'
 *               availability:
 *                 type: string
 *                 description: Availability status of the property
 *                 example: 'vacant'
 *               furnishingStatus:
 *                 type: string
 *                 description: Furnishing status of the property
 *                 example: 'furnished'
 *               rentalDuration:
 *                 type: string
 *                 description: Duration for which the property is available for rent
 *                 example: '12 months'
 *               price:
 *                 type: integer
 *                 description: Rental price of the property
 *                 example: 1500
 *               electricityBill:
 *                 type: integer
 *                 description: Monthly electricity bill for the property
 *                 example: 100
 *               wasteBill:
 *                 type: integer
 *                 description: Monthly waste bill for the property
 *                 example: 50
 *               commissionBill:
 *                 type: integer
 *                 description: Commission bill for the property
 *                 example: 200
 *               propertyDescription:
 *                 type: string
 *                 description: Additional description of the property
 *                 example: 'Spacious and modern apartment with a great view'
 *               bedroomSizeLength:
 *                 type: integer
 *                 description: Length of the bedroom
 *                 example: 15
 *               bedroomSizeWidth:
 *                 type: integer
 *                 description: Width of the bedroom
 *                 example: 12
 *               bedroomSizeImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image 
 *               kitchenSizeLength:
 *                 type: integer
 *                 description: Length of the kitchen
 *                 example: 10
 *               kitchenSizeWidth:
 *                 type: integer
 *                 description: Width of the kitchen
 *                 example: 8
 *               kitchenSizeImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image 
 *               livingRoomSizeLength:
 *                 type: integer
 *                 description: Length of the living room
 *                 example: 20
 *               livingRoomSizeWidth:
 *                 type: integer
 *                 description: Width of the living room
 *                 example: 15
 *               livingRoomSizeImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image 
 *               diningAreaSizeLength:
 *                 type: integer
 *                 description: Length of the dining area
 *                 example: 12
 *               diningAreaSizeWidth:
 *                 type: integer
 *                 description: Width of the dining area
 *                 example: 10
 *               diningAreaSizeImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload an image 
 *               propertyTerms:
 *                 type: string
 *                 format: binary
 *                 description: PDF of the property terms document
 *     responses:
 *       200:
 *         description: Building listed successfully
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
 *                   example: "Building listed successfully"
 *       400:
 *         description: Bad request, validation error
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /user/inspectionAction:
 *   post:
 *     summary: Handles various inspection-related actions.
 *     description: Perform actions related to inspections based on the provided action type. Actions include creating inspections, accepting, rejecting, and managing inspections.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Inspections
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: 
 *                   - getNotCreatedInspection
 *                   - getPendingInspection
 *                   - getDeclineInspection
 *                   - getAcceptedInspection
 *                   - createInspection
 *                   - refund
 *                   - acceptInspection
 *                   - declineInspection
 *                   - acceptTenant
 *                   - rejectTenant
 *                   - releaseFund
 *                   - rejectBuilding
 *                   - escrowBalance
 *                 description: Type of inspection action to perform.
 *                 example: "createInspection"
 *               pageSize:
 *                 type: integer
 *                 description: Number of records to retrieve (required for certain actions).
 *                 example: 10
 *                 minimum: 1
 *                 nullable: true
 *               page:
 *                 type: integer
 *                 description: Page number to retrieve (required for certain actions).
 *                 example: 1
 *                 minimum: 1
 *                 nullable: true
 *               inspectionMode:
 *                 type: string
 *                 enum: [inPerson, videoChat]
 *                 description: Mode of inspection (required for 'createInspection').
 *                 example: "inPerson"
 *                 nullable: true
 *               fullDate:
 *                 type: string
 *                 format: date
 *                 description: Date of the inspection (required for 'createInspection').
 *                 example: "2024-09-08 14:35:20"
 *                 nullable: true
 *               inspectionStatus:
 *                 type: string
 *                 enum: [pending, accepted, decline, notCreated]
 *                 description: Inspection status (required for 'updateInspection').
 *                 nullable: true
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: Email address of the person related to the inspection (required for 'createInspection').
 *                 example: "example@domain.com"
 *                 nullable: true
 *               tel:
 *                 type: string
 *                 description: Phone number of the person involved in the inspection (required for 'createInspection').
 *                 example: "08012345678"
 *                 nullable: true
 *               fullName:
 *                 type: string
 *                 description: Full name of the person involved in the inspection (required for 'createInspection').
 *                 example: "John Doe"
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 description: Gender of the person involved in the inspection (required for 'createInspection').
 *                 example: "Male"
 *                 nullable: true
 *               note:
 *                 type: string
 *                 description: Optional note for the inspection (used for 'createInspection' or 'declineInspection').
 *                 example: "The tenant has requested a time change."
 *                 nullable: true
 *               inspectionId:
 *                 type: integer
 *                 description: ID of the inspection (required for certain actions like 'acceptInspection', 'declineInspection', 'createInspection').
 *                 example: 456
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Action performed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Action processed successfully.
 *                 data:
 *                   type: object
 *                   description: Additional data about the action.
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request. Invalid fields or missing data.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error.
 */


/**
 * @swagger
 * /user/sendInvoce:
 *   post:
 *     summary: Send an invoice to users.
 *     description: Send an invoice to a list of users based on their user IDs and the role of the user sending the invoice.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIdList
 *             properties:
 *               userIdList:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   description: Array of user IDs to whom the invoice will be sent.
 *                 description: List of user IDs to send the invoice.
 *                 example: [456, 789, 101]
 *     responses:
 *       200:
 *         description: Invoice sent successfully.
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
 *                   example: "successfull"
 *                 data:
 *                   type: object
 *                   description: Response data after sending the invoice.
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid fields or missing data."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/chat:
 *   post:
 *     summary: Send a message (text or file) in chat.
 *     description: This endpoint allows users to send either a text message or an image file in a chat. The request should include the message type, and if it's a file, the file is uploaded along with the message.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - messageType
 *               - receiverId
 *             properties:
 *               messageType:
 *                 type: string
 *                 enum: [text, file]
 *                 description: Type of the message, either text or file.
 *                 example: "text"
 *               message:
 *                 type: string
 *                 description: The text message content, required if `messageType` is `text`.
 *                 example: "Hello!"
 *               receiverId:
 *                 type: integer
 *                 description: ID of the user receiving the message.
 *                 example: 789
 *               repliedMessageId:
 *                 type: integer
 *                 description: ID of the message that is being replied to (optional).
 *                 example: 123
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file, required if `messageType` is `file`. Must be less than 3MB in size.
 *     responses:
 *       200:
 *         description: Message sent successfully.
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
 *                   example: "updated successfully"
 *       400:
 *         description: Invalid request parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid fields or missing data."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/getMyProperty:
 *   get:
 *     summary: Retrieve user property information.
 *     description: This endpoint retrieves the list of properties for the current user. The user can specify the type of properties (all, vacant, or occupied) and pagination parameters.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Property
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, vacant, occupied]
 *         required: true
 *         description: The type of property to retrieve (all, vacant, or occupied).
 *         example: "all"
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         required: true
 *         description: The number of properties to retrieve per page.
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: The page number to retrieve.
 *         example: 1
 *     responses:
 *       200:
 *         description: Successful response with the list of properties.
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
 *                     type: object
 *                     properties:
 *                       propertyId:
 *                         type: integer
 *                         example: 123
 *                       address:
 *                         type: string
 *                         example: "123 Main Street"
 *                       status:
 *                         type: string
 *                         enum: [vacant, occupied]
 *                         example: "vacant"
 *                       rentAmount:
 *                         type: number
 *                         example: 1200
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */



/**
 * @swagger
 * /user/quitNoticeAction:
 *   post:
 *     summary: Manage quit notice actions (send, acknowledge, get, delete).
 *     description: This endpoint allows property managers to send, view, acknowledge, or delete a quit notice. Tenants can view or acknowledge quit notices.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Quit Notice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [send, acknowledged, get, delete]
 *                 description: The action to perform (send, get, acknowledge, delete).
 *                 example: "send"
 *               tenantId:
 *                 type: integer
 *                 description: The ID of the tenant (required for send and get actions).
 *                 example: 123
 *               quitNoticeId:
 *                 type: integer
 *                 description: The ID of the quit notice (required for acknowledge and delete actions).
 *                 example: 456
 *               noticeDate:
 *                 type: string
 *                 format: date
 *                 description: The date the notice was sent (required for send action).
 *                 example: "2024-09-05"
 *               quitDate:
 *                 type: string
 *                 format: date
 *                 description: The date the tenant is required to vacate the property (required for send action).
 *                 example: "2024-10-01"
 *               reason:
 *                 type: string
 *                 description: The reason for sending the quit notice (required for send action).
 *                 example: "Breach of contract"
 *     responses:
 *       200:
 *         description: Successfully processed the quit notice action.
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
 *                   example: "successfull"
 *       400:
 *         description: Bad request. Invalid parameters or action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid request parameters"
 *       403:
 *         description: Unauthorized. Tenant does not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tenant does not have this access"
 *       404:
 *         description: Quit notice not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Quit notice not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */



/**
 * @swagger
 * /user/reviewTenant:
 *   post:
 *     summary: Review a prospective tenant.
 *     description: Allows property managers to submit reviews for prospective tenants. Tenants are not allowed to perform this action.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Tenant Review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prospectiveTenantId:
 *                 type: integer
 *                 description: The ID of the prospective tenant being reviewed.
 *                 example: 456
 *               review:
 *                 type: string
 *                 description: The review text for the prospective tenant.
 *                 example: "The tenant has been prompt in communication and seems reliable."
 *     responses:
 *       200:
 *         description: Successfully submitted the tenant review.
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
 *                   example: "successfull"
 *       400:
 *         description: Bad request. Invalid parameters or role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tenant does not have this access"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */





/**
 * @swagger
 * /user/getALLreviewTenant:
 *   get:
 *     summary: Retrieve all reviews for a specific tenant.
 *     description: Fetches all reviews for a prospective tenant, including pagination support. The tenant's ID must be provided. Only users with the 'list' role can access this endpoint.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Tenant Review
 *     parameters:
 *       - in: query
 *         name: tenantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the tenant whose reviews are to be retrieved.
 *         example: 456
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: true
 *         description: The page number for pagination.
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: true
 *         description: The number of reviews per page for pagination.
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved all reviews for the specified tenant.
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
 *                   example: "successfull"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           propertyManagerId:
 *                             type: integer
 *                             example: 789
 *                           prospectiveTenantId:
 *                             type: integer
 *                             example: 456
 *                           review:
 *                             type: string
 *                             example: "The tenant has been prompt in communication and seems reliable."
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-09-01T10:00:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Bad request. Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid query parameters."
 *       404:
 *         description: Tenant not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tenant not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */



/**
 * @swagger
 * /user/getTenantsWithDueRent:
 *   get:
 *     summary: Get tenants with due or terminated rent.
 *     description: Fetch a list of tenants who have rent due or whose tenancy has been terminated. Supports pagination.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Tenants
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: false
 *         description: The number of records per page.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the property manager.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [list, rent]
 *         required: true
 *         description: The role of the user (e.g., 'list' or 'rent').
 *     responses:
 *       200:
 *         description: A list of tenants with due rent.
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
 *                 response:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Tenant ID.
 *                           fullName:
 *                             type: string
 *                             description: Full name of the tenant.
 *                           rentNextDueDate:
 *                             type: string
 *                             format: date
 *                             description: Date when the next rent is due.
 *                           status:
 *                             type: string
 *                             description: The status of the tenant (rentDue, terminated).
 *                           BuildingReview:
 *                             type: object
 *                             description: The building associated with the tenant.
 *                             properties:
 *                               buildingName:
 *                                 type: string
 *                                 description: Name of the building.
 *                               propertyManagerId:
 *                                 type: integer
 *                                 description: ID of the property manager.
 *                           rentalhistory:
 *                             type: object
 *                             description: Rental history of the tenant.
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           description: Total number of tenants found.
 *                         currentPage:
 *                           type: integer
 *                           description: The current page number.
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages.
 *                         pageSize:
 *                           type: integer
 *                           description: Number of records per page.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid or missing query parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/getUpcomingInspection:
 *   get:
 *     summary: Get upcoming inspections for a property manager.
 *     description: Retrieves a list of upcoming property inspections within the next 7 days for a specific property manager.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Inspection
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the property manager.
 *         example: 101
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [list, rent]
 *         description: Role of the user. Only 'list' role is allowed for this action.
 *         example: "list"
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number for pagination.
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: The number of records per page.
 *         example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved upcoming inspections.
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
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of inspections found.
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: Number of records per page.
 *                       example: 10
 *                     data:
 *                       type: array
 *                       description: Array of upcoming inspections.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Inspection ID.
 *                             example: 23
 *                           fullDate:
 *                             type: string
 *                             format: date-time
 *                             description: Scheduled date and time for the inspection.
 *                             example: "2024-09-10T10:00:00.000Z"
 *                           inspectionStatus:
 *                             type: string
 *                             description: Status of the inspection.
 *                             example: "accepted"
 *                           building:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: Building ID.
 *                                 example: 44
 *                               name:
 *                                 type: string
 *                                 description: Building name.
 *                                 example: "Building A"
 *       400:
 *         description: Bad request. Invalid parameters or role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid role or missing parameters"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */



/**
 * @swagger
 * /user/getBuildings:
 *   get:
 *     summary: Get available buildings based on type and user preferences
 *     description: Retrieves buildings based on the specified type (e.g., popular, recommended, bestOffer, topRated, etc.), user preferences, and pagination options.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Buildings
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [popular, recommended, bestOffer, topRated, flats, duplex, selfContains, roomAndParlour, all]
 *         required: true
 *         description: The type of buildings to retrieve.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: false
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: false
 *         description: Number of buildings to retrieve per page.
 *     responses:
 *       200:
 *         description: Successful response with a list of buildings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Response message.
 *                   example: successfull
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total number of available buildings.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages available.
 *                     currentPage:
 *                       type: integer
 *                       description: The current page number.
 *                     pageSize:
 *                       type: integer
 *                       description: Number of buildings retrieved per page.
 *                     buildings:
 *                       type: array
 *                       description: List of buildings.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Building ID.
 *                           propertyManagerId:
 *                             type: integer
 *                             description: ID of the property manager.
 *                           propertyPreference:
 *                             type: string
 *                             description: The type of property (e.g., flats, duplex).
 *                           address:
 *                             type: string
 *                             description: Address of the building.
 *                           availability:
 *                             type: string
 *                             description: Availability status of the building.
 *                             example: vacant
 *                           averageRating:
 *                             type: number
 *                             description: Average rating of the building.
 *                             example: 4.5
 *                           reviewCount:
 *                             type: integer
 *                             description: Number of reviews for the building.
 *                             example: 10
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid type or missing required parameters.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: An error occurred while processing the request.
 */



/**
 * @swagger
 * /getBuildingDetails:
 *   get:
 *     summary: Get detailed information about a specific building.
 *     description: Fetches the details of a building including property manager information and tenant reviews.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Buildings
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the building to fetch details for.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user making the request.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [list, rent]
 *         required: true
 *         description: The role of the user (e.g., 'list' or 'rent').
 *     responses:
 *       200:
 *         description: Building details retrieved successfully.
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
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Building ID.
 *                     buildingName:
 *                       type: string
 *                       description: Name of the building.
 *                     address:
 *                       type: string
 *                       description: Address of the building.
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Building creation date.
 *                     PropertyManager:
 *                       type: object
 *                       description: Details of the property manager.
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Property manager ID.
 *                         firstName:
 *                           type: string
 *                           description: First name of the property manager.
 *                         lastName:
 *                           type: string
 *                           description: Last name of the property manager.
 *                         phone:
 *                           type: string
 *                           description: Phone number of the property manager.
 *                     BuildingReview:
 *                       type: array
 *                       description: Tenant reviews of the building.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Review ID.
 *                           review:
 *                             type: string
 *                             description: The content of the review.
 *                           rating:
 *                             type: number
 *                             description: Rating given by the tenant.
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: Review creation date.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid or missing query parameters."
 *       404:
 *         description: Building not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Building not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/getChat:
 *   get:
 *     summary: Retrieve chat messages based on type (chat detail or summary).
 *     description: Fetches either the detailed chat messages with a specific partner or a summary of chats for a user.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Chat
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [summary, chatDetail]
 *         required: true
 *         description: The type of chat data to retrieve (either 'summary' for chat summary or 'chatDetail' for detailed conversation with a specific partner).
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user retrieving the chat data.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [list, rent]
 *         required: true
 *         description: The role of the user in the chat (either 'list' or 'rent').
 *       - in: query
 *         name: partnerId
 *         schema:
 *           type: integer
 *         required: false
 *         description: The ID of the partner to fetch chat details with. This is required when 'type' is 'chatDetail' and forbidden otherwise.
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Message ID.
 *                       senderId:
 *                         type: integer
 *                         description: ID of the message sender.
 *                       receiverId:
 *                         type: integer
 *                         description: ID of the message receiver.
 *                       message:
 *                         type: string
 *                         description: The content of the chat message.
 *                       messageType:
 *                         type: string
 *                         description: Type of the message (e.g., text, image).
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of when the message was sent.
 *                       RepliedMessage:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID of the replied message.
 *                           message:
 *                             type: string
 *                             description: The content of the replied message.
 *                           messageType:
 *                             type: string
 *                             description: Type of the replied message.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid or missing query parameters."
 *       404:
 *         description: Chat messages not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No chat messages found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/getTransaction:
 *   get:
 *     summary: Retrieve transactions based on user role and type
 *     description: Fetches transactions for a user based on their role (either 'rent' or 'list'), and the type of transaction. Supports pagination for retrieving multiple transactions.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [summary, chatDetail]
 *         required: true
 *         description: The type of transactions to retrieve.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: true
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: true
 *         description: The number of transactions to retrieve per page.
 *     responses:
 *       200:
 *         description: Successful response with a list of transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Response message.
 *                   example: successfull
 *                 data:
 *                   type: array
 *                   description: List of transactions.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Transaction ID.
 *                       userId:
 *                         type: integer
 *                         description: User ID associated with the transaction.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the transaction was created.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the transaction was last updated.
 *                       Building:
 *                         type: object
 *                         description: Building details if the user role is 'list'.
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Building ID.
 *                           propertyManagerId:
 *                             type: integer
 *                             description: ID of the property manager.
 *                           address:
 *                             type: string
 *                             description: Address of the building.
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid role or missing required parameters.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: An error occurred while processing the request.
 */


/**
 * @swagger
 * /user/getTransactionRefund:
 *   get:
 *     summary: Retrieve refund transaction logs based on user role
 *     description: Fetches refund transactions for a user based on their role (either 'rent' or 'list'). Supports pagination for retrieving multiple transactions.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Refund Transactions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: true
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: true
 *         description: The number of refund transactions to retrieve per page.
 *     responses:
 *       200:
 *         description: Successful response with a list of refund transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Response message.
 *                   example: successfull
 *                 data:
 *                   type: array
 *                   description: List of refund transactions.
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Refund transaction ID.
 *                       prospectiveTenantId:
 *                         type: integer
 *                         description: ID of the prospective tenant associated with the refund.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the refund transaction was created.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the refund transaction was last updated.
 *                       Building:
 *                         type: object
 *                         description: Building details if the user role is 'list'.
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Building ID.
 *                           prospectiveTenantId:
 *                             type: integer
 *                             description: ID of the prospective tenant.
 *                           address:
 *                             type: string
 *                             description: Address of the building.
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid role or missing required parameters.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: An error occurred while processing the request.
 */



/**
 * @swagger
 * /getInspectionDetails:
 *   get:
 *     summary: Retrieve details of a specific inspection.
 *     description: Fetches detailed information of an inspection based on the inspection ID provided.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Inspections
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [list, rent]
 *         required: true
 *         description: The role of the user in the inspection context (either 'list' or 'rent').
 *       - in: query
 *         name: inspectionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the inspection to retrieve details for.
 *     responses:
 *       200:
 *         description: Inspection details retrieved successfully.
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
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the inspection.
 *                     inspectionDate:
 *                       type: string
 *                       format: date-time
 *                       description: Date and time of the inspection.
 *                     inspectionStatus:
 *                       type: string
 *                       description: Current status of the inspection.
 *                     BuildingInspection:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Building ID.
 *                         name:
 *                           type: string
 *                           description: Name of the building.
 *                         address:
 *                           type: string
 *                           description: Address of the building.
 *                     MyInspection:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Tenant ID.
 *                         fullName:
 *                           type: string
 *                           description: Full name of the prospective tenant.
 *                         email:
 *                           type: string
 *                           format: email
 *                           description: Email address of the prospective tenant.
 *                         phoneNumber:
 *                           type: string
 *                           description: Phone number of the prospective tenant.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid or missing query parameters."
 *       404:
 *         description: Inspection not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Inspection not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */



/**
 * @swagger
 * /user/rentAction:
 *   get:
 *     summary: Retrieve tenant actions based on type
 *     description: Fetches tenant data based on the specified action type, such as recent rent payments or invoices due. Supports pagination to manage large datasets.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Tenant Actions
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [recentRent, tenantInvoicesDue]
 *         required: true
 *         description: The type of tenant action to retrieve, either 'recentRent' for recent rent payments or 'tenantInvoicesDue' for invoices that are due.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: true
 *         description: The page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         required: true
 *         description: The number of tenant records to retrieve per page.
 *     responses:
 *       200:
 *         description: Successful response with tenant data and pagination details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Response message.
 *                   example: successfull
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       description: List of tenant records based on the action type.
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Tenant ID.
 *                           rentNextDueDate:
 *                             type: string
 *                             format: date
 *                             description: Date when the next rent is due.
 *                           status:
 *                             type: string
 *                             description: Status of the tenant (e.g., 'active', 'rentDue').
 *                           Building:
 *                             type: object
 *                             description: Building details associated with the tenant.
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: Building ID.
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           description: Total number of tenant records.
 *                         currentPage:
 *                           type: integer
 *                           description: The current page number.
 *                         pageSize:
 *                           type: integer
 *                           description: The number of records per page.
 *                         totalPages:
 *                           type: integer
 *                           description: Total number of pages.
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid type or missing required parameters.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: An error occurred while processing the request.
 */




/**
 * @swagger
 * /user/getInspectionDetails:
 *   get:
 *     summary: Retrieve inspection details
 *     description: Fetches details of a specific inspection, including associated building and prospective tenant information. Requires an inspection ID and user role to ensure access control.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Inspections
 *     parameters:
 *       - in: query
 *         name: inspectionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the inspection to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful response with inspection details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: Response message.
 *                   example: successfull
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the inspection.
 *                     inspectionDate:
 *                       type: string
 *                       format: date
 *                       description: The date of the inspection.
 *                     BuildingInspection:
 *                       type: object
 *                       description: Building details associated with the inspection.
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Building ID.
 *                         address:
 *                           type: string
 *                           description: Building address.
 *                     MyInspection:
 *                       type: object
 *                       description: Prospective tenant details associated with the inspection.
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: Tenant ID.
 *                         name:
 *                           type: string
 *                           description: Tenant's name.
 *                         email:
 *                           type: string
 *                           description: Tenant's email.
 *       400:
 *         description: Invalid request or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid inspectionId or missing required parameters.
 *       404:
 *         description: Inspection not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Inspection not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: HTTP status code.
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: An error occurred while processing the request.
 */



/**
 * @swagger
 * /user/ProspectiveTenantInformation:
 *   get:
 *     summary: Retrieve prospective tenant information with reviews.
 *     description: Fetches details of a prospective tenant based on an inspection ID and includes reviews with pagination.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Prospective Tenants
 *     parameters:
 *       - in: query
 *         name: inspectionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the inspection to fetch prospective tenant information.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: The number of reviews to retrieve per page.
 *     responses:
 *       200:
 *         description: Successfully retrieved prospective tenant information and reviews with pagination.
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
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the prospective tenant.
 *                         name:
 *                           type: string
 *                           description: The name of the prospective tenant.
 *                         PropertyManagerReview:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: The ID of the review.
 *                               review:
 *                                 type: string
 *                                 description: The review text.
 *                               rating:
 *                                 type: integer
 *                                 description: The rating given in the review.
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 description: The timestamp when the review was created.
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           description: The total number of reviews.
 *                         currentPage:
 *                           type: integer
 *                           description: The current page number.
 *                         pageSize:
 *                           type: integer
 *                           description: The number of reviews per page.
 *                         totalPages:
 *                           type: integer
 *                           description: The total number of pages.
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bad Request. Invalid or missing query parameters."
 *       404:
 *         description: Inspection or tenant data not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Inspection not found or Tenant data not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error."
 */




/**
 * @swagger
 * /user/updateProfile2:
 *   post:
 *     summary: Update tenant profile remove the 2 at the end of updateProfile2
 *     description: Updates the profile of the logged-in user, including image upload and profile details.
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The profile image to upload (optional, size less than 3MB).
 *               firstName:
 *                 type: string
 *                 description: User's first name.
 *               lastName:
 *                 type: string
 *                 description: User's last name.
 *               maritalStatus:
 *                 type: string
 *                 description: User's marital status.
 *               gender:
 *                 type: string
 *                 enum: [Male, Female]
 *                 description: User's gender.
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth.
 *               familySize:
 *                 type: integer
 *                 description: User's family size.
 *               rentalDuration:
 *                 type: integer
 *                 description: User's rental duration preference.
 *               budgetMin:
 *                 type: integer
 *                 description: Minimum budget for rent.
 *               budgetMax:
 *                 type: integer
 *                 description: Maximum budget for rent.
 *               occupation:
 *                 type: string
 *                 description: User's occupation.
 *               country:
 *                 type: string
 *                 description: User's country.
 *               stateOfOrigin:
 *                 type: string
 *                 description: User's state of origin.
 *               nin:
 *                 type: string
 *                 description: User's National Identification Number (NIN).
 *               bankCode:
 *                 type: string
 *                 description: User's bank code.
 *               bankAccount:
 *                 type: string
 *                 description: User's bank account number.
 *               propertyPreference:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [all, flats, duplex, selfContains, roomAndParlour]
 *                 description: User's property preference.
 *               propertyLocation:
 *                 type: string
 *                 description: Preferred property location.
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request or validation error
 *       500:
 *         description: Internal server error
 */




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
    this.router.post("/sendInvoce", this.sendInvoce);
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
    this.router.get("/rentAction", this.rentAction);
    this.router.get("/tenant", this.tenant);
    this.router.get("/ProspectiveTenantInformation", this.ProspectiveTenantInformation);
    this.router.get("/appointmentAndRent", this.appointmentAndRent);

    this.router.get("/getAllUser", this.getAllUser);
    this.router.get("/getAllLordData", this.getAllLordData);

    this.router.post("/reviewTenant", this.reviewTenant);


    this.router.get("/whoIAm", this.whoIAm);
    

  } 

}

export default new UserRoutes().router;
