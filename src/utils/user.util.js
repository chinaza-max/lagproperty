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
    nin: Joi.string().label('NIN'),
    about: Joi.string().required().label('Information about your self and building'),
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
    landlordBankAccount:Joi.string().required().label('Landlord Bank Account'),
    companyName: Joi.string().required().label('Company Name'),
    agentRegistrationNO: Joi.string().when('type', {
      is: 'agent',
      then:Joi.required().label('Agent Registration Number'),
      otherwise: Joi.forbidden(), 
    }),
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
    nin: Joi.string().required(),
    bankCode: Joi.string().required(),
    bankAccount: Joi.string().required(),
    propertyPreference: Joi.array().items(Joi.string()).required(),
    propertyLocation: Joi.string().required()
  });


  verifyHandleChat= Joi.object({
    role: Joi.string().required().valid(
      'rent',
      'list'
    ),
    userId: Joi.number().integer().positive().required(),
    receiverId: Joi.number().integer().required(),
    messageType: Joi.string().valid('text', 'file').required(),
    message: Joi.when('messageType', {
      is: 'text',
      then: Joi.string().required(),
      otherwise: Joi.string().allow(null, ''),
    }),
    repliedMessageId: Joi.number().integer().optional(),
    image: Joi.when('messageType', {
      is: 'file',
      then: Joi.object({
        size: Joi.number().positive().less(3000000).required(),
      }).required(),
      otherwise: Joi.optional(),
    })
  });

  verifyHandleGetMyProperty = Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    type: Joi.string()
      .valid(
        'vacant',
        'cancelled',
        'occupied',
        'listing',
        'booked'
      )
      .required()
      .label('type'),
    pageSize: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    propertyManagerId: Joi.number().when('role', {
      is: 'rent',
      then: Joi.when('type', {
        is: 'listing',
        then: Joi.required(),
        otherwise: Joi.forbidden()
      }),
      otherwise: Joi.forbidden()
    })
  })

  verifyHandleProspectiveTenantInformation=Joi.object({
    userId: Joi.number().required(),
    inspectionId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    pageSize: Joi.number().integer().required(),
    page: Joi.number().integer().required()
  })


  verifyHandleGetAllTrasaction=Joi.object({
    limit: Joi.number().optional(),
  })

  verifyHandleTenant=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    pageSize: Joi.number().integer().required(),
    page: Joi.number().integer().required()
  })

  verifyHandleRentAction=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    pageSize: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
    type: Joi.string()
    .valid(
      'recentRent',
      'tenantInvoicesDue',
    )
    .required()
    .label('Type'),
  })

  verifyHandleGetInspectionDetails=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    inspectionId: Joi.number().integer(),
  })


  verifyHandleSendInvoce=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    userIdList: Joi.array()
    .items(Joi.number().integer().required())
    .required() ,
  })


  verifyHandleGetTransactionRefund=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    pageSize: Joi.number().integer().required(),
    page: Joi.number().integer().required(),
  })

  verifyHandleGetTransaction=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(), 
    page: Joi.number().integer().min(1).required(), 
    pageSize: Joi.number().integer().min(1).required(),
  })


  verifyHandleGetChat=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    type: Joi.string()
      .valid(
        'summary',
        'chatDetail',
      )
      .required()
      .label('Type'),
    partnerId: Joi.number()
    .when('type', {
      is: 'chatDetail',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  })
  
  verifyHandleInspectionAction=Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    type: Joi.string()
      .valid(
        'getNotCreatedInspection',
        'getPendingInspection',
        'getDeclineInspection',
        'getAcceptedInspection',
        'createInspection',
        'refund',
        'acceptInspection',
        'declineInspection',
        'acceptTenant',
        'rejectTenant',
        'releaseFund',
        'rejectBuilding',
        'escrowBalance'
      )
      .required()
      .label('Type'),
      
      pageSize: Joi.number().required()
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
      page: Joi.number().required()
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
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    
    fullDate: Joi.date().when('type', {
      is: 'createInspection',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),

    inspectionStatus: Joi.string()
      .valid('pending', 'accepted', 'decline', 'notCreated')
      .when('type', {
        is: 'updateInspection',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),

    emailAddress: Joi.string().email().when('type', {
      is: 'createInspection',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    tel: Joi.number().when('type', {
      is: 'createInspection',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    fullName: Joi.string().when('type', {
      is: 'createInspection',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    gender: Joi.string()
      .valid('Male', 'Female')
      .when('type', {
        is: 'createInspection',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
    note: Joi.string().when('type', {
      is: Joi.valid('createInspection', 'declineInspection'),
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
    inspectionId: Joi.number().when('type', {
      is: Joi.valid(
        'acceptInspection',
        'declineInspection',
        'createInspection',
        'acceptTenant',
        'releaseFund'),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),

  });


  verifyHandleWhoIAm=Joi.object({
    userId: Joi.number().required()
  })


  handleGetALLreviewTenant= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    tenantId: Joi.number().integer().required(),
    page: Joi.number().integer().min(1).required(), 
    pageSize: Joi.number().integer().min(1).required(),
  });



  verifyHandleGetBuildingDetails= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('rent').required(),
    buildingId: Joi.number().required(),
  });


  verifyHandleGetBuildings= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    type: Joi.string().required(),
    propertyLocation: Joi.string().when('type', { is: 'all', then: Joi.optional() }),
    propertyPreference: Joi.string().when('type', { is: 'all', then: Joi.optional() }),
    furnishingStatus: Joi.string().valid('furnished', 'unfurnished', 'partly furnished', 'unset').when('type', { is: 'all', then: Joi.optional() }),
    bedrooms: Joi.number().integer().when('type', { is: 'all', then: Joi.optional() }),
    amenities: Joi.array().items(Joi.string()).when('type', { is: 'all', then: Joi.optional() }),
    budgetMin: Joi.number().integer().when('type', { is: 'all', then: Joi.optional() }),
    budgetMax: Joi.number().integer().when('type', { is: 'all', then: Joi.optional() }),
    propertyRating: Joi.number().min(1).max(5).when('type', { is: 'all', then: Joi.optional() }),
    page: Joi.number().integer().min(1).default(1).required(),
    pageSize: Joi.number().integer().min(1).default(10).required(),
  });

  verifyHandleGetTenantsWithDueRent= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list', 'rent').required(),
    page: Joi.number().integer().min(1).default(1).required(),
    pageSize: Joi.number().integer().min(1).default(10).required(),
  });

  verifyHandleGetAllLordData= Joi.object({
    userId: Joi.number().integer().required(),
    listId: Joi.number().integer().when('type', {
      is: 'building',
      then:Joi.required(),
      otherwise:  Joi.forbidden(),
    }),
    buildingId: Joi.number().integer().when('type', {
      is: Joi.valid('transaction', 'tenant') ,
      then:Joi.required(),
      otherwise:  Joi.forbidden(),
    }),
    type: Joi.string().valid('building', 'transaction', 'tenant').required(),
  });

  verifyHandleGetAllUser= Joi.object({
    userId: Joi.number().integer().required(),
    type: Joi.string().valid('list', 'rent').required(),
  });



  verifyHandleAppointmentAndRent= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').required(),
    paymentReference: Joi.string().required(),
  });



  verifyHandleReviewBuildingAction= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list','rent').required(),
    reviewId: Joi.number().integer().required(),
    review: Joi.string().optional(),
    rating: Joi.number().optional(),
    type: Joi.string().valid('updateReview', 'deleteReview').required(),
  });


  verifyHandleReviewBuilding= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list','rent').required(),
    buildingId: Joi.number().integer().required(),
    review: Joi.string().required(),
    rating: Joi.number().optional(),
  });



  validateHandleValidateNIN= Joi.object().keys({
    type: Joi.string().valid('deleted', 'add').required(),
    role: Joi.string().valid('list', 'rent').required(),
    userId: Joi.number().integer().required(),
    preferenceName: Joi.string().when('type', {
      is: Joi.valid('add', 'deleted'),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
  });


  verifyHandleDisableAccount= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').optional(),
    type: Joi.string().valid('list', 'rent').required(),
    userId2: Joi.number().integer().required(),
  });

  verifyHandleReviewTenant= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').required(),
    prospectiveTenantId: Joi.number().integer().required(),
    review: Joi.string().required()
  });


  verifyHandleGetNotification= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').required(),
    page: Joi.number().integer().min(1).default(1).required(),
    pageSize: Joi.number().integer().min(1).default(10).required(),
  });

  verifyHandleGetALLreviewTenant= Joi.object({
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').required(),
    prospectiveTenantId: Joi.number().integer().required(),
    page: Joi.number().integer().min(1).default(1).required(),
    pageSize: Joi.number().integer().min(1).default(10).required(),
  });

  verifyHandleQuitNoticeAction= Joi.object({
    type: Joi.string().valid('send', 'acknowledged', 'get', 'delete').required(),
    userId: Joi.number().integer().required(),
    role: Joi.string().valid('list', 'rent').required(),
    tenantId: Joi.number().when('type', {
      is: Joi.string().valid('send', 'get'),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    buildingId: Joi.number().when('type', {
      is: Joi.string().valid('send'),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    quitNoticeId: Joi.date().when('type', {
      is: 'acknowledged',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    quitDate: Joi.date().when('type', {
      is: 'send',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    reason: Joi.string().when('type', {
      is: 'send',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  });
  
/*
  verifyHandleUpdatelistedBuilding= Joi.object({
    role: Joi.string().valid('list').required(),
    buildingId: Joi.number().required(),
    userId: Joi.number().required(),
    propertyPreference: Joi.string()
        .valid('flats', 'duplex', 'selfContains', 'roomAndParlour')
        .optional(),
    propertyLocation: Joi.string(), 
    propertyTitle: Joi.string(),
    city: Joi.string(),
    address: Joi.string(),
    lat: Joi.string(),
    lng: Joi.string(),
    numberOfFloors: Joi.number().integer().optional(),
    numberOfRooms: Joi.number().integer().optional(),
    amenity: Joi.array().items(Joi.string()),
    roomPreference:Joi.string(),
    availability: Joi.string()
        .valid('vacant', 'occupied'), 
    furnishingStatus: Joi.string()
        .valid('furnished', 'unfurnished', 'partly furnished'),
    rentalDuration: Joi.number().integer(),
    price: Joi.number().integer(),
    electricityBill: Joi.number().integer(),
    wasteBill: Joi.number().integer(),
    commissionBill: Joi.number().integer(),
    propertyDescription: Joi.string().optional(),
    bedroomSizeLength: Joi.number().integer().optional(),
    bedroomSizeWidth: Joi.number().integer().optional(),
    bedroomSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }),
    kitchenSizeLength: Joi.number().integer().optional(),
    kitchenSizeWidth: Joi.number().integer().optional(),
    kitchenSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }),
    livingRoomSizeLength: Joi.number().integer().optional(),
    livingRoomSizeWidth: Joi.number().integer().optional(),
    livingRoomSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }),
    diningAreaSizeLength: Joi.number().integer().optional(),
    diningAreaSizeWidth: Joi.number().integer().optional(),
    diningAreaSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }),
    propertyTerms: Joi.object({
      size: Joi.number().positive().less(3000000).optional(),
    }),
  });
*/


 verifyHandleUpdatelistedBuilding = Joi.object({
  buildingId: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
  userId: Joi.number().required(),
  role: Joi.string().valid('list').required(),
  propertyPreference: Joi.string().optional(),
  propertyLocation: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  lat: Joi.string().optional(),
  lng: Joi.string().optional(),
  numberOfFloors: Joi.number().integer().optional(),
  numberOfRooms: Joi.number().integer().optional(),
  amenity: Joi.array().items(Joi.string()).optional(),
  roomPreference: Joi.string().optional(),
  availability: Joi.string().valid('vacant', 'occupied').optional(),
  furnishingStatus: Joi.string()
    .valid('furnished', 'unfurnished', 'partly furnished')
    .optional(),
  rentalDuration: Joi.number().integer().optional(),
  price: Joi.number().integer().optional(),
  electricityBillArreas: Joi.string().optional(),
  electricityBillArreasType: Joi.string().optional(),
  waterBillArreas: Joi.string().optional(),
  commissionBill: Joi.number().integer().optional(),
  propertyDescription: Joi.string().optional(),
  propertyTerms: Joi.object({
    url: Joi.string().required(),
    size: Joi.number().positive().less(3000000).required(),
  }).optional(),
  propertyImages: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        title: Joi.string().required(),
        width: Joi.number().integer().required(),
        length: Joi.number().integer().required(),
        size: Joi.number().max(5000000).required(),
      })
    )
    .optional(),
  titles: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  widths: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string().regex(/^\d+$/))
  ).optional(),
  lengths: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string().regex(/^\d+$/))
  ).optional(),
  buildingOccupantPreference: Joi.object({
    maritalStatus: Joi.array().items(Joi.string()).required(),
    religion: Joi.array().items(Joi.string()).required(),
    region: Joi.array().items(Joi.string()).required(),
    gender: Joi.array().items(Joi.string()).required()
  }).optional(),   
}).unknown(true)


  /*
  verifyHandleListBuilding= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list').required(),
    propertyPreference: Joi.string()
        .valid('flats', 'duplex', 'selfContains', 'roomAndParlour').required(),
    propertyLocation: Joi.string().required(),
    propertyTitle: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    lat: Joi.string().required(),
    lng: Joi.string().required(),
    numberOfFloors: Joi.number().integer().required(),
    numberOfRooms: Joi.number().integer().required(),
    amenity: Joi.array().items(Joi.string()).required(),
    roomPreference:Joi.string().required(),
    availability: Joi.string()
        .valid('vacant', 'occupied').required(),
    furnishingStatus: Joi.string()
        .valid('furnished', 'unfurnished', 'partly furnished')
        .required(),
    rentalDuration: Joi.number().integer().required(),
    price: Joi.number().integer().required(),
    electricityBill: Joi.number().integer().required(),
    wasteBill: Joi.number().integer().required(),
    commissionBill: Joi.number().integer().required(),
    propertyDescription: Joi.string().optional().required(),
    bedroomSizeLength: Joi.number().integer().required(),
    bedroomSizeWidth: Joi.number().integer().required(),
    bedroomSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).required(),
    }),
    kitchenSizeLength: Joi.number().integer().required(),
    kitchenSizeWidth: Joi.number().integer().required(),
    kitchenSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).required(),
    }),
    livingRoomSizeLength: Joi.number().integer().required(),
    livingRoomSizeWidth: Joi.number().integer().required(),
    livingRoomSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).required(),
    }),
    diningAreaSizeLength: Joi.number().integer().required(),
    diningAreaSizeWidth: Joi.number().integer().required(),
    diningAreaSizeImage: Joi.object({
      size: Joi.number().positive().less(3000000).required(),
    }),
    propertyTerms: Joi.object({
      size: Joi.number().positive().less(3000000).required(),
    }),
  });
  */


  verifyHandleListBuilding= Joi.object({
    userId: Joi.number().required(),
    role: Joi.string().valid('list').required(),
    propertyPreference: Joi.string().required(),
    propertyLocation: Joi.string().required(),
   // propertyTitle: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    lat: Joi.string().required(),
    lng: Joi.string().required(),
    numberOfFloors: Joi.number().integer().required(),
    numberOfRooms: Joi.number().integer().required(),
    amenity: Joi.array().items(Joi.string()).required(),
    roomPreference:Joi.string().required(),
    availability: Joi.string()
        .valid('vacant', 'occupied').required(),
    furnishingStatus: Joi.string()
        .valid('furnished', 'unfurnished', 'partly furnished')
        .required(),
    rentalDuration: Joi.number().integer().required(),
    price: Joi.number().integer().required(),
    electricityBillArreas: Joi.string().optional(),
    electricityBillArreasType: Joi.string().optional(),
    waterBillArreas: Joi.string().optional(),
    commissionBill: Joi.number().integer().required(),
    propertyDescription: Joi.string().optional().required(),
    propertyTerms: Joi.object({
      url: Joi.string().required(),
      size: Joi.number().positive().less(3000000).required(),
    }),
    propertyImages: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().required(),
        title: Joi.string().required(),
        width: Joi.number().integer().required(),
        length: Joi.number().integer().required(),
        size: Joi.number().max(5000000).required(), // Ensure file size is under 5MB
      }))
    .required(),
  titles: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).required(),
  widths: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string().regex(/^\d+$/))
  ).required(),
  lengths: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string().regex(/^\d+$/))
  ).required(),
  buildingOccupantPreference: Joi.object({
    maritalStatus: Joi.array().items(Joi.string()).required(),
    religion: Joi.array().items(Joi.string()).required(),
    region: Joi.array().items(Joi.string()).required(),
    gender: Joi.array().items(Joi.string()).required()
  }).required(),
  });
}

export default new UserUtil();





