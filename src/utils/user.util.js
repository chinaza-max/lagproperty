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
    userId: Joi.number().required().label('user Id'),
    role: Joi.string().required().valid(
      'rent',
      'list'
    ),
    image: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }).optional(),
    tel: Joi.number().integer().optional(),
    telCode: Joi.string().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    maritalStatus: Joi.string().required(),
    gender: Joi.string().valid('Male', 'Female').optional().allow(''),
    dateOfBirth: Joi.date().required(),
    lasrraId: Joi.string().optional().allow(''),
    familySize: Joi.number().integer().required(),
    rentalDuration: Joi.number().required(),
    budgetMin: Joi.number().integer().required(),
    budgetMax: Joi.number().integer().required(),
    occupation: Joi.string().required(),
    country: Joi.string().required(),
    stateOfOrigin: Joi.string().required(),
    nin: Joi.number().integer().required(),
    bankCode: Joi.string().required(),
    bankAccount: Joi.string().required(),
    propertyPreference: Joi.array().items(
      Joi.string().valid('all', 'flats', 'duplex', 'selfContains', 'roomAndParlour')
    ).required(),
    propertyLocation: Joi.string().required()
  });

  verifyHandleInspectionAction=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('tenant', 'propertyManager').required(),
    type: Joi.string()
      .valid(
        'getNotCreatedInspection',
        'getPendingInspection',
        'getDeclineInspection',
        'getAcceptedInspection',
        'createInspection',
        'refund',
        'accept',
        'decline'
      )
      .required()
      .label('Type'),
      
      pageSize: Joi.number()
      .integer()
      .min(1)
      .when('type', {
        is: Joi.string().valid(
          'getNotCreatedInspection', 
          'getPendingInspection',
          'getDeclineInspection',
          'getAcceptedInspection'
        ),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      page: Joi.number()
      .integer()
      .min(1)
      .when('type', {
        is: Joi.string().valid(
          'getNotCreatedInspection', 
          'getPendingInspection',
          'getDeclineInspection',
          'getAcceptedInspection'
        ),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    
    inspectionMode: Joi.string()
      .valid('inPerson', 'videoChat')
      .when('type', {
        is: 'createInspection',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    fullDate: Joi.date().when('type', {
      is: 'createInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),


    inspectionStatus: Joi.string()
      .valid('pending', 'accepted', 'decline', 'notCreated')
      .when('type', {
        is: 'updateInspection',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    inspectionDeclineMessage: Joi.string().when('type', {
      is: 'updateInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    emailAddress: Joi.string().email().when('type', {
      is: 'createInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    tel: Joi.number().when('type', {
      is: 'createInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    fullName: Joi.string().when('type', {
      is: 'createInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    gender: Joi.string()
      .valid('Male', 'Female')
      .when('type', {
        is: 'createInspection',
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    note: Joi.string().when('type', {
      is: 'createInspection',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  });


  verifyHandleWhoIAm=Joi.object({
    userId: Joi.number().required()
  })



  verifyHandleListBuilding= Joi.object({
    userId: Joi.number().required(),
    propertyPreference: Joi.string()
        .valid('flats', 'duplex', 'selfContains', 'roomAndParlour')
        .required(),
    propertyLocation: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    lat: Joi.string().required(),
    lng: Joi.string().required(),
    numberOfFloors: Joi.number().integer().optional(),
    numberOfRooms: Joi.number().integer().optional(),
    amenity: Joi.array().items(Joi.string()).required(),
    roomPreference:Joi.string().required(),
    availability: Joi.string()
        .valid('vacant', 'occupied')
        .required(),
    furnishingStatus: Joi.string()
        .valid('furnished', 'unfurnished', 'partly furnished')
        .required(),
    rentalDuration: Joi.string().required(),
    price: Joi.number().integer().required(),
    electricityBill: Joi.number().integer().required(),
    wasteBill: Joi.number().integer().required(),
    commissionBill: Joi.number().integer().required(),
    propertyDescription: Joi.string().optional(),
    bedroomSizeLength: Joi.number().integer().optional(),
    bedroomSizeWidth: Joi.number().integer().optional(),
    bedroomSizeImage: Joi.string().uri().optional(),
    kitchenSizeLength: Joi.number().integer().optional(),
    kitchenSizeWidth: Joi.number().integer().optional(),
    kitchenSizeImage: Joi.string().uri().optional(),
    livingRoomSizeLength: Joi.number().integer().optional(),
    livingRoomSizeWidth: Joi.number().integer().optional(),
    livingRoomSizeImage: Joi.string().uri().optional(),
    diningAreaSizeLength: Joi.number().integer().optional(),
    diningAreaSizeWidth: Joi.number().integer().optional(),
    diningAreaSizeImage: Joi.string().uri().optional(),
});

}

export default new UserUtil();





