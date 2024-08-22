import Joi from "joi";

class UserUtil {

  
  verifyHandleCreateTask=Joi.object({
    userId: Joi.number().required(),
    title: Joi.string().required(),
    taskDescription: Joi.string().required(),
    amount: Joi.number().required(),
    expiryDate: Joi.date().required(),
    image: Joi.object({
      sizes: Joi.number().positive().less(3000000).optional(),
    }).optional()
  })


  verifyHandleSubmitTask=Joi.object({
    userId: Joi.number().required(),
    reponse: Joi.string().required(),
    taskId: Joi.number().required(),
    image: Joi.object({
      sizes: Joi.number().positive().less(3000000).optional(),
    }).optional()
  })

  verifyHandleAsignTask=Joi.object({
    userId: Joi.number().required(),
    userId2: Joi.number().required(),
    taskId: Joi.number().required(),
  })

  verifyHandleRemoveChild=Joi.object({
    userId2: Joi.number().required(),
    userId: Joi.number().required()
  })

  
  verifyHandleDeleteSubmitTask=Joi.object({
    taskResponseId: Joi.number().required(),
  })

  verifyHandleDeleteTask=Joi.object({
    taskId: Joi.number().required(),
  })

  verifyHandleAcceptTask=Joi.object({
    taskId: Joi.number().required(),
    userId2: Joi.number().required(),
    value:Joi.boolean().required()
  })

  verifyHandleAccountCount=Joi.object({
    userId: Joi.number().required(),
    type: Joi.string().valid(
      'Parent',
      'Child',
    ).required(),
  })

  verifyHandleWhoIAm=Joi.object({
    userId: Joi.number().required()
  })

  verifyHandleGetMyChildren=Joi.object({
    userId: Joi.number().required()
  })




  verifyHandleGetTask= Joi.object({
    userId: Joi.number().required(),
    offset: Joi.number().required(),
    pageSize: Joi.number().required(),
    type: Joi.string().valid(
      'Unassigned',
      'Pending',
      'Completed',
      'All',
    ).required(),
    type2: Joi.string().valid(
      'parent',
      'child',
    ).required(),
   
  });


  verifyHandleGetResponse= Joi.object({
    taskId: Joi.number().required(),
    userId: Joi.number().required(),
    type: Joi.string().valid(
      'myResponse',
      'allResponse',
    ).required(),
    offset: Joi.when('type', {
      is: 'allResponse',
      then: Joi.string().required(),
    }),
    pageSize: Joi.when('type', {
      is: 'allResponse',
      then: Joi.string().required(),
    })
  });


}

export default new UserUtil();
