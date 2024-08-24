import { 
  EmailandTelValidation,
  PropertyManager,
  Tenant
} from "../db/models/index.js";
import userUtil from "../utils/user.util.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize } from "sequelize";
import mailService from "../service/mail.service.js";
import crypto from 'crypto';


import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";

class UserService {

  EmailandTelValidationModel=EmailandTelValidation
  PropertyManagerModel=PropertyManager
  TenantModel=Tenant



  async handleUpdateProfile(data,file) {


    if(data.role=='list'){
      let { 
        userId,
        role,
        image,
        ...updateData
      } = await userUtil.verifyHandleUpdateProfile.validateAsync(data);
          f
      try {
        let imageUrl=''
        if(file){
      
          if(serverConfig.NODE_ENV == "production"){
            imageUrl =
            serverConfig.DOMAIN +
            file.path.replace("/home", "");
          }
          else if(serverConfig.NODE_ENV == "development"){
      
            imageUrl = serverConfig.DOMAIN+file.path.replace("public", "");
          }
    
        }


  
          if(file){

    
            await this.PropertyManagerModel.update({image:imageUrl  ,...updateData}, { where: { id: userId } });

  
          }else{

            await this.PropertyManagerModel.update(updateData, { where: { id: userId } });

          }

      } catch (error) {
        throw new SystemError(error.name,  error.parent)
      }
  
  
    }else{

      let { 
        userId,
        role,
        ...updateData
      } = await userUtil.verifyHandleUpdateProfile.validateAsync(data);
  

      await this.TenantModel.update({image:imageUrl  ,...updateData}, { where: { id: userId } });


    }


  }


  async handleSubmitTask(data,file) {
    let { 
      userId,
      taskId,
      reponse,
    } = await userUtil.verifyHandleSubmitTask.validateAsync(data);

      let imageUrl=''
      if(file){
    
        if(serverConfig.NODE_ENV == "production"){
          imageUrl =
          serverConfig.DOMAIN +
          file.path.replace("/home", "");
        }
        else if(serverConfig.NODE_ENV == "development"){
    
          imageUrl = serverConfig.DOMAIN+file.path.replace("public", "");
        }
    
        
      }

      const  result=await this.TaskReponseModel.findOne({
        where:{
          userId,
          taskId
        }
      })

      const  result2=await this.TaskModel.findOne({
        where:{
          id:taskId
        }
      })

      const  result3=await this.AsignTaskModel.findOne({
        where:{
          taskId,
          userId
        }
      })

      
      if (result) throw new BadRequestError("Only 1 response is allowed");
      if (!result2||!result3) throw new BadRequestError("No task found ");


      try {

      if(imageUrl!=''){
        await this.TaskReponseModel.create({
          userId:userId,
          reponse,
          taskId,
          TaskResponseImage:imageUrl,
        });
      }else{
        await this.TaskReponseModel.create({
          userId:userId,
          taskId,
          reponse
        });
      }


     
        
      } catch (error) { 
        throw new SystemError(error.name,  error.parent)

      }


  }
  


  async  sendEmailVerificationCode(emailAddress, userId ,password) {

    try {
      
        let keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
        const verificationCode =Math.floor(Math.random() * 9000000) + 100000;
    
        await this.EmailandTelValidationAdminModel.upsert({
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

          const params = new URLSearchParams();
                params.append('userId', userId);
                params.append('verificationCode',verificationCode);
                params.append('type', 'email');

            
            await mailService.sendMail({ 
              to: emailAddress,
              subject: "Account details and verification",
              templateName: "adminWelcome",
              variables: {
                password,
                email: emailAddress,
                domain: serverConfig.DOMAIN,
                resetLink:serverConfig.NODE_ENV==='development'?`http://localhost/COMPANYS_PROJECT/verifyEmail.html?${params.toString()}`: `${serverConfig.DOMAIN}/adminpanel/PasswordReset.html?${params.toString()}`
              },
            });
    
        } catch (error) {
            console.log(error)
        }
    
    
    } catch (error) {
      console.log(error);
    }

  }

  async generateRandomPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }


}

export default new UserService();

//