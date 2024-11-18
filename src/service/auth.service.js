import jwt from "jsonwebtoken";
import bcrypt from'bcrypt';
import { Tenant, 
     PropertyManager, 
     PasswordReset , 
     Transaction , 
     RefundLog , 
     Building , 
     Inspection , 
     ProspectiveTenant , 
     EmailandTelValidation , 
      Admin ,
      Notification,
      Setting
   } from "../db/models/index.js";
import serverConfig from "../config/server.js";
import authUtil from "../utils/auth.util.js";
import userService from "../service/user.service.js";
import { Buffer } from 'buffer';
import mailService from "../service/mail.service.js";
import axios from'axios';

import {
  ConflictError,
  SystemError,
  NotFoundError
} from "../errors/index.js";
import { Op } from "sequelize";

const TRANSACTION_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  PAID: 'PAID',
  OVERPAID: 'OVERPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PENDING: 'PENDING',
  ABANDONED: 'ABANDONED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
  EXPIRED: 'EXPIRED'
};

class AuthenticationService {
  TenantModel = Tenant;
  PropertyManagerModel=PropertyManager;
  PasswordResetModel=PasswordReset;
  EmailandTelValidationModel=EmailandTelValidation;
  TransactionModel=Transaction;
  BuildingModel=Building;
  InspectionModel=Inspection;
  RefundLogModel=RefundLog
  ProspectiveTenantModel=ProspectiveTenant
  AdminModel= Admin
  SettingModel= Setting
  NotificationModel=Notification




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


  async handleUserCreation(data) {
      let { 
        firstName,
        lastName,
        emailAddress,
        password,
        type,
        image,
        privilege
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
    else if(type==="rent"){


      let existingUser = await this.isUserEmailExisting(emailAddress, this.ProspectiveTenantModel );
      if (existingUser != null)throw new ConflictError(existingUser);
      
      
      try {
        const user = await this.ProspectiveTenantModel.create({
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

      let existingUser = await this.isUserEmailExisting(emailAddress, this.AdminModel );
      if (existingUser != null)throw new ConflictError(existingUser);
      
      try {
        const user = await this.AdminModel.create({
          firstName,
          lastName,
          emailAddress,
          password:hashedPassword,
          image,
          privilege
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
      relatedUser = await this.ProspectiveTenantModel.findOne({
        where: { id: userId },
      });
    }
    else if(validateFor=='list'){
      relatedUser = await this.PropertyManagerModel.findOne({
        where: { id: userId },
      });
    }
    else{
      relatedUser = await this.AdminModel.findOne({
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

        matchedUser=await this.ProspectiveTenantModel.findOne({
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
  
  async authorizeTransfer(body) {

   

    try {

      const transactionStatus = await this.authorizeSingleTransfer(body.reference,body.authorizationCode);


    } catch (error) {
        console.log(error)
    }
   

  }


  async handleWebHookMonifyRefund(data) {

    const { eventType, eventData } = data

    const { refundReference } = eventData;

    try {

      const transactionStatus = await this.getRefundTransactionStatus(refundReference);

      this.processRefund(transactionStatus)

    } catch (error) {
        console.log(error)
    }
   

  }

  async processRefund(transactionStatus){

    const {transactionReference}=transactionStatus

    if(paymentReference.startsWith("refund_inspection")){
            
      const RefundLogModelResult  = await this.RefundLogModel.findOne({
        where: { transactionReference },
      });

      const InspectionModelResult  = await this.InspectionModel.findOne({
        where: { transactionReference },
      });

      await RefundLogModelResult.update({
        paymentStatus:transactionStatus.refundStatus,
        transactionReference :transactionReference
      });

      if(transactionStatus.refundStatus==="COMPLETED"){
        await InspectionModelResult.update({
          inspectionStatus: 'refunded',
        });

        const BuildingModelResult  = await this.BuildingModel.findOne({
          where: { id:RefundLogModelResult.buildingId },
        });

        await BuildingModelResult.update({
          availability:'vacant'
        });

      }

    }
  }
  

  async handleWebHookMonifyDisbursement(data) {

    const { eventData } = data
 
    const {reference } = eventData;
    
    const paymentReference=reference

    try {
      


      const transactionStatus = await this.getTransactionStatusDisbursement(paymentReference);


      await this.handleDisbursement(transactionStatus)
     
    } catch (error) {
      throw new SystemError(error.name,  error.parent)
    }

  }


  async handleDisbursement(transactionStatus){


    const  {reference, transactionReference}=transactionStatus
    const paymentReference=reference
      

      try {
        const TransactionModelResult= await this.TransactionModel.findOne({
          where:{
            paymentReference:paymentReference
          }
        })

        console.log("TransactionModelResult")
        console.log("TransactionModelResult")
        console.log("TransactionModelResult")
        console.log(TransactionModelResult)
        console.log("TransactionModelResult")
        console.log("TransactionModelResult")
        console.log("TransactionModelResult")


        if (TransactionModelResult) {

          if(transactionStatus.reference.startsWith("firstRent")){

            await TransactionModelResult.update({
              paymentStatus:transactionStatus.status,
              transactionReference
            });
      

            if(transactionStatus.status==="SUCCESS"){

              const InspectionModelResult=await this.InspectionModel.findOne({
                where:{
                  id:TransactionModelResult.inspectionId
                }
              })

    
              InspectionModelResult.update({
                landlordPaidStatus:true
              })


              if(InspectionModelResult.agentPaidStatus==true){

                InspectionModelResult.update({
                  inspectionStatus:"disbursed"
                })
              }
    
                const BuildingModelResult=await this.BuildingModel.findByPk(TransactionModelResult.buildingId)

                if(BuildingModelResult){

                  BuildingModelResult.update({
                    availability:"occupied"
                  })

                  const TenantModelResult=await this.TenantModel.findOne({
                        where:{
                          status: {
                            [Op.or]: ['active', 'rentDue']
                          },
                          buildingId:TransactionModelResult.buildingId
                        }
                  })

                  if(!TenantModelResult){
                    this.TenantModel.create({
                      buildingId:TransactionModelResult.buildingId,
                      prospectiveTenantId:TransactionModelResult.userId,
                      status:'active',
                      paymentReference:paymentReference,
                      rentNextDueDate:userService.calculateRentNextDueDate(BuildingModelResult.rentalDuration)
                    })
                  }

                }
              

            }
    
          } 
          else if(transactionStatus.reference.startsWith("commission")){


            await TransactionModelResult.update({
              paymentStatus:transactionStatus.status,
              transactionReference
            });

            
            if(transactionStatus.status==="SUCCESS"){


              const InspectionModelResult=await this.InspectionModel.findOne({
                where:{
                  id:TransactionModelResult.inspectionId
                },
                order: [['createdAt', 'DESC']]
              })
    
              InspectionModelResult.update({
                agentPaidStatus:true
              })

              if(InspectionModelResult.landlordPaidStatus==true){
                InspectionModelResult.update({
                  inspectionStatus:"disbursed"
                })
              }

            }

          }
          else if(transactionStatus.reference.startsWith("rent")){

            await TransactionModelResult.update({
              paymentStatus:transactionStatus.status,
              transactionReference
            });

          }

        }
        
      } catch (error) {
        console.error('An error occurred while updating the transaction:', error.message);
        throw new SystemError(error.name,  error.parent)

      }

  }


  async handleWebHookCollectionMonify(data) {

    const { eventType, eventData } = data

    const { transactionReference} = eventData;

    try {

     // console.log(transactionReference)
   

      const transactionStatus = await this.getTransactionStatus(transactionReference);

      //console.log(transactionStatus)

      this.handlePaymentCollection(transactionStatus)

    } catch (error) {
      console.log(error)
      throw new SystemError(error.name,  error.parent)
    }

  }

  async handlePaymentCollection(transactionStatus){

    try {

      if(transactionStatus.paymentReference.startsWith("appointmentAndRent")){
        const {amountPaid ,metaData, paymentReference, transactionReference}=transactionStatus
        const { userId, buildingId, transactionType}=metaData
        //console.log(metaData)

        const existingTransaction = await this.TransactionModel.findOne({
          where: {
            paymentReference
          }
        })

        if(existingTransaction){
         
          await existingTransaction.update({
            paymentStatus: transactionStatus.paymentStatus
          })

        } 
        else{

          await this.TransactionModel.create({
            userId,
            buildingId,
            amount:amountPaid,
            transactionReference,
            paymentReference,
            transactionType,
            paymentStatus:transactionStatus.paymentStatus
          })
        }


      if(transactionStatus.paymentStatus=="PAID"){

        const BuildingModelResponse = await this.BuildingModel.findByPk(buildingId);
        BuildingModelResponse.update({
          availability:"booked"
        });

          const existingInspection = await this.InspectionModel.findOne({
          where: {
            buildingId,
            prospectiveTenantId: userId,
            inspectionStatus: "pending"
          },
        });
       
        if(!existingInspection){

          await this.InspectionModel.create({
            transactionReference,
            buildingId,
            prospectiveTenantId:userId
          })



          await this.NotificationModel.create({
            notificationFor: "rent",
            userId: existingInspection.prospectiveTenantId,
            type: "inspection",
            message: `Your inspection for ${BuildingModelResponse.propertyTitle} at ${BuildingModelResponse.address}, ${BuildingModelResponse.city} has been created. Please provide your preferred date to proceed.`,
            buildingId: BuildingModelResponse.id
          });
          

        }

      }
      }
      else if(transactionStatus.paymentReference.startsWith("rentInvoice")){

        const TransactionModelResult=await this.TransactionModel.findOne({
          where:{
            paymentReference:transactionStatus.paymentReference
          }
        })

        if(TransactionModelResult){
          
          await TransactionModelResult.update({
            paymentStatus:transactionStatus.paymentStatus,
            transactionReference:transactionStatus.transactionReference
          });

        }

        if(transactionStatus.paymentStatus=="PAID"){
          const TenantModelResult=await this.TenantModel.findOne({
            where:{
              prospectiveTenantId:TransactionModelResult.userId,
              buildingId:TransactionModelResult.buildingId
            }
          })

          const BuildingModelResult=await this.BuildingModel.findOne({
            where:{
              id:TransactionModelResult.buildingId
            }
          })

          if(TenantModelResult.paymentReference===transactionStatus.paymentReference){

          }
          else{

            TenantModelResult.update({
              status:'active',
              rentNextDueDate:userService.calculateRentNextDueDate(BuildingModelResult.rentalDuration,TenantModelResult.rentNextDueDate),
              paymentReference:transactionStatus.paymentReference
            })

            await this.NotificationModel.create({
              notificationFor: "list",
              userId: existingInspection.propertyManagerId, // Assuming propertyManagerId is available
              type: "rentPayment",
              message: `The rent has been paid for ${BuildingModelResult.propertyTitle} at ${BuildingModelResult.address}, ${BuildingModelResult.city}. You will receive your distribution soon.`,
              buildingId: BuildingModelResult.id
            });

  
            this.disburseRent(BuildingModelResult,TransactionModelResult.userId)
          }
         
        }

      }

  } catch (error) {
    console.log(error)
    throw new SystemError(error.name,  error.parent)
  }
  }


  async disburseRent(BuildingModel,prospectiveTenantId){

    const PropertyManagerModelResult=await this.PropertyManagerModel.findOne({
      where:{
        id:BuildingModel.propertyManagerId,
      }
    })

    const paymentReference="rent"+"_"+userService.generateReference()
    const authToken = await this.getAuthTokenMonify();

      const TransactionModelResultAmount=BuildingModel.price

        await this.TransactionModel.create({
          userId: prospectiveTenantId,
          buildingId:BuildingModel.id,
          amount:userService.calculateDistribution(TransactionModelResultAmount, 'landlord', true, 'rent').landlordShare,
          paymentReference,
          transactionType:'rent'
        });

        const transferDetails = {
          amount: userService.calculateDistribution(TransactionModelResultAmount, 'landlord', true, 'rent').landlordShare,
          reference: paymentReference,
          narration: 'Rent Payment ',
          destinationBankCode:    PropertyManagerModelResult.landlordBankCode,
          destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
          currency: 'NGN',
          sourceAccountNumber:serverConfig.MONNIFY_ACC,
          async:true
        };
        
        await this.initiateTransfer(authToken, transferDetails);
  }
  

  async handleIntializePayment(data) {

      try {   

        const { transactionReference } = await authUtil.verifyHandleIntializePayment.validateAsync(data);

        const transactionStatus = await this.getTransactionStatus(transactionReference);


       // if(transactionStatus.paymentStatus=="PAID"){
          this.handlePaymentCollection(transactionStatus)
       /* }else{
          throw new NotFoundError("Transaction not successfull")
        }*/
   
      } catch (error) {

        if(error.response.data.responseMessage==="There's no transaction matching supplied reference. Please confirm supplied reference and try again."){
          throw new NotFoundError(error.response.data.responseMessage)
        }   
        else{
          throw new NotFoundError(error.response)
        }

      } 

  }


  
  async handleValidateBankAccount(data) {

    var {  accountNumber, bankCode } =
      await authUtil.validateHandleValidateBankAccount.validateAsync(data);

    const accessToken = await this.getAuthTokenMonify()
    try {
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v1/disbursements/account/validate`, {
        params: {
          accountNumber: accountNumber,
          bankCode: bankCode
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
  
      // Check if the request was successful
      if (response.data.requestSuccessful) {
        return response.data.responseBody; // Return the data if validation is successful
      } else {
        throw new Error('Validation failed');
      }
    } catch (error) {
      throw new SystemError("Failed to update password");
    }
  }


  async getRegion() {


    try {

      const setting = await this.SettingModel.findOne({ where: { id: 1 } });

      if (!setting) {
        throw new SystemError('NotFoundError', 'Settings not found');
      }

      const buildingPreferences =setting.preferences.region || [];

      return buildingPreferences
         
    } catch (error) {
      throw new SystemError("Failed to update password");
    }
  }



  async getMaritalStatus() {

    try {

      const setting = await this.SettingModel.findOne({ where: { id: 1 } });

      if (!setting) {
        throw new SystemError('NotFoundError', 'Settings not found');
      }
      console.log(setting.preferences.maritalStatus)
      const maritalStatus = setting.preferences.maritalStatus || [];

      return maritalStatus 
         
    } catch (error) {
      //throw new SystemError(error.parent.);
      throw new SystemError(error.name, error.parent)

    }
  }


  async getReligion() {

    try {

      const setting = await this.SettingModel.findOne({ where: { id: 1 } });

      if (!setting) {
        throw new SystemError('NotFoundError', 'Settings not found');
      }

      const religion = setting.preferences.religion || [];

      return religion 
         
    } catch (error) {
      //throw new SystemError(error.parent.);
      throw new SystemError(error.name, error.parent)

    }
  }

  
  async getGender() {

    try {

      const setting = await this.SettingModel.findOne({ where: { id: 1 } });

      if (!setting) {
        throw new SystemError('NotFoundError', 'Settings not found');
      }
      //console.log(setting.gender)
      const gender = setting.preferences.gender || [];

      return gender 
         
    } catch (error) {
      console.log(error)
      //throw new SystemError(error.parent.);
      throw new SystemError(error.name, error.parent)

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
        relatedUser = await this.ProspectiveTenantModel.findOne({
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

 
  async  initiateTransfer(token, transferDetails) {


    console.log(transferDetails)
    try {
      const response = await axios.post(
        `${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single`,
        transferDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      return response.data;
    } catch (error) {
      console.log(error?.response?.data?.responseMessage)
      throw new SystemError(error.name,  error.response.data)

    }
}



  async  getAcctBalance(accountNumber) {

    try {
      // Fetch the auth token first
      const accessToken = await this.getAuthTokenMonify();
  
      // Use the token to make the request
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v1/disbursements/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
        params: {
          accountNumber: accountNumber,
        }
      });
      
      return response.data.responseBody;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }



  

  async  getAuthTokenMonify() {             

    try {

      const apiKey = serverConfig.MONNIFY_API_KEY;
      const clientSecret = serverConfig.MONNIFY_CLIENT_SECRET;
      const authHeader = `Basic ${Buffer.from(`${apiKey}:${clientSecret}`).toString('base64')}`;


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
      const encodedTransactionReference = encodeURIComponent(transactionReference)
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?transactionReference=${encodedTransactionReference}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });


      return response.data.responseBody;
    } catch (error) {   
      console.error('Error fetching transaction status1:', error?.message);
       
      console.error('Error fetching transaction status2:', error.response.data);
      throw error;
    }
  }

  async  getRefundTransactionStatus(refundReference) {
    const authToken = await this.getAuthTokenMonify();


    try {
      // const encodedTransactionReference = encodeURIComponent(transactionReference)
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v1/refunds/${refundReference}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });

      //console.log(response.data.responseBody)

      return response.data.responseBody;
    } catch (error) {   
      console.error('Error fetching transaction status:', error?.message);
       
      console.error('Error fetching transaction status:', error.response.data);
      //throw error;
    }
  }


  async  getTransactionStatusDisbursement(Reference) {
    const authToken = await this.getAuthTokenMonify();

    try {
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single/summary?reference=${Reference}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });


      return response.data.responseBody;
    } catch (error) {   
      console.error('Error fetching transaction status:', error?.message);
       
      console.error('Error fetching transaction status:', error.response.data);
      //throw error;
    }
  }

  async authorizeSingleTransfer(reference, authorizationCode) {
    const authToken = await this.getAuthTokenMonify();

    try {
      const response = await axios.post(`${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single/validate-otp`, 
      {
        reference,
        authorizationCode
      }, 
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle the response
      return response.data.responseBody;
    } catch (error) {
      console.error('Error authorizing single transfer:', error?.message); 
      console.error('Error authorizing single transfer:', error.response?.data);
      throw error;
    }
  }


  async  getTransactionStatus2(transactionReference) {
    const authToken = await this.getAuthTokenMonify();
    
    try {

      const encodedTransactionReference = encodeURIComponent(transactionReference);

      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single/summary?reference=${encodedTransactionReference}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
      });

   
      return response.data.responseBody;

    } catch (error) {   
      console.error('Error fetching transaction status:', error?.message);
       
      console.error('Error fetching transaction status:', error.response.data);
      //throw error;
    }
  }



  async  getTransactionStatusSingleTransfer(transactionReference) {
    const authToken = await this.getAuthTokenMonify();
  
    try {
      const response = await axios.get(`${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single/summary?transactionReference=${transactionReference}`, {
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

  
  
  
  async  updateTransactionStatusCronJobWebHook(transaction, status) {
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
          prospectiveTenantId:transaction.userId,
        });

      }
     

      console.log(`Transaction ${transaction.transactionReference} updated to ${status}`);
    } catch (error) {
      console.error('Error updating transaction:', error.message);
    }
  }



  async  updateTransactionStatusCronJobSingleTransfer(transaction, status) {
    try {
      transaction.paymentStatus = status;
      await transaction.save();

      if(status=="SUCCESS"&&transaction.transactionType=='commissionOrRent'){

        const TenantModelResult=await this.TenantModel.findOne({
          where:{
            buildingId:transaction.buildingId
          }
        })
        
        if(!TenantModelResult||TenantModelResult.status=='terminated'){

          this.TenantModel.create({
            buildingId:transaction.buildingId,
            prospectiveTenantId:transaction.prospectiveTenantId,
            status:'active',
            rentNextDueDate:userService.calculateRentNextDueDate(BuildingModelResult.rentalDuration)
          })
        }

      }
     
    } catch (error) {
      console.error('Error updating transaction:', error.message);
    }
  }


  async checktransactionUpdateWebHook() {

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

          const transactionStatus = await this.getTransactionStatus(transaction.transactionReference);
  
          if (transactionStatus) {
            await this.updateTransactionStatusCronJobWebHook(transaction, transactionStatus.paymentStatus);
          }
        }
      } else {
        console.log('No pending or unverified transactions found');
      }
    } catch (error) {
      console.error('Error during cron job:', error.message);
    }
  }

  async checktransactionUpdateSingleTransfer() {

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

          const transactionStatus = await this.getTransactionStatusSingleTransfer(transaction.transactionReference, authToken);
  
          if (transactionStatus) {
            await this.updateTransactionStatusCronJobSingleTransfer(transaction, transactionStatus.paymentStatus);
          }
        }
      } else {
        console.log('No pending or unverified transactions found');
      }
    } catch (error) {
      console.error('Error during cron job:', error.message);
    }
  }

  async updateRefundStatusCronJob(refund, responseBody) {
    try {

      if (responseBody.refundStatus=="COMPLETED") {

        const RefundLogModelResult = await this.RefundLogModel.findByPk(responseBody.refundReference);
        await RefundLogModelResult.update({
          refundStatus: 'COMPLETED'
        });


        const inspection = await this.InspectionModel.findOne({
          where: { transactionReference: responseBody.transactionReference, isDeleted: false }
        });

        if(RefundLogModelResult.role=='list'){

          await inspection.update({
            inspectionStatus: 'refunded',
            note:refundResponse.responseBody.refundReason,
            propertyManagerStatus:false
          });
        }else{
          await inspection.update({
            inspectionStatus: 'refunded',
            note:refundResponse.responseBody.refundReason,
            tenentStatus:false
          });
        }

      } 
      else {
        refund.update({
          refundStatus:refundResponse.responseBody.refundStatus
        })
      }
  
    } catch (error) {
      console.error('Error updating refund:', error.message);
    }
  }

  /*
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
  }*/
  

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
          const refundStatus = await this.getRefundTransactionStatus(refund.refundTransactionReference);
  
          if (refundStatus) {
            await this.processRefund(refundStatus);
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

    }
    else if(type=="rent") {
      user =  await this.ProspectiveTenantModel.findOne({
        where: {
          emailAddress, 
          isEmailValid:true,
          isDeleted:false
        }
      });  
    }
    else{
      user =  await this.AdminModel.findOne({
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
    else if(validateFor=='rent'){
      relatedUser = await this.ProspectiveTenantModel.findOne({
        where: { id: relatedEmailoRTelValidationCode.userId },
      });
    }
    else{
      relatedUser = await this.AdminModel.findOne({
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
      else if(type==='nin'){

        relatedUser.update({
          isNINValid: true,
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

        relatedEmailoRTelValidationCode.update({
          expiresIn: new Date(),
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


  async  sendNINVerificationCode(phone, userId, validateFor) {

    try {
      
        var keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
        const verificationCode = Math.floor(Math.random() * 900000) + 100000;
  
        await this.EmailandTelValidationModel.upsert({
          userId,
          type: 'nin',
          validateFor,
          verificationCode,
          expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
        }, {
          where: {
            userId,
            validateFor
          }
        });
        
        const apiUrl = `http://smslive247.com.ng/components/com_smsreseller/smsapi.php?username=${serverConfig.SMS_USER_NAME}&password=${serverConfig.SMS_PASSWORD}&sender=YourSenderID&recipient=${phone}&message=Your NIN verification code is ${verificationCode}`;

        try {
              
          const response = await axios.get(apiUrl);

          if (response.status === 200) {
            console.log('SMS sent successfully');
          } 
          else {
            console.log('Failed to send SMS:', response.data);
          }

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
  
  async cronJobToUpdateDisbursement() {
    try {
      const transactions = await this.TransactionModel.findAll({
        where: {
          transactionType: ['firstRent', 'commission', 'rent'],
          paymentStatus: ['PENDING', 'unverified']
        }
      });
  
      if (transactions.length === 0) {
        console.log("No pending or unverified transactions found.");
        return;
      }
  
      for (const transaction of transactions) {
        try {
          // Fetch transaction status from the disbursement API
          const transactionStatus = await this.getTransactionStatusDisbursement(transaction.paymentReference);
  
          // Process the disbursement status
          await this.handleDisbursement(transactionStatus);
  
          // Update the transaction status if necessary
         /* if (transactionStatus.paymentStatus !== transaction.paymentStatus) {
            await transaction.update({
              paymentStatus: transactionStatus.paymentStatus
            });
            console.log(`Transaction ${transaction.id} updated to ${transactionStatus.paymentStatus}`);
          }*/
  
        } catch (error) {
          console.error(`Error processing transaction ${transaction.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Error running cron job for disbursement:", error);
    }
  }


  // Cron job function to process inspections
async  startFirstRentDisbursements() {

  try {  

    const settings = await this.SettingModel.findOne({ where: { isDeleted: false } });
    const retryTimeInSeconds = settings?.failedDisburseRetry ? parseInt(settings.failedDisburseRetry) : 1800;  // Default to 1800 seconds if not found
    const pendingDisburseRetry = settings?.pendingDisburseRetry ? parseInt(settings.pendingDisburseRetry) : 1800;


      // Fetch inspections that meet the criteria: agentPaidStatus and landlordPaidStatus are true, and inspectionStatus is "accepted"
      const inspections = await this.InspectionModel.findAll({
          where: {
            tenentStatus: true,
            propertyManagerStatus: true,
            inspectionStatus: 'accepted',
            isDeleted: false
          }
      });

      //console.log(inspections)

      // Loop through each inspection to process its disbursement
      for (const inspection of inspections) {
          // Find the relevant building
          const building = await this.BuildingModel.findOne({
              where: { id: inspection.buildingId, isDeleted: false }
          });

          // Ensure the building exists
          if (!building) continue;

          // Fetch property manager related to the building
          const propertyManager = await this.PropertyManagerModel.findByPk(building.propertyManagerId);

          const doesTransactionExist = await this.TransactionModel.findOne({
            where: {
                inspectionId: inspection.id,
                isDeleted: false,
                transactionType: {
                  [Op.or]: ['firstRent', 'commission']
                }
            },
            order: [['createdAt', 'DESC']]
          });

          if(!doesTransactionExist){

            await this.processDisbursement(propertyManager, inspection);

          }
          else{

              // Check if there is an existing successful transaction for this inspection
              const existingTransaction = await this.TransactionModel.findOne({
                where: {
                    inspectionId: inspection.id,
                    paymentStatus: {
                      [Op.in]: [TRANSACTION_STATUS.PAID, TRANSACTION_STATUS.OVERPAID, TRANSACTION_STATUS.PARTIALLY_PAID]
                    },
                    transactionType: {
                      [Op.or]: ['firstRent', 'commission']
                    },
                    isDeleted: false
                }
              })

              if(!existingTransaction){

            
                const failedTransaction = await this.TransactionModel.findOne({
                  where: {
                      inspectionId: inspection.id,
                      paymentStatus:  {
                        [Op.or]: ['FAILED', 'FAILED', 'EXPIRED']
                      }, 
                      isDeleted: false,
                      createdAt: {
                        [Op.lte]: new Date(new Date() - retryTimeInSeconds * 1000)  // More than 30 minutes old
                      },
                      transactionType: {
                        [Op.or]: ['firstRent', 'commission']
                      }
                  },
                  order: [['createdAt', 'DESC']]
                });
      
                if(failedTransaction){
    
                  await this.processDisbursement(propertyManager, inspection);
                }
                else{

                  const pendingTransaction = await this.TransactionModel.findOne({
                    where: {
                        inspectionId: inspection.id,
                        paymentStatus: 'PENDING', // Only process if pending or failed
                        isDeleted: false,
                        createdAt: {
                          [Op.lte]: new Date(new Date() - pendingDisburseRetry * 1000)  // More than 30 minutes old
                        },
                        transactionType: {
                          [Op.or]: ['firstRent', 'commission']
                        }
                    },
                    order: [['createdAt', 'DESC']]
                  });

                  if(pendingTransaction){
    
                    await this.processDisbursement(propertyManager, inspection);
                  }
                  

                }
              
              }
          }
  
       
        

      }
  } catch (error) {
      console.error('Error in disbursement cron job:', error);
  }
}

// Disbursement processing function
async  processDisbursement(propertyManager, inspection) {

  try {


      // Get amount from the related transaction for this inspection
      const transaction = await this.TransactionModel.findOne({
          where: { 
            transactionReference: inspection.transactionReference,
            isDeleted: false ,
            paymentStatus:'PAID',
          }
      });


      if (!transaction) return; // Skip if no related transaction

      const amount = transaction.amount;

      const authToken = await this.getAuthTokenMonify();

      // Check if the property manager is a landlord or agent and proceed accordingly
      if (propertyManager.type === 'landLord' && inspection.landlordPaidStatus === false) {


          const paymentReference = "firstRent_" + this.generateReference();

          // Create the transaction record in the database
          await this.TransactionModel.create({
              userId: inspection.prospectiveTenantId,
              inspectionId: inspection.id,
              buildingId: inspection.buildingId,
              amount: amount,
              paymentReference,
              transactionType: 'firstRent',
              paymentStatus: 'PENDING' // Initially set to PENDING
          });

          // Calculate the landlord share
          const transferDetails = {
              amount: this.calculateDistribution(amount, 'landlord', false, 'initial deposit').landlordShare,
              reference: paymentReference,
              narration: 'Rent Payment',
              destinationBankCode:propertyManager.landlordBankCode,
              destinationAccountNumber: propertyManager.landlordBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC,
              async: true     
          };
  
          // Initiate the transfer
          await this.initiateTransfer(authToken, transferDetails);

      } 
      else if (propertyManager.type === 'agent' && inspection.agentPaidStatus === false) {
          // Handle agent and landlord distribution
          const landlordReference = "firstRent_" + this.generateReference();
          const agentReference = "commission_" + this.generateReference();

          // Create two transactions: one for the landlord and one for the agent
          await this.TransactionModel.create({
              userId: inspection.prospectiveTenantId,
              inspectionId: inspection.id,
              buildingId: inspection.buildingId,
              amount: this.calculateDistribution(amount, 'landlord', true, 'initial deposit').landlordShare,
              paymentReference: landlordReference,
              transactionType: 'firstRent',
              paymentStatus: 'PENDING' // Initially set to PENDING
          });

          await this.TransactionModel.create({
              userId: inspection.prospectiveTenantId,
              inspectionId: inspection.id,
              buildingId: inspection.buildingId,
              amount:  this.calculateDistribution(amount, 'landlord', true, 'initial deposit').agentShare,
              paymentReference: agentReference,
              transactionType: 'commission',
              paymentStatus: 'PENDING'
          });

          // Transfer to landlord
          const landlordDetails = {
              amount: this.calculateDistribution(amount, 'landlord', true, 'initial deposit').landlordShare,
              reference: landlordReference,
              narration: 'Rent Payment ',
              destinationBankCode: propertyManager.landlordBankCode,
              destinationAccountNumber: propertyManager.landlordBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC,
              async: true
          };

          // Transfer to agent
          const agentDetails = {
              amount: this.calculateDistribution(amount, 'landlord', true, 'initial deposit').agentShare,
              reference: agentReference,
              narration: 'Commission Payment',
              destinationBankCode: propertyManager.agentBankCode,
              destinationAccountNumber: propertyManager.agentBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC,
              async: true
          };

          await this.initiateTransfer(authToken, landlordDetails);
          await this.initiateTransfer(authToken, agentDetails);
      }

  } catch (error) {
      console.error('Error processing disbursement:', error);
  }
}

// Initiate transfer function (unchanged)
async  initiateTransfer(token, transferDetails) {
  try {
      const response = await axios.post(
          `${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single`,
          transferDetails,
          {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          }
      );
      return response.data;
  } catch (error) {
      console.error('Error during transfer:', error);
      throw error;
  }
}

// Calculate distribution function (unchanged)
calculateDistribution(amount, type, hasAgent, paymentType) {
  let landlordShare = 0;
  let agentShare = 0;
  let appShare = 0;

  amount = parseFloat(amount.toFixed(2));
  if (paymentType === 'initial deposit') {
      if (hasAgent) { 
          agentShare = amount * 0.10;
          appShare = amount * 0.05;
          landlordShare = amount - agentShare - appShare;
      } else {
          appShare = amount * 0.05;
          landlordShare = amount - appShare;
      }
  } 
  else if (paymentType === 'rent') {
      appShare = amount * 0.05;
      landlordShare = amount - appShare;
  }

  return {
    landlordShare: parseFloat(landlordShare.toFixed(2)),
    agentShare: parseFloat(agentShare.toFixed(2)),
    appShare: parseFloat(appShare.toFixed(2))
  };
}

 async rentDisbursements(){

    const settings = await this.SettingModel.findOne(); // Fetch settings from the database
    const pendingDisburseRentRetry = settings?.pendingDisburseRentRetry ? settings.pendingDisburseRentRetry : 1800;  // Default to 1800 seconds if not found


    const unpaidTransactions = await this.TransactionModel.findAll({
      where: {
        transactionType: 'rent',
        paymentStatus: {
          [Op.notIn]: ['PAID', 'OVERPAID']
        }
      }
    });

    for(const unpaidTransaction of unpaidTransactions){

      if(unpaidTransaction.paymentStatus===TRANSACTION_STATUS.ABANDONED
        ||unpaidTransaction.paymentStatus===TRANSACTION_STATUS.CANCELLED
        ||unpaidTransaction.paymentStatus===TRANSACTION_STATUS.FAILED
        ||unpaidTransaction.paymentStatus===TRANSACTION_STATUS.REVERSED
        ||unpaidTransaction.paymentStatus===TRANSACTION_STATUS.EXPIRED
      ){

        const BuildingModelResult=await this.BuildingModel.findOne({
          where: {
            id:unpaidTransaction.buildingId
          }
        })
  
        this.disburseRent(BuildingModelResult,unpaidTransaction.userId)
  
      }
      else if(unpaidTransactions.paymentStatus===TRANSACTION_STATUS.PENDING){

        if(new Date(unpaidTransaction.createdAt) < new Date(new Date() - pendingDisburseRentRetry * 1000)){
          
          const BuildingModelResult=await this.BuildingModel.findOne({
            where: {
              id:unpaidTransaction.buildingId
            }
          })
    
          this.disburseRent(BuildingModelResult,unpaidTransaction.userId)
    
        }
      
      }
    }

   



  }


  generateReference() {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric string
  
    return `REF-${timestamp}-${randomString}`;
  }
  


  async cronJobToUpdateDueRent(){
    try {
      // Get current date
      const currentDate = new Date();
  
      // Find tenants whose status is not 'terminated' and rentNextDueDate is not null
      const tenants = await this.TenantModel.findAll({
        where: {
          status: {
            [Op.ne]: 'terminated', // Not terminated tenants
          },
          isDeleted: false, // Exclude deleted tenants if applicable
        },
      });
  
      // Loop through the tenants and check if rent is due
      for (let tenant of tenants) {
        if (tenant.rentNextDueDate <= currentDate) {
          // Update the status to 'rentDue' if rentNextDueDate is in the past
          tenant.status = 'rentDue';
          await tenant.save(); // Save the changes
        }
      }
  
    } catch (error) {
      console.error('Error updating rent status:', error);
    }
  }

  async checkRefund(){

    try {

      const settings = await this.SettingModel.findOne(); // Fetch settings from the database
      const retryDelay = settings?.failedRefundRetry ? settings.failedRefundRetry : 1800;  // Default to 1800 seconds if not found

      // Fetch all inspections that are not refunded and have either tenant or property manager status as false
      const inspectionsToRefund = await this.InspectionModel.findAll({
        where: {
          inspectionStatus: { [Op.not]: 'refunded' },
          [Op.or]: [
            { propertyManagerStatus: false },
            { tenentStatus: false }
          ],
          isDeleted: false
        }
      });
  
      for (const inspection of inspectionsToRefund) {
        // Check if a refund has already been initiated for this inspection
        const refundExists = await this.RefundLogModel.findOne({
          where: {
            oldTransactionReference: inspection.transactionReference,
            isDeleted: false
          }
        });
  
        // Check if a refund was already attempted
      if (refundExists) {
        const refundStatus = refundExists.refundStatus;

        // If the refund has failed and the delay time has passed, retry the refund
        if (refundStatus === 'FAILED' && Date.now() - new Date(refundExists.updatedAt) >= retryDelay * 1000) {
          await this.handleRefund(inspection);
        }
      } else {
        // If no refund log exists, initiate the refund
        await this.handleRefund(inspection);
      }
  
      }
  
    } catch (error) {
      console.error('Error in refund cron job:', error);
    }
  }



  async  handleRefund(inspection) {

    try {
      const transactionResult = await this.TransactionModel.findOne({
        where: {
          transactionReference: inspection.transactionReference,
          isDeleted: false
        }
      });
  
      const prospectiveTenantResult = await this.ProspectiveTenantModel.findOne({
        where: {
          id: inspection.prospectiveTenantId,
          isDeleted: false
        }
      });
  
      const transactionReference = this.generateReference();
  
      // Create a new refund log if it doesn't exist
        await this.RefundLogModel.create({
          oldTransactionReference: inspection.transactionReference,
          refundTransactionReference: "refund_inspection" + "_" + transactionReference,
          inspectionId: inspection.id,
          buildingId: inspection.buildingId,
          refundReason:inspection.refundReason,
          prospectiveTenantId: inspection.prospectiveTenantId,
        });
      
  
      const authToken = await this.getAuthTokenMonify();
  
      const refundMetaData = {
        transactionReference: inspection.transactionReference,
        refundReference: "refund_inspection" + "_" + transactionReference,
        refundAmount: transactionResult.amount,
        refundReason: inspection.refundReason,
        customerNote: inspection.refundReason,
        destinationAccountNumber: prospectiveTenantResult.bankAccount,
        destinationAccountBankCode: prospectiveTenantResult.bankCode
      };
  
      await this.initiateRefund(refundMetaData, authToken);
  
    
    } catch (error) {
      console.error('Error handling refund:', error);
    }
  }

  async  initiateRefund(refundMetaData, authToken) {
    const refundPayload = {
      transactionReference: refundMetaData.transactionReference,
      refundReference:refundMetaData.refundReference , //: `REFUND-${Date.now()}`, 
      refundAmount: refundMetaData.refundAmount, 
      refundReason: refundMetaData.refundReason, 
      customerNote:refundMetaData.customerNote,
      destinationAccountNumber: refundMetaData.destinationAccountNumber, // Assuming this field exists
      destinationAccountBankCode: refundMetaData.destinationAccountBankCode // Assuming this field exists
    };
  
    try {
      const refundResponse = await axios.post(`${serverConfig.MONNIFY_BASE_URL}/api/v1/refunds/initiate-refund`, refundPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`, // Replace with actual token generation logic
          'Content-Type': 'application/json'
        }
      });
  
      return refundResponse.data;
    } catch (error) {
      // Log or rethrow the error for further handling
      throw new Error('Refund request failed: ' + error.message);
    }
  }
  



  /*ADD THE BELOW TO CRON JOB */
  //checkRefundUpdate
  //cronJobToUpdateDueRent
  //cronJobToUpdateDisbursement
  
}

export default new AuthenticationService();
