import jwt from "jsonwebtoken";
import bcrypt from'bcrypt';
import { Tenant, 
     PropertyManager, 
     PasswordReset , 
     Transaction , 
     RefundLog , 
     Building , 
     Inspection , 
     EmailandTelValidation
   } from "../db/models/index.js";
import serverConfig from "../config/server.js";
import authUtil from "../utils/auth.util.js";
import mailService from "../service/mail.service.js";
import axios from'axios';

import {
  ConflictError,
  SystemError,
  NotFoundError
} from "../errors/index.js";
import { Op } from "sequelize";



class AuthenticationService {
  TenantModel = Tenant;
  PropertyManagerModel=PropertyManager;
  PasswordResetModel=PasswordReset;
  EmailandTelValidationModel=EmailandTelValidation;
  TransactionModel=Transaction;
  BuildingModel=Building;
  InspectionModel=Inspection;
  RefundLogModel=RefundLog

  

  

   


  verifyToken(token) {
    try {
      const payload = jwt.verify(
        token,
        serverConfig.TOKEN_SECRET
      );
      return {
        payload,
        expired: false,
      };
    } catch (error) {
      return {
        payload: null,
        expired: error.message.includes("expired") ? error.message : error,
      };
    }
  }


  async handleUserCreation(data,file) {
      let { 
        firstName,
        lastName,
        emailAddress,
        password,
        type,
        image
      } = await authUtil.verifyUserCreationData.validateAsync(data);
  
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(
        password,
        Number(serverConfig.SALT_ROUNDS)
      );
    } catch (error) { 
      console.log(error)
      throw new SystemError(error);
    }

   

    if(type==="list"){
      let existingUser = await this.isUserEmailExisting(emailAddress,this.PropertyManagerModel);

      if (existingUser != null)throw new ConflictError(existingUser);
  
      try {
        const user = await this.PropertyManagerModel.create({
          firstName,
          lastName,
          emailAddress,
          password:hashedPassword,
          image
      });
      await this.sendEmailVerificationCode(user.emailAddress,user.id,type)
      
      return user;
  
      } catch (error) {
        console.log(error)
        throw new SystemError(error.name,error.parent)
      }
    }
    else{

      let existingUser = await this.isUserEmailExisting(emailAddress, this.TenantModel );
      if (existingUser != null)throw new ConflictError(existingUser);
      
      try {
        const user = await this.TenantModel.create({
          firstName,
          lastName,
          emailAddress,
          password:hashedPassword,
          image
      });
      await this.sendEmailVerificationCode(user.emailAddress,user.id,type)
      
      return user;
  
      } catch (error) {
        console.log(error)
        throw new SystemError(error.name,error.parent)
      }

    }

  }

  
  async handleSendVerificationCodeEmailOrTel(data) {

    let { 
      userId,
      type,
      validateFor
    } = await authUtil.verifyHandleSendVerificationCodeEmailOrTel.validateAsync(data);

    let relatedUser

    if(validateFor=='rent'){
      relatedUser = await this.TenantModel.findOne({
        where: { id: userId },
      });
    }
    else{
      relatedUser = await this.PropertyManagerModel.findOne({
        where: { id: userId },
      });
    }
   
    if(!relatedUser) throw new NotFoundError("No user found")
    if(type==='email'){
      await this.sendEmailVerificationCode(relatedUser.emailAddress,relatedUser.id, validateFor)
    }else{
      await this.sendTelVerificationCode(relatedUser.tel,relatedUser.id)
    }

  }

  async handleSendPasswordResetLink(data) {
    const { emailOrPhone , type } = await authUtil.validateHandleSendPasswordResetLink.validateAsync(data);


    let matchedUser

    if(type=="list"){

      try {

        matchedUser=await this.PropertyManagerModel.findOne({
          where: {
        [Op.or]: [
          { emailAddress:emailOrPhone},
          { tel: emailOrPhone }, 
        ],
        isEmailValid:true, 
        disableAccount:false, 
        isDeleted:false
      }
      });
        
      } catch (error) {

          console.log(error)
          throw new SystemError(error.name , error.parent)
      }

    }
    else{
      try {

        matchedUser=await this.TenantModel.findOne({
          where: {
        [Op.or]: [
          { emailAddress:emailOrPhone},
          { tel: emailOrPhone }, 
        ],
        isEmailValid:true, 
        disableAccount:false, 
        isDeleted:false
      }
      });
        
      } catch (error) {
          console.log(error)
          throw new SystemError(error.name , error.parent)
      }

    }
    
    if (matchedUser == null){
      throw new NotFoundError("This email does not correspond to any user");
    }
    var keyExpirationMillisecondsFromEpoch =
      new Date().getTime() + 30 * 60 * 1000;
    var generatedKey = this.generatePassword(true);

    let uniqueId=matchedUser.id+'_'+type
    var relatedPasswordReset = await this.PasswordResetModel.findOrCreate({
      where: {
        userId: uniqueId,
      },
      defaults: {
        userId: uniqueId,
        resetKey: generatedKey,
        expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
      },
    });

    relatedPasswordReset[0]?.update({
      resetKey: generatedKey,
      expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
    });

    const params = new URLSearchParams();
    params.append('key', generatedKey);
    params.append('Exkey',keyExpirationMillisecondsFromEpoch);

    await mailService.sendMail({
      to: matchedUser.emailAddress,
      subject: "Reset Password",
      templateName: "reset_password",
      variables: {
        resetLink:serverConfig.NODE_ENV==='development'?`http://localhost/COMPANYS_PROJECT/ResetPassword/sendPasswordLink.html?${params.toString()}`: `${serverConfig.DOMAIN}/adminpanel/Passwor?${params.toString()}`
      },
    });


  }


  generatePassword(omitSpecial = false, passwordLength = 12) {
    var chars = omitSpecial
      ? "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
      : "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // var passwordLength = 12;
    var password = "";
    for (var i = 0; i <= passwordLength; i++) {
      var randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
  }


  async handleWebHookMonify(data) {

    const { eventType, eventData } = data

    const { transactionReference, paymentReference, amount, userId, buildingId, transactionType} = eventData;

    try {

      const existingTransaction  = await this.TransactionModel.findOne({
        where: { transactionReference },
      });

      if(existingTransaction ) return

      const transaction = await this.TransactionModel.create({
        userId,
        buildingId,
        amount,
        transactionReference,
        paymentReference,
        transactionType,
      });

      const transactionStatus = await this.getTransactionStatus(transactionReference);

      transaction.paymentStatus = transactionStatus.paymentStatus;
      await transaction.save();

      if(transaction.paymentStatus=="PAID"&&transactionType=='appointmentAndRent'){

        const BuildingModelResponse = await this.BuildingModel.findByPk(buildingId);
        BuildingModelResponse.update({
          availability:"booked"
        });

        await this.InspectionModel.create({
          transactionReference,
          buildingId,
          tenantId:userId,
        });

      }

    } catch (error) {
      throw new SystemError(error.name,  error.parent)
    }

  }

  async handleResetPassword(data) {

    var {  password, resetPasswordKey } =
      await authUtil.validatePasswordReset.validateAsync(data);


    var relatedPasswordReset = await this.PasswordResetModel.findOne({
      where: {
        resetKey: resetPasswordKey,
      },
    });
    
    if (relatedPasswordReset == null)
      throw new NotFoundError("Invalid reset link");
    else if (relatedPasswordReset.expiresIn.getTime() < new Date().getTime())
      throw new NotFoundError("Reset link expired");

      const parts = relatedPasswordReset.userId.split('_');
      let relatedUser=null
      let type=parts[1]
      let userId=parts[0]

      if(type=='list'){
        relatedUser = await this.PropertyManagerModel.findOne({
          where: { id: userId },
        });
      }
      else{
        relatedUser = await this.TenantModel.findOne({
          where: { id: userId },
        });
      }
     

    if (relatedUser == null)
      throw new NotFoundError("Selected user cannot be found");
    try {
      var hashedPassword = await bcrypt.hash(
        password,
        Number(serverConfig.SALT_ROUNDS)
      );

      relatedUser.update({
        password: hashedPassword,
      });
      relatedPasswordReset.update({
        expiresIn: new Date(),
      });
    } catch (error) {
      throw new ServerError("Failed to update password");
    }
  }

  async  getAuthTokenMonify() {

    const apiKey = serverConfig.MONNIFY_API_KEY;
    const clientSecret = serverConfig.MONNIFY_CLIENT_SECRET;
    const authHeader = `Basic ${base64.encode(`${apiKey}:${clientSecret}`)}`;
    

    try {
      const response = await axios.post(`${serverConfig.MONNIFY_BASE_URL}/api/v1/auth/login`, {}, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });
  
      return response.data.responseBody.accessToken;
    } catch (error) {
      console.error('Error fetching auth token:', error);
      throw error;
    }
  }
  

  async  getTransactionStatus(transactionReference) {
    const authToken = await this.getAuthTokenMonify();
  
    try {
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?transactionReference=${transactionReference}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      return response.data.responseBody;
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }
  
  
  async  updateTransactionStatusCronJob(transaction, status) {
    try {
      transaction.paymentStatus = status;
      await transaction.save();

      if(status=="PAID"&&transaction.transactionType=='appointmentAndRent'){

        const BuildingModelResponse = await this.BuildingModel.findByPk(transaction.buildingId);
        BuildingModelResponse.update({
          availability:"booked"
        })

        await this.InspectionModel.create({
          transactionReference,
          buildingId:transaction.buildingId,
          tenantId:transaction.userId,
        });

      }

      console.log(`Transaction ${transaction.transactionReference} updated to ${status}`);
    } catch (error) {
      console.error('Error updating transaction:', error.message);
    }
  }


  async checktransactionUpdate() {
    try {
      // Get all transactions with 'pending' or 'unverified' status
      const transactions = await this.TransactionModel.findAll({
        where: {
          paymentStatus: ['pending', 'unverified']
        }
      });
  
      if (transactions.length > 0) {

        // Get Monify authentication token
        const authToken = await this.getAuthTokenMonify();
        if (!authToken) return;
  
        // Check and update each transaction
        for (const transaction of transactions) {

          const transactionStatus = await getTransactionStatus(transaction.transactionReference, authToken);
  
          if (transactionStatus) {
            await this.updateTransactionStatusCronJob(transaction, transactionStatus.paymentStatus);
          }
        }
      } else {
        console.log('No pending or unverified transactions found');
      }
    } catch (error) {
      console.error('Error during cron job:', error.message);
    }
  }


  async updateRefundStatusCronJob(refund, status) {
    try {
      refund.refundStatus = status;
      await refund.save();
  
    } catch (error) {
      console.error('Error updating refund:', error.message);
    }
  }

  async  getRefundStatus(transactionReference, authToken) {
    try {
      const response = await axios.get(`{{base_url}}/api/v1/refunds/${transactionReference}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
  
      if (response.data.requestSuccessful) {
        return response.data.responseBody;
      } else {
        console.error(`Error retrieving refund status: ${response.data.responseMessage}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching refund status:', error.message);
      return null;
    }
  }
  
  

  async checkRefundUpdate() {
    try {
      // Get all refunds that are not completed
      const refunds = await this.RefundLogModel.findAll({
        where: {
          refundStatus: {
            [Op.ne]: 'COMPLETED' // Not equal to 'COMPLETED'
          }
        }
      });
  
      if (refunds.length > 0) {
        // Get Monify authentication token
        const authToken = await this.getAuthTokenMonify();
        if (!authToken) return;
  
        // Check and update each refund
        for (const refund of refunds) {
          const refundStatus = await this.getRefundStatus(refund.transactionReference, authToken);
  
          if (refundStatus) {
            await this.updateRefundStatusCronJob(refund, refundStatus.refundStatus);
          }
        }
      } 
    } catch (error) {
      console.error('Error during refund status check:', error.message);
    }
  }
  

  async handleUploadPicture(data,file) {
    

   const{ userId }=await authUtil.verifyHandleUploadPicture.validateAsync(data);
 
   const user = await this.UserModel.findByPk(userId);

   if (!user) throw new NotFoundError("User not found.");

      try { 
        let accessPath=''

        if(serverConfig.NODE_ENV == "production"){
          accessPath =
          serverConfig.DOMAIN +
          file.path.replace("/home", "");
        }
        else if(serverConfig.NODE_ENV == "development"){

          accessPath = serverConfig.DOMAIN+file.path.replace("public", "");
        }
        await user.update({ image: accessPath ,
                        isImageVerified:true});

        return user
      } catch (error) {
        throw new ServerError("Failed to update user image" );
      }
  }

  
  async handleLoginAdmin(data) {

    const{ emailOrTel, password }=await authUtil.verifyHandleLoginAdmin.validateAsync(data);

    const isEmail = /\S+@\S+\.\S+/.test(emailOrTel);

    const user =  await this.AdminModel.findOne({
      where: {
        [Op.and]: [
          {
            [isEmail ? 'emailAddress' : 'tel']: emailOrTel
          },
          { [isEmail ? 'isEmailValid' : 'isTelValid']: true},
          { isDeleted: false}
          
        ],       
      },
    });   

    if (!user) throw new NotFoundError("User not found.");

    if (!(await bcrypt.compare(password, user.password))) return null;
    
    if(user.disableAccount) return 'disabled'

    return user;
  }


  async handleUpdateTel(data) {
    let {      
      userId,  
      tel,
    } = await authUtil.verifyHandleUpdateTel.validateAsync(data);

    try {
      
      let result =await this.UserModel.findByPk(userId)
      result.update(
        {
          tel:tel
        }
      );

    } catch (error) {
      console.log(error)
      throw new SystemError(error.name, error.parent)
    }

   
    

  }


  async handleLoginUser(data) {

    const { 
      emailAddress,
      password ,
      type
      }=await authUtil.verifyHandleLoginUser.validateAsync(data);

    let user 

    if(type=="list"){

      user =  await this.PropertyManagerModel.findOne({
        where: {
          emailAddress, 
          isEmailValid:true, 
          isDeleted:false
        }
      });  

    }else{
      user =  await this.TenantModel.findOne({
        where: {
          emailAddress, 
          isEmailValid:true,
          isDeleted:false
        }
      });  
    }
    
    if (!user) throw new NotFoundError("User not found.");


    if (!(await bcrypt.compare(password, user.password))) return null;
   
    if(user.disableAccount) return 'disabled'
    
    return user;
  }

  async generateToken(user) {

    try {
      const token = jwt.sign(user, serverConfig.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn:serverConfig.TOKEN_EXPIRES_IN,
        issuer: serverConfig.TOKEN_ISSUER,
      });

      return token;
    } catch (error) {
      return error;
    }
  }


  
  async handleVerifyEmailorTelAdmin(data) {

    let { 
      userId,
      verificationCode,
      who,
      type
    } = await authUtil.verifyHandleVerifyEmailorTelAdmin.validateAsync(data);



    let relatedEmailoRTelValidationCode = ''


    if(who=='business'){
      relatedEmailoRTelValidationCode = await this.EmailandTelValidationBusinessModel.findOne({
        where: {
          userId: userId,
          verificationCode: verificationCode,
          type
        },
      })
    }
    else if(who=='admin'){
      relatedEmailoRTelValidationCode = await this.EmailandTelValidationAdminModel.findOne({
        where: {
          userId: userId,
          verificationCode: verificationCode,
          type
        },
      })
    }
    else if(who=='businessSpot'){
      relatedEmailoRTelValidationCode = await this.EmailandTelValidationBusinessSpotModel.findOne({
        where: {
          userId: userId,
          verificationCode: verificationCode,
          type
        },
      })
    }    


    if (relatedEmailoRTelValidationCode == null){
      throw new NotFoundError("Invalid verification code");
    } 
  

    var relatedUser = await this.AdminModel.findOne({
      where: { id: relatedEmailoRTelValidationCode.userId },
    });


    if (relatedUser == null){
      throw new NotFoundError("Selected user cannot be found");
    }
    try {
     
      if('email'){
        relatedUser.update({
          isEmailValid: true,
        });

        relatedEmailoRTelValidationCode.update({
          expiresIn: new Date(),
        });
      }
      else{
        relatedUser.update({
          isTelValid: true,
        });
      }
  
    } catch (error) {
      throw new ServerError("Failed to update "+type );
    }

  }


  async handleVerifyEmailorTel(data) {

    let { 
      userId,
      verificationCode,
      validateFor,
      type
    } = await authUtil.verifyHandleVerifyEmailorTel.validateAsync(data);

    let relatedEmailoRTelValidationCode = await this.EmailandTelValidationModel.findOne({
      where: {
        userId: userId,
        validateFor,
        verificationCode: verificationCode,
        type
      },
    })  
    
    if (relatedEmailoRTelValidationCode == null){
      throw new NotFoundError("Invalid verification code");
    } 
    else if (relatedEmailoRTelValidationCode.expiresIn.getTime() < new Date().getTime()){
      throw new NotFoundError("verification code expired");
    }

    let relatedUser

    if(validateFor=='list'){
      relatedUser = await this.PropertyManagerModel.findOne({
        where: { id: relatedEmailoRTelValidationCode.userId },
      });
    }
    else{
      relatedUser = await this.TenantModel.findOne({
        where: { id: relatedEmailoRTelValidationCode.userId },
      });
    }
   

    if (relatedUser == null){
      throw new NotFoundError("Selected user cannot be found");
    }

    try {
     
      if(type==='email'){

        relatedUser.update({
          isEmailValid: true,
        });

        relatedEmailoRTelValidationCode.update({
          expiresIn: new Date(),
        });

        return  relatedUser
        
      }
      else{
        relatedUser.update({
          isTelValid: true,
        });

        return  relatedUser

      }
      

    } catch (error) {
      throw new ServerError("Failed to update "+type );
    }

  }


  async  isUserEmailExisting(emailAddress,Model) {


    try {

      const existingUser = await Model.findOne({
        where: {
            emailAddress: emailAddress,
            isDeleted: false 
        }
      });

      if (existingUser) {

          return 'User with this email already exists.';
            
      } 
      return null

  }catch (error) {
      console.log(error)
      throw new SystemError(error.name, error.parent)
    }
      
  }


  async  sendEmailVerificationCode(emailAddress, userId, validateFor) {

  try {
    
      var keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
      const verificationCode = Math.floor(Math.random() * 900000) + 100000;

      await this.EmailandTelValidationModel.upsert({
        userId,
        type: 'email',
        validateFor,
        verificationCode,
        expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
      }, {
        where: {
          userId,
          validateFor
        }
      });
  
      try {
            
          await mailService.sendMail({
            to: emailAddress,
            subject:"Account Verification",
            templateName:"emailVerificationCode",
            variables: {
              verificationCode:verificationCode,
              email: emailAddress,
            },
          });
  
      } catch (error) {
          console.log(error)
      }
  
  
  } catch (error) {
    console.log(error);
  }

   



  }

  async  sendTelVerificationCode(tel, userId) {


    try {
      
        var keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
        const verificationCode = Math.floor(Math.random() * 900000) + 100000;
  
  
        await this.EmailandTelValidationModel.upsert({
          userId,
          type: 'tel',
          verificationCode,
          expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
        }, {
          where: {
            userId
          }
        });
    
        try {
              
          const options = {
            method: 'GET',
            url: 'https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp',
            params: {
              number: '+2348184724615',
            },
            headers: {
              'X-RapidAPI-Key': 'b03b577e45mshb62f4d5ecbfae57p108324jsna07cb1377bb8',
              'X-RapidAPI-Host': 'phonenumbervalidatefree.p.rapidapi.com'
            }
          };
          
          try {
            const response = await axios.request(options);
            console.log(response.data);
          } catch (error) {
            console.error(error);
          }
    
        } catch (error) {
            console.log(error)
        }
    
    
    } catch (error) {
      console.log(error);
    }
  
     
  
  
  
    }


  async  sendTextVerificationCode(emailAddress, userId) {

    try {      
        var keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
        const verificationCode  = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');


        await this.EmailandTelValidationModel.upsert({
          userId,
          type: 'email',
          verificationCode,
          expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
        }, {
          where: {
            userId
          }
        });

        
    
        try {
              
            await mailService.sendMail({
              to: emailAddress,
              subject: "Account Verification",
              templateName: "emailVerificationCode",
              variables: {
                verificationCode:verificationCode,
                email: emailAddress,
              },
            });
    
        } catch (error) {
            console.log(error)
        }
    
    
    } catch (error) {
      console.log(error);
    }
  
  
  }
    
  
}

export default new AuthenticationService();
