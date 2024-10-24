import authService from "../../service/auth.service.js";
import serverConfig  from "../../config/server.js";
import crypto from 'crypto';


export default class AuthenticationController {



  
  constructor(){
    this.filterObject=this.filterObject.bind(this)
    this.signupUser=this.signupUser.bind(this)
  }
    

  async verifyEmailorTelAdmin(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }
      

      await authService.handleVerifyEmailorTelAdmin(my_bj);


      return res.status(200).json({
        status: 200,
        message: "verification successful",
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  
  async verifyEmailorTel(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }

      const user = await authService.handleVerifyEmailorTel(my_bj);

      const generateTokenFrom={id:user.dataValues.id,role:user.dataValues.role}

      const token = await authService.generateToken(generateTokenFrom);

      const excludedProperties = ['isDeleted', 'password'];

      const modifiedUser = Object.keys(user.dataValues)
        .filter(key => !excludedProperties.includes(key))
        .reduce((acc, key) => {
          acc[key] = user.dataValues[key];
          return acc;
        }, {});


      return res.status(200).json({
        status: 200,
        message: "verification completed",
        data: { user: modifiedUser, token },
      });

    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
 
  
  
  async signupUser(req, res, next) {

    try {

      const data = req.body;        
      
      const my_bj = {
        ...data,
      }      

      const result=await authService.handleUserCreation(my_bj);

      const keysToRemove = ['password'];

      const filteredUser = this.filterObject(result.dataValues, keysToRemove);

      return res.status(200).json({
        status: 200,
        message: "user registered successfully",
        data:filteredUser,
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  

  filterObject(obj, keysToRemove) {

    console.log(obj)
    console.log(keysToRemove)

    return Object.keys(obj)
    .filter(key => !keysToRemove.includes(key))
    .reduce((filteredObj, key) => {
        filteredObj[key] = obj[key];
        return filteredObj;
    }, {});
        
  }
  
  async googleCallback(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
      
        const my_bj = {
          ...data,
        }
                          
        await authService.handleGoogleCallback(my_bj);

        return res.status(200).json({
          status: 200,
          message: "updated sucessfully",
        });
      
     
    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  async updateTel(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
      
        const my_bj = {
          ...data,
        }
                          
        await authService.handleUpdateTel(my_bj);

        return res.status(200).json({
          status: 200,
          message: "updated sucessfully",
        });
      
     
    } catch (error) {
      console.log(error)
      next(error);
    }
  }

  async loginUser(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }
      
      const user=await authService.handleLoginUser(my_bj);
    
      console.log(" user  user  user")
      console.log(" user  user  user")

      console.log(user)

      console.log(" user  user  user")
      console.log(" user  user  user")

      if (!user){
        return res.status(400).json({
          status: 400,
          message: "Invalid login credentials",
        });
      }
      else if(user == "disabled"){
        return res.status(400).json({
          status: 400,
          message: "Your account has been disabled",
        });
      }
      

      let generateTokenFrom={id:user.dataValues.id,role:user.dataValues.role}

      const token = await authService.generateToken(generateTokenFrom);

      const excludedProperties = ['isDeleted', 'password'];



      const modifiedUser = Object.keys(user.dataValues)
        .filter(key => !excludedProperties.includes(key))
        .reduce((acc, key) => {
          acc[key] = user.dataValues[key];
          return acc;
        }, {});
        
      return res.status(200).json({
        status: 200,
        message: "login successfully.",
        data: { user: modifiedUser, token },
      });

    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  async loginAdmin(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }
      
      const user=await authService.handleLoginAdmin(my_bj);
    
      if (user == null){
        return res.status(400).json({
          status: 400,
          message: "Invalid login credentials",
        });
      }
      else if(user == "disabled"){
        return res.status(400).json({
          status: 400,
          message: "Your account has been disabled",
        });
      }
      
      const token = await authService.generateToken(user.dataValues);


      return res.status(200).json({
        status: 200,
        message: "login successfully  new.",
        data: { user: {...user.dataValues}, token },
      });
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
   


  
  async sendPasswordResetLink(
    req,
    res,
    next
  ) {
    try {

      
      await authService.handleSendPasswordResetLink(req.body);
      return res.status(200).json({
        status: 200,
        message: "A reset link was sent to your email"
      });
    } catch (error) {
      next(error);
    }
  }



  
  async authorizeTransfer(
    req,
    res,
    next
  ) {
    try {

      
      await authService.authorizeTransfer(req.body);

      return res.status(200).json({
        status: 200,
        message: "web hook received successufully"
      })
    } catch (error) {
      next(error);
    }
  }

    
  async webHookMonifyDisbursement(
    req,
    res,
    next
  ) {
    try {

      await authService.handleWebHookMonifyDisbursement(req.body);

      return res.status(200).json({
        status: 200,
        message: "web hook received successufully"
      })
    } catch (error) {
      next(error);
    }
  }


  async webHookMonifyRefund(
    req,
    res,
    next
  ) {
    try {

      await authService.handleWebHookMonifyRefund(req.body);

      return res.status(200).json({
        status: 200,
        message: "web hook received successufully"
      })
    } catch (error) {
      next(error);
    }
  }




  async webHookCollectionMonify(
    req,
    res,
    next
  ) {
    try {

      await authService.handleWebHookCollectionMonify(req.body);

      return res.status(200).json({
        status: 200,
        message: "web hook received successufull"
      })
    } catch (error) {
      next(error);
    }
  }



  
  async intializePayment(
    req,
    res,
    next
  ) {
    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }

      await authService.handleIntializePayment(my_bj);

      return res.status(200).json({
        status: 200,
        message: "successufull"
      });
      
    } catch (error) {
      next(error);
    }
  }


  
  async pingme(
    req,
    res,
    next
  ) {
    try {

      return res.status(200).json({
        status: 200,
        message: "successufully ping",
      });

    } catch (error) {
      next(error);
    }
  }
  
  async validateBankAccount(
    req,
    res,
    next
  ) {
    try {


      const data = req.body;        

      let my_bj = {
        ...data,
      }
      
      const result=await authService.handleValidateBankAccount(my_bj);

      return res.status(200).json({
        status: 200,
        message: "successufull",
        data:result
      });

    } catch (error) {
      next(error);
    }
  }



  async resetPassword(
    req,
    res,
    next
  ) {
    try {
      await authService.handleResetPassword(req.body);


      return res.status(200).json({
        status: 200,
        message: "Password updated successufully"
      });
    } catch (error) {
      next(error);
    }
  }
  
  async sendVerificationCodeEmailOrTel(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }

      await authService.handleSendVerificationCodeEmailOrTel(my_bj);
  

      if(data.type=='email'){
        return res.status(200).json({
          status: 200,
          message: "verification code sent to your email address",
        });
      }
      else{
        return res.status(200).json({
          status: 200,
          message: "verification code sent to your number",
        });
      }
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

/*
  async sendVerificationCodeEmailOrTel(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }

      const obj = await authService.handleSendVerificationCodeEmailOrTel(my_bj);
  

      if(data.type=='email'){
        return res.status(200).json({
          status: 200,
          message: "verification code sent you email address",
        });
      }
      else{
        return res.status(200).json({
          status: 200,
          message: "verification code sent you number",
        });
      }
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
*/
  
  async uploadPicture(req, res, next) {

    try {
      
      const data = req.body;        
      const { file } = req;
      
      let my_bj = {
        ...data,
        image:{
          size:file?.size
        }
      }


    const user=await authService.handleUploadPicture(my_bj,file);


      const token = await authService.generateToken(user.dataValues);

      const excludedProperties = ['isDeleted', 'password'];

      const modifiedUser = Object.keys(user.dataValues)
        .filter(key => !excludedProperties.includes(key))
        .reduce((acc, key) => {
          acc[key] = user.dataValues[key];
          return acc;
        }, {});

    return res.status(200).json({
      status: 200,
      message: "verification successful.",
      data: { user: modifiedUser, token },
    });
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  validateMonnifyIP = (req, res, next) => {


    let clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

    if (clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }

    console.log("clientIP")

    console.log(clientIP !== serverConfig.MONNIFY_IP)
    console.log(clientIP !== serverConfig.MONNIFY_IP)
    console.log(serverConfig.MONNIFY_IP)
    console.log(clientIP)

    console.log("clientIP")



    if (clientIP !== serverConfig.MONNIFY_IP) {
      return res.status(403).send('Unauthorized IP');
    }  
    next();
  };

  /*
  validateTransactionHash = (req, res, next) => {

    try {
      const monnifySignature = req.headers['monnify-signature'];
      if (!monnifySignature) {
        return res.status(400).send('Missing Monnify signature');
      }
  


      console.log("req.body")
      console.log("req.body")
      console.log("req.body")
      console.log("req.body")

      console.log(req.body)
      console.log("req.body")
      console.log("req.body")
      console.log("req.body")
      console.log("req.body")


      const payload = JSON.stringify(req.body);


      console.log("payload")
      console.log("payload")
      console.log("payload")
      console.log("payload")
      console.log("payload")


      console.log(payload)
      console.log("payload")
      console.log("payload")
      console.log("payload")
      console.log("payload")
      console.log("payload")

      const computedHash = crypto
        .createHmac('sha512', process.env.CLIENT_SECRET_MONIFY)
        .update(payload)
        .digest('hex');
  
      console.log('Computed Hash:', computedHash);
      console.log('Monnify Signature:', monnifySignature);
  
      if (computedHash !== monnifySignature) {
        return res.status(400).send('Invalid signature');
      }
  
      next();
    } catch (error) {
      console.error('Error in validateTransactionHash:', error);
      res.status(500).send('An unexpected error occurred');
    }
  };*/

  validateTransactionHash = (req, res, next) => {
    try {
      const monnifySignature = req.headers['monnify-signature'];
      if (!monnifySignature) {
        return res.status(400).send('Missing Monnify signature');
      }
  
      const clientSecret = serverConfig.MONNIFY_CLIENT_SECRET;
      if (!clientSecret) {
        console.error('CLIENT_SECRET_MONIFY is not set in the environment variables');
        return res.status(500).send('Server configuration error');
      }
  
      const payload = JSON.stringify(req.body);
      
      // Use require('crypto').createHmac for Node.js environments
      const computedHash = crypto.createHmac('sha512', clientSecret)
        .update(payload)
        .digest('hex');
  
      console.log('Computed Hash:', computedHash);
      console.log('Monnify Signature:', monnifySignature);
  
      if (computedHash !== monnifySignature) {
        return res.status(400).send('Invalid signature');
      }
  
      next();
    } catch (error) {
      console.error('Error in validateTransactionHash:', error);
      res.status(500).send('An unexpected error occurred');
    }
  };


}
















/*this.sendEmailVerificationCode
      this.sendEmailVerificationCode(obj.emailAddress,obj.id)

async  sendEmailVerificationCode(emailAddress, userId) {

    var keyExpirationMillisecondsFromEpoch = new Date().getTime() + 30 * 60 * 1000;
    const validationCode  = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    console.log(keyExpirationMillisecondsFromEpoch)
    console.log(validationCode)


    await this.PasswordResetModel.findOrCreate({
      where: {
        userId
      },
      defaults: {
        userId,
        type: 'email',
        validationCode,
        expiresIn: new Date(keyExpirationMillisecondsFromEpoch),
      },
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



  }
      */