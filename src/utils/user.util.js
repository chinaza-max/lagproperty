import Joi from "joi";

class UserUtil {


  verifyHandleUpdateProfileList=Joi.object({
    userId: Joi.number().required().label('user Id'),
    role: Joi.string().required().valid(
      'rent',
      'list'
    ),
    firstName: Joi.string().required().label('First Name'),
    lastName: Joi.string().required().label('Last Name'),
    tel: Joi.number().required().label('Telephone Number'),
    telCode: Joi.string().required().label('Telephone Code'),
    lasrraId: Joi.string().required().label('LASRRA ID'),
    nin: Joi.number().required().label('NIN'),
    country: Joi.string().required().label('Country'),
    state: Joi.string().required().label('State'),
    lga: Joi.string().required().label('LGA'),
    image: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }).optional(),
    type: Joi.string().valid('landLord', 'agent', 'unset').required().label('Type'),
  
    agentBankCode: Joi.string().when('type', {
      is: 'agent',
      then:Joi.required().label('Agent Bank Code') ,
      otherwise:  Joi.forbidden(),
    }),
  
    agentBankAccount: Joi.string().when('type', {
      is: 'agent',
      then:Joi.required().label('Agent Bank Account'),
      otherwise: Joi.forbidden(), 
    }),

    landlordBankCode: Joi.string().required().label('Landlord Bank Code'),
    landlordBankAccount:Joi.required().label('Landlord Bank Account'),
    companyName: Joi.string().required().label('Company Name'),
    agentRegistrationNO: Joi.string().required().label('Agent Registration Number'),
  });

  verifyHandleUpdateProfileRent= Joi.object({
    tel: Joi.number().integer().optional(),
    telCode: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    maritalStatus: Joi.string().required(),
    gender: Joi.string().valid('Male', 'Female').optional().allow(''),
    dateOfBirth: Joi.date().required(),
    lasrraId: Joi.string().optional(),
    familySize: Joi.number().integer().required(),
    rentalDuration: Joi.string().required(),
    budgetMin: Joi.number().integer().required(),
    budgetMax: Joi.number().integer().required(),
    occupation: Joi.string().required(),
    country: Joi.string().required(),
    stateOfOrigin: Joi.string().required(),
    nin: Joi.number().integer().required(),
    bankCode: Joi.string().required(),
    bankAccount: Joi.string().required(),
    propertyPreference: Joi.string().valid('all', 'flats', 'duplex', 'selfContains', 'roomAndParlour').required(),
    propertyLocation: Joi.string().required()
  });


  verifyHandleWhoIAm=Joi.object({
    userId: Joi.number().required()
  })





}

export default new UserUtil();





