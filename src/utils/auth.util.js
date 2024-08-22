import Joi from "joi";

class authUtil {



  verifyUserCreationData1= Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    publicKey: Joi.string().required(),
    emailAddress: Joi.string().email().required(),
    password: Joi.string().required(),
    type: Joi.string().valid(
      'parent',
    ).required(),

  });


  verifyUserCreationData2= Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    publicKey: Joi.string().required(),
    parentUserId: Joi.number().required(),
    emailAddress: Joi.string().email().required(),
    password: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    type: Joi.string().valid(
      'child'
    ).required(), 
  });
  
   

    verifyHandleVerifyEmailorTel= Joi.object({
      userId: Joi.number().required(),
      verificationCode: Joi.number().required(),
      type: Joi.string().valid(
        'email',
        'tel'
      ).required()
    });

    verifyHandleSendVerificationCodeEmailOrTel= Joi.object({
      userId: Joi.number().required(),
      type: Joi.string().required()
    });
    
    verifyHandleUploadPicture= Joi.object({
      userId: Joi.number().required(),
      image: Joi.object({
        size: Joi.number().max(1048576).required(), // Maximum size allowed is 1MB (1048576 bytes)
      }).required(),
    });

    
    verifyHandleLoginAdmin= Joi.object({
      password: Joi.string().required(),
      emailOrTel: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
      ),
    });

    verifyHandleUpdateTel= Joi.object({
      userId: Joi.number().required(),
      tel: Joi.number().required(),
    });


    verifyHandleLoginUser= Joi.object({
      password: Joi.string().required(),
      emailAddress: Joi.string().email().required()
    });
    
    validateUserEmail  = Joi.object({
      emailOrPhone: Joi.alternatives().try(
        Joi.string().email(), 
        Joi.number(), 
      ).required(),
      type: Joi.string().valid(
        'user',
        'admin',
        'business'
      ).required(),
    });
 

    
  validatePasswordReset = Joi.object().keys({
    password: Joi.string().min(6).required(),
    resetPasswordKey: Joi.string().min(1).required(),
  });
}

export default new authUtil();
