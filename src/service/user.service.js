import { 
  EmailandTelValidation,
  PropertyManager,
  Building,
  Transaction,
  Inspection,
  RefundLog,
  ProspectiveTenant,
  Chat,
  QuitNotice,
  PropertyManagerReview,
  TenantReview,
  Tenant
} from "../db/models/index.js";
import userUtil from "../utils/user.util.js";
import authService from "../service/auth.service.js";
import bcrypt from'bcrypt';
import serverConfig from "../config/server.js";
import {  Op, Sequelize, where } from "sequelize";
import mailService from "../service/mail.service.js";
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { addMonths,  format} from 'date-fns';
import { fn, col, literal} from 'sequelize';   
import axios from'axios';

import {
  NotFoundError,   
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";
import { type } from "os";

class UserService {

  EmailandTelValidationModel=EmailandTelValidation
  PropertyManagerModel=PropertyManager
  BuildingModel=Building
  TenantModel=Tenant
  TransactionModel=Transaction
  InspectionModel=Inspection
  RefundLogModel=RefundLog
  ProspectiveTenantModel=ProspectiveTenant
  ChatModel=Chat
  QuitNoticeModel=QuitNotice
  PropertyManagerReviewModel=PropertyManagerReview
  TenantReviewModel=TenantReview


  

  


  async handleUpdateProfile(data,file) {


    if(data.role=='list'){
      let { 
        userId,
        role,
        image,
        ...updateData
      } = await userUtil.verifyHandleUpdateProfileList.validateAsync(data);
      
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
        image,
        lasrraId,
        ...updateData
      } = await userUtil.verifyHandleUpdateProfileRent.validateAsync(data);
  

      try {
        if(lasrraId){
          await this.ProspectiveTenantModel.update({lasrraId,...updateData}, { where: { id: userId } });
  
        }else{
          await this.ProspectiveTenantModel.update({lasrraId:uuidv4(),...updateData}, { where: { id: userId } })
        }
      } catch (error) {
        throw new SystemError(error.name,  error.parent)
      }

    }


  }



  
  async handleProspectiveTenantInformation(data) {

    const { userId,inspectionId  ,role , page ,pageSize} = await userUtil.verifyHandleProspectiveTenantInformation.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {

      const inspectionResult = await this.InspectionModel.findOne({
        where: { id: inspectionId, isDeleted: false }
      })

      if (!inspectionResult) {
        throw new Error("Inspection not found.");
      }
      
      let tenantData = await this.ProspectiveTenantModel.findOne({
          where: {
            id:inspectionResult.prospectiveTenantId
          },
          include: [{
            as: "PropertyManagerReview",
            model: this.PropertyManagerReviewModel,
            limit, 
            offset
          }],
          
        });
      
        if (!tenantData) {
          throw new NotFoundError('Tenant data not found');
        }
    
        const totalItems = await this.PropertyManagerReviewModel.count({
          where: {
            prospectiveTenantId: inspectionResult.prospectiveTenantId
          }
        });
    
        const totalPages = Math.ceil(totalItems / pageSize);

  
      return {
        data: tenantData,
        pagination:{
        totalItems,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages
        }
      };
    
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }

  async handleTenant(data) {

    const { userId ,role , page ,pageSize} = await userUtil.verifyHandleTenant.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      
      let tenantData = await this.TenantModel.findAndCountAll({
          where: {
            status: { [Op.in]: ['active', 'rentDue'],}
          },
          include: [{
            model: this.BuildingModel, 
            attributes: ['price'], 
            where:{
              propertyManagerId:userId
            }
          },{
            model: this.ProspectiveTenantModel, 
            attributes: ['id','maritalStatus','stateOfOrigin','image']
          }],
          offset,
          limit
        });
      
  
      const totalPages = Math.ceil(tenantData.count / pageSize);
  
      return {
        data: tenantData.rows,
        pagination:{
        totalItems: tenantData.count,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages
        }
      };
    
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }
  
  async handleRentAction(data) {

    const { userId ,role , type , page ,pageSize} = await userUtil.verifyHandleRentAction.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize

    try {
      
      let tenantData;

      if (type === "recentRent") {
        // Fetch tenants with rent recently received
        tenantData = await this.TenantModel.findAndCountAll({
          where: {
            status: 'active', 
            rentNextDueDate: {
              [Op.ne]: null, 
            }
          },  
          include: [{
            model: this.BuildingModel, 
            attributes: ['id'], 
            where:{
              propertyManagerId:userId
            }
          }],
          order: [
            ['rentNextDueDate', 'DESC'] // Order by most recent rent date
          ],
          offset,
          limit
        });
  
      } 
      else if (type === "tenantInvoicesDue") {
        // Fetch tenants with rent due
        tenantData = await this.TenantModel.findAndCountAll({
          where: {
            status: 'rentDue',
            rentNextDueDate: {
              [Op.lte]: new Date(), 
            }
          },
          include: [{
            model: this.BuildingModel, 
            attributes: ['id'], 
            where:{
              propertyManagerId:userId
            }
          }],  
          order: [
            ['rentNextDueDate', 'ASC'] 
          ],
          offset,
          limit
        });
      } 
  
      const totalPages = Math.ceil(tenantData.count / pageSize);
  
      return {
        data: tenantData.rows,
        pagination:{
        totalItems: tenantData.count,
        currentPage: parseInt(page, 10),
        pageSize: limit,
        totalPages
        }
      }
      
    
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }


  async handleGetInspectionDetails(data) {

    const { userId ,role , inspectionId} = await userUtil.verifyHandleGetInspectionDetails.validateAsync(data);

    try {
  
      const inspection = await this.InspectionModel.findOne({
        where: { id:inspectionId },
        attributes: {
          exclude: ['password'] 
        },
        include: [
          {
            model: Building,
            as: 'BuildingInspection',
          },
          {
            model: this.ProspectiveTenantModel,
            as: 'MyInspection',
            attributes: {
              exclude: ['password']
            }
          }
        ]
      });

      if (!inspection) {
          throw new NotFoundError('Inspection not found')
      }

      return inspection
    
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }


  async handleGetTransactionRefund(data) {

    const { userId ,role , page, pageSize,} = await userUtil.verifyHandleGetTransactionRefund.validateAsync(data);

    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      
      let transactions;

      if (role === 'rent') {

        transactions = await this.RefundLogModel.findAll({
          where: {
            prospectiveTenantId:userId 
          },
          order: [['createdAt', 'DESC']],
          limit,
          offset
        });

      }
      else if(role === 'list'){
        transactions = await this.RefundLogModel.findAll({
          where: {
            isDeleted:false
          },
          order: [['createdAt', 'DESC']],
          include: [{
            model: this.BuildingModel,
            where: {
              prospectiveTenantId: userId
            }
          }],
          limit,
          offset
        });
      }


      return transactions
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }
  
  async handleGetTransaction(data) {

    const { userId, role , page, pageSize} = await userUtil.verifyHandleGetTransaction.validateAsync(data);

    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      
      let transactions;
      let totalCount;

      if (role === 'rent') {

        totalCount = await this.TransactionModel.count({
          where: { userId }
        });

        transactions = await this.TransactionModel.findAll({
          where: {
            userId 
          },
          order: [['createdAt', 'DESC']],
          limit,
          offset
        });

      }
      else if(role === 'list'){

        totalCount = await this.TransactionModel.count({
          where: { isDeleted: false },
          include: [{
            model: this.BuildingModel,
            where: { propertyManagerId: userId },
            attributes:['id']
          }],
        });
        
        transactions = await this.TransactionModel.findAll({
          where: {
            isDeleted:false
          },
          order: [['createdAt', 'DESC']],
          include: [{
            model: this.BuildingModel,
            where: {
              propertyManagerId: userId
            },
            attributes:['id']
          }],
          limit,
          offset
        });
      }



      const totalPages = Math.ceil(totalCount / pageSize);


      return {
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize,
        },
        transactions,
      };

    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
    
  }

  async handleGetBuildingDetails(data) {

    const { userId, buildingId} = await userUtil.verifyHandleGetBuildingDetails.validateAsync(data);


    try {
      const buildingDetails = await this.BuildingModel.findOne({
        where: { id: buildingId, isDeleted: false },
        include:[ {
          model: this.PropertyManagerModel,
          attributes: {
            exclude: [
              'password',
              'agentBankCode',
              'agentBankAccount',
              'landlordBankCode',
              'landlordBankAccount',
              'lasrraId',
              'nin',
              'isDeleted',
              'disableAccount',
              'notificationAllowed',
              'role'
            ]
          }
        },
        {
          model:this.TenantReviewModel,
          as: 'BuildingReview',
          attributes: ['id', 'review', 'rating', 'createdAt']
        }
      ]
      });
  
      if (!buildingDetails) {
        throw new NotFoundError('BuildingNotFound', 'Building not found');
      }
  
      return buildingDetails;
  
    } catch (error) {
      throw new SystemError(error.name,  error.parent)
    }
    
  }

  async handleGetBuildings(data) {

    const { userId, page, pageSize, type} = await userUtil.verifyHandleGetBuildings.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;


    const buildingAttributes = [
      'id',
      'propertyManagerId',
      'propertyPreference',
      'propertyLocation',
      'city',
      'address',
      'lat',
      'lng',
      'numberOfFloors',
      'numberOfRooms',
      'amenity',
      'roomPreference',
      'availability',
      'furnishingStatus',
      'rentalDuration',
      'price',
      'electricityBill',
      'wasteBill',
      'commissionBill',
      'propertyDescription',
      'bedroomSizeLength',
      'bedroomSizeWidth',
      'bedroomSizeImage',
      'kitchenSizeLength',
      'kitchenSizeWidth',
      'kitchenSizeImage',
      'livingRoomSizeLength',
      'livingRoomSizeWidth',
      'livingRoomSizeImage',
      'diningAreaSizeLength',
      'diningAreaSizeWidth',
      'diningAreaSizeImage',
      'propertyTerms',
    ];
    
    try {
      
      let whereClause = {};
      let orderClause = [];
      let buildings = []
      let totalCount = 0

      if (['flats', 'duplex', 'selfContains', 'roomAndParlour'].includes(type)) {
        
        const { count, rows } = await this.BuildingModel.findAndCountAll({
            where:{
              propertyPreference:type,
              availability:'vacant',
              isDeleted:false
            },
            offset,
            limit
        });

       /* totalCount = await this.BuildingModel.count({
          where:{
            propertyPreference:type,
            availability:'vacant',
            isDeleted:false
          },
          offset,
          limit
        });*/


        buildings=rows ?rows:[]
        totalCount=count
      }
      else if(type=== 'all'){

        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where:{
            availability:'vacant',
            isDeleted:false
          },
          offset,
          limit
        });


        buildings=rows? rows:[]
        totalCount=count

      }
      else if(type === 'topRated'){

        const { count, rows }  = await this.BuildingModel.findAndCountAll({
          where:{
            availability:'vacant',
            isDeleted:false
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [fn('COALESCE', fn('AVG', col('BuildingReview.rating')), 0), 'averageRating'],
            // Count number of reviews
            [fn('COUNT', col('BuildingReview.id')), 'reviewCount']
          ],
          include: [
            {
              model: TenantReview,
              as: 'BuildingReview',
              attributes: [],
              required: false, 
            }
          ],
          group: ['Building.id'],
          order: [[literal('averageRating'), 'DESC']],
          offset,
          limit,
          subQuery: false
        });

        buildings =rows? rows.map(building => ({
          ...building.toJSON(),
          averageRating: parseFloat(building.getDataValue('averageRating')) || 0,
          reviewCount: parseInt(building.getDataValue('reviewCount'), 10) || 0
        })):[]

        /*
        totalCount = await this.BuildingModel.count({
          where:{
            availability:'vacant',
            isDeleted:false
          },
          offset,
          limit
        });*/
        totalCount=count.length
      }

      else if(type === 'popular'){

        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            availability: 'vacant',
            isDeleted: false
          },
          attributes: [
            ...buildingAttributes,
            [fn('COALESCE', fn('AVG', col('BuildingReview.rating')), 0), 'averageRating'],
            [fn('COUNT', col('BuildingReview.id')), 'reviewCount'],
            [fn('COUNT', col('BuildingTenant.id')), 'tenantCount']
          ],
          include: [
            {
              model: this.TenantReviewModel,
              as: 'BuildingReview',
              attributes: [],
              required: false
            },
            {
              model: this.TenantModel,
              as: 'BuildingTenant',
              attributes: [],
              required: false
            }
          ],
        /*  group: ['Building.id', 'Building.propertyPreference'],*/
          group: ['Building.id'],
          order: [[literal('tenantCount'), 'DESC']],
          offset,
          limit,
          distinct: true,
          subQuery: false
        });


        console.log(rows)
      
        buildings = rows? rows.map(building => ({
          ...building.toJSON(),
          averageRating: parseFloat(building.get('averageRating')) || 0,
          reviewCount: parseInt(building.get('reviewCount'), 10) || 0,
          tenantCount: parseInt(building.get('tenantCount'), 10) || 0
        })):[];
      

        //totalCount = count.length;
        totalCount = count.length;


      }

      else if(type == 'recommended'){

        const user = await this.ProspectiveTenantModel.findByPk(userId);
        if (!user) {
          throw new NotFoundError('User not found');
        }

        const { propertyPreference, rentalDuration } = user;


        const { count, rows }  = await this.BuildingModel.findAndCountAll({
          where:{
            availability:'vacant',
            isDeleted:false,
            [Op.or]: [
              { rentalDuration: rentalDuration },
              {
                propertyPreference: {
                  [Op.in]: propertyPreference,
                }
              }
            ]
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [fn('COALESCE', fn('AVG', col('BuildingReview.rating')), 0), 'averageRating'],
            // Count number of reviews
            [fn('COUNT', col('BuildingReview.id')), 'reviewCount']
          ],
          include: [
            {
              model: TenantReview,
              as: 'BuildingReview',
              attributes: [],
              required: false, 
            }
          ],
         /* group: ['Building.id'],*/
          group: ['Building.id'],
          order: [[literal('averageRating'), 'DESC']],
          offset,
          limit,
          subQuery: false
        });

        buildings =rows? rows.map(building => ({
          ...building.toJSON(),
          averageRating: parseFloat(building.getDataValue('averageRating')) || 0,
          reviewCount: parseInt(building.getDataValue('reviewCount'), 10) || 0
        })):[];

        /*
        totalCount = await this.BuildingModel.count({
          where:{
            availability:'vacant',
            propertyPreference: {
              [Op.in]: propertyPreference,
            },
            rentalDuration: rentalDuration,
            isDeleted:false
          },
          offset,
          limit
        });
        */

        totalCount = count.length;


      }

      else if(type === 'bestOffer'){

        const user = await this.ProspectiveTenantModel.findByPk(userId);
        if (!user) {
          throw new NotFoundError('User not found');
        }

        const { budgetMin, budgetMax } = user;


        const { count, rows }  = await this.BuildingModel.findAndCountAll({
          where:{
            availability:'vacant',
            price: {
              [Op.between]: [budgetMin, budgetMax],
            },
            isDeleted:false
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [fn('COALESCE', fn('AVG', col('BuildingReview.rating')), 0), 'averageRating'],
            // Count number of reviews
            [fn('COUNT', col('BuildingReview.id')), 'reviewCount']
          ],
          include: [
            {
              model: TenantReview,
              as: 'BuildingReview',
              attributes: [],
              required: false, 
            }
          ],
         /* group: ['Building.id'],*/
          group: ['Building.id'],
          order: [['price', 'ASC']],
          offset,
          limit,
          subQuery: false
        });

        buildings =rows? rows.map(building => ({
          ...building.toJSON(),
          averageRating: parseFloat(building.getDataValue('averageRating')) || 0,
          reviewCount: parseInt(building.getDataValue('reviewCount'), 10) || 0
        })):[];

        /*totalCount = await this.BuildingModel.count({
          where:{
            availability:'vacant',
            propertyPreference: {
              [Op.in]: propertyPreference,
            },
            rentalDuration: rentalDuration,
            isDeleted:false
          },
          offset,
          limit
        });
        */

        totalCount = count.length;
      
      }

  

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      pagination: {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize, 
      }, 
      buildings: buildings,
    };

    } catch (error) {

      console.log(error)
      throw new SystemError(error.name,  error.parent)

    }
    
  }
  
  async handleGetUpcomingInspection(data) {

    const { userId, page, pageSize } = await userUtil.verifyHandleGetTenantsWithDueRent.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 7);


    const  { count, rows }  = await Inspection.findAndCountAll({
      include: [
        {
          model: this.BuildingModel,
          include: [
            {
              model: this.PropertyManagerModel,
              where: { id: userId }
            },
          ],
        },
      ],
      where: {
        fullDate: {
          [Op.between]: [today, threeDaysFromNow], // Filter for inspections within today and the next 3 days
        },
        inspectionStatus:'accepted',
        isDeleted: false,
      },
      limit,
      offset,
      order: [['fullDate', 'ASC']], // Order by date
    });

    console.log(rows)

    const totalPages = Math.ceil(count / pageSize);

    return {
      totalCount:count,
      totalPages,
      currentPage: page,
      pageSize,
      data: rows,
    };

      

    } catch (error) {
      throw new SystemError(error.name,  error.parent)

    }
    
  }
  
  async handleGetTenantsWithDueRent(data) {

    const { userId, page, pageSize } = await userUtil.verifyHandleGetTenantsWithDueRent.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      const { count, rows } = await this.TenantModel.findAndCountAll({
        include: [
          {
            model: this.BuildingModel,
            as: 'BuildingReview',
            where: { propertyManagerId:userId },
          },
          {
            model: this.ProspectiveTenantModel,
            as: 'rentalhistory',
          }
        ],
        where: {
          [Op.or]: [
            { status: 'rentDue' },
            { status: 'terminated' }
          ],
          isDeleted: false,
          rentNextDueDate: {
            [Op.lte]: new Date() // Ensure due date is in the past or today
          }
        },
        limit,
        offset,
      });

      return {
        data: rows,
        pagination: {
          totalItems: count,
          currentPage: page,
          totalPages: Math.ceil(count / pageSize),
          pageSize: pageSize,
        },
      }

    } catch (error) {
      throw new SystemError(error.name,  error.parent)

    }
    
  }

  async handleGetALLreviewTenant(data) {

    const { tenantId, page, pageSize } = await userUtil.verifyHandleReviewTenant.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {

      const TenantResult=await this.TenantModel.findByPk(tenantId)

      if(!TenantResult){
          throw new NotFoundError("Tenant not found ")
      }

      const { count, rows } = await PropertyManagerReview.findAndCountAll({
        where: {
          prospectiveTenantId: TenantResult.prospectiveTenantId,
          isDeleted: false,
        },
        limit,
        offset,
      });

      return {
        data: rows,
        pagination: {
          totalItems: count,
          currentPage: page,
          totalPages: Math.ceil(count / pageSize),
          pageSize: pageSize,
        },
      }

    } catch (error) {
      throw new SystemError(error.name,  error.parent)

    }
    
  }

  async handleReviewTenant(data) {

    let { 
      userId,
      role,
      prospectiveTenantId,
      review,
    } = await userUtil.verifyHandleReviewTenant.validateAsync(data);
    
    if(role=='rent') throw new BadRequestError("Tenant dont have this access")

    try {
      await PropertyManagerReview.create({
        propertyManagerId:userId,
        prospectiveTenantId:prospectiveTenantId,
        review: review,
      });

    } catch (error) {
      console
      throw new SystemError(error.name,  error.parent)

    }
    
  }
  
  async handleQuitNoticeAction(data) {

    let { 
      userId,
      role,
      tenantId,
      quitNoticeId,
      ...updateData
    } = await userUtil.verifyHandleQuitNoticeAction.validateAsync(data);
    


      if (type === 'send') {
        // Create a new quit notice

        if(role=='rent') throw new BadRequestError("Tenant dont have this access")

        const newQuitNotice = await this.QuitNoticeModel.create({
          propertyManagerId: userId,
          tenantId: tenantId,
          ...updateData,
        });
        return newQuitNotice;
      }
      else  if (type === 'get') {
        const quitNotices = await this.QuitNoticeModel.findAll({
          where: { tenantId: tenantId, isDeleted: false },
          order: [['noticeDate', 'DESC']],
        });
        return quitNotices;
      }
      else  if (type === 'acknowledged') {
        // Acknowledge a particular quit notice
        const quitNoticeToUpdate = await this.QuitNoticeModel.findOne({
          where: { id: quitNoticeId},
        });
  
        if (!quitNoticeToUpdate) {
          throw new NotFoundError('Quit notice not found');
        }
  
        quitNoticeToUpdate.type = 'acknowledged';
        await quitNoticeToUpdate.save();
        return quitNoticeToUpdate;
      }
      else  if (type === 'delete') {

        const quitNoticeToDelete = await this.QuitNoticeModel.findByPk(quitNoticeId)
  
        if (!quitNoticeToDelete) {
          throw new NotFoundError('Quit notice not found');
        }
  
        quitNoticeToDelete.isDeleted = true;
        await quitNoticeToDelete.save();
        return quitNoticeToDelete;
      }
    

  }

  async handleListBuilding(data,files) {

    let { 
      userId,
      role,
      image,
      bedroomSizeImage,
      kitchenSizeImage,
      livingRoomSizeImage,
      diningAreaSizeImage,
      propertyTerms,
      ...updateData
    } = await userUtil.verifyHandleListBuilding.validateAsync(data);
    
    let imageUrls = {
      bedroomSizeImage: "",
      kitchenSizeImage: "",
      livingRoomSizeImage: "",
      diningAreaSizeImage: "",
      propertyTerms: ""
    };


    try {

      if (files.bedroomSizeImage && files.bedroomSizeImage.length > 0) {
        const bedroomFile = files.bedroomSizeImage[0];
        imageUrls.bedroomSizeImage = serverConfig.NODE_ENV === "production"
          ? serverConfig.DOMAIN + bedroomFile.path.replace("/home", "")
          : serverConfig.DOMAIN + bedroomFile.path.replace("public", "");
      }
  
      // Handle kitchen image
      if (files.kitchenSizeImage && files.kitchenSizeImage.length > 0) {
        const kitchenFile = files.kitchenSizeImage[0];
        imageUrls.kitchenSizeImage = serverConfig.NODE_ENV === "production"
          ? serverConfig.DOMAIN + kitchenFile.path.replace("/home", "")
          : serverConfig.DOMAIN + kitchenFile.path.replace("public", "");
      }
  
      // Handle living room image
      if (files.livingRoomSizeImage && files.livingRoomSizeImage.length > 0) {
        const livingRoomFile = files.livingRoomSizeImage[0];
        imageUrls.livingRoomSizeImage = serverConfig.NODE_ENV === "production"
          ? serverConfig.DOMAIN + livingRoomFile.path.replace("/home", "")
          : serverConfig.DOMAIN + livingRoomFile.path.replace("public", "");
      }
  
      // Handle dining area image
      if (files.diningAreaSizeImage && files.diningAreaSizeImage.length > 0) {
        const diningAreaFile = files.diningAreaSizeImage[0];
        imageUrls.diningAreaSizeImage = serverConfig.NODE_ENV === "production"
          ? serverConfig.DOMAIN + diningAreaFile.path.replace("/home", "")
          : serverConfig.DOMAIN + diningAreaFile.path.replace("public", "");
      }
  
      // Handle property terms document
      if (files.propertyTerms && files.propertyTerms.length > 0) {
        const propertyTermsFile = files.propertyTerms[0];
        imageUrls.propertyTerms = serverConfig.NODE_ENV === "production"
          ? serverConfig.DOMAIN + propertyTermsFile.path.replace("/home", "")
          : serverConfig.DOMAIN + propertyTermsFile.path.replace("public", "");
      }     
      
      await this.BuildingModel.create({
        propertyManagerId:userId, 
        ...imageUrls, 
        ...updateData
      });

    } catch (error) {

      console.log(error )
      throw new SystemError(error.name,  error.parent)
    }

  }


  
  async handleGetMyProperty(data) {

    let { 
    userId,
    role,
    type,
    page,
    pageSize
    } = await userUtil.verifyHandleGetMyProperty.validateAsync(data);
    
    try {

      if(role=='list'){
          
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let whereCondition = {
          propertyManagerId:userId, 
          isDeleted:false
        };

        if (type === 'vacant') {
          whereCondition.availability={
              [Op.or]: ['vacant', 'booked'], 
          }
          
        } else if (type === 'occupied') {
          whereCondition.availability= 'occupied'
          
        }
    

        const buildings = await this.BuildingModel.findAndCountAll({
          where: whereCondition, 
          limit,
          offset
        });
      
        return {
          data: buildings.rows,
          pagination:{
            totalItems: buildings.count,
            currentPage: page,
            totalPages: Math.ceil(buildings.count / pageSize)
        }
        };
      }
      
  
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
 


  }
  


  

  async handleSendInvoce(data) {

    let { 
        userIdList,
    } = await userUtil.verifyHandleSendInvoce.validateAsync(data);
    

    try {

      const processInvoices= async (userIdList) =>{
        if (userIdList.length === 0) return;
      
        const userId = userIdList[0];
        const remainingUserIdList = userIdList.slice(1);
      
        try {
          
          // Fetch tenant and building details
          const tenant = await this.TenantModel.findOne({
            where: {
              id: userId,
              isDeleted: false
            }
          });
          
          if (!tenant) {
            throw new NotFoundError("Tenant not found ")

          }
      
          const ProspectiveTenantResult = await this.ProspectiveTenantModel.findOne({
            where: {
              id: tenant.prospectiveTenantId,
              isDeleted: false
            }
          });

          const building = await this.BuildingModel.findOne({
            where: {
              id: tenant.buildingId,
              isDeleted: false
            }
          });

          const PropertyManagerModelResult = await this.PropertyManagerModel.findOne({
            where: {
              id: building.propertyManagerId,
            }
          });

      
          if (!building) {
            console.error(`Building with ID ${tenant.buildingId} not found.`);
          }
      
          // Create a transaction record
          const paymentReference = `rentInvoice-${Date.now()}-${userId}`;
          const amount = building.price; 
      
          await Transaction.create({
            userId: tenant.id,
            buildingId: tenant.buildingId,
            amount: amount,
            paymentReference: paymentReference,
            transactionType: 'rent',
          });

          const customerName=ProspectiveTenantResult.firstName+' '+ProspectiveTenantResult.lastName
     

          const createInvoiceData= await this.createInvoice({
            amount:  building.price,
            invoiceReference: paymentReference,
            customerName: customerName,
            customerEmail: ProspectiveTenantResult.emailAddress,
            description: 'Rent invoice',
            contractCode: '1209006936',
            expiryDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            redirectUrl: 'https://lagproperty.com',
          })
          // Send the invoice

          await this.sendInvoiceEmail(
            createInvoiceData , 
            format(new Date(tenant.rentNextDueDate), 'MMMM yyyy'), 
            tenant.rentNextDueDate, 
            building.rentalDuration, 
            PropertyManagerModelResult.companyName, 
            customerName
          ); 
      
        } catch (error) {
          console.error('Error processing invoice:', error);
        }
      
        // Recursively process the remaining tenants
        await processInvoices(remainingUserIdList);
      }

      processInvoices(userIdList);


    } catch (error) {
      console.log(error)
      throw new SystemError(error.name,  error.parent)

    }

  }



  async  createInvoice({
    amount,
    invoiceReference,
    customerName,
    customerEmail,
    description,
    currencyCode = 'NGN', // Default currency code
    contractCode,
    expiryDate,
    incomeSplitConfig,
    redirectUrl
  }) {
    try {
      // Prepare the request payload

      const authToken = await authService.getAuthTokenMonify();

      const payload = {
        amount,
        invoiceReference,
        description,
        currencyCode,
        contractCode,
        customerEmail,
        customerName,
        expiryDate,
        incomeSplitConfig,
        redirectUrl
      };
  
      // Make the API request to create the invoice
      const response = await axios.post(
        `${serverConfig.MONNIFY_BASE_URL}/api/v1/invoice/create`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
  
      // Check if the request was successful
      if (response.data.requestSuccessful) {
        // Extract and return the invoice data
        return response.data.responseBody;
      } else {
        // Log and handle the error
        console.error('Invoice creation failed:', response.data.responseMessage);
        return null;
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error creating invoice:', error);
      return null;
    }
  }




  async sendInvoiceEmail(invoiceDetails ,rentFor,rentNextDueDate,month,companyName, customerName ) {
    try {

      const { customerEmail, amount, invoiceReference, checkoutUrl, description } = invoiceDetails;
     

      const params = new URLSearchParams();
      params.append('invoiceReference', invoiceReference);
  
      await mailService.sendMail({ 
        to: customerEmail,
        subject: `Rent Invoice for ${rentFor} – Action Required`,
        templateName: "sendInvoice", 
        variables: {
          customerName: customerName,
          amount: amount,
          invoiceReference: invoiceReference,
          description: description,
          checkoutUrl: checkoutUrl,
          rentFor,
          rentNextDueDate,
          month,
          companyName,
          domain: serverConfig.DOMAIN,
        },
      });
  
    } catch (error) {
      console.error('Error sending invoice email:', error);
    }
  }


  async handleInspectionAction(data) {

    let { 
    userId,
    role,
    type,
    page , 
    pageSize, 
    inspectionId,
    inspectionMode,
    fullDate,
    emailAddress,
    tel,
    fullName,
    gender,
    note,
    } = await userUtil.verifyHandleInspectionAction.validateAsync(data);
    

    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
  
      if (type === 'getNotCreatedInspection') {

        if(role==="list"){
               
            const notCreatedInspections = await this.InspectionModel.findAndCountAll({
              where: { 
                inspectionStatus: 'notCreated', 
                isDeleted: false 
              },
              include: [{
                model: this.BuildingModel,
                where: { propertyManagerId: userId },
                required: true
              }],
              limit,
              offset,
            });
            return {
              data: notCreatedInspections.rows,
              pagination:{
                totalItems: notCreatedInspections.count,
                currentPage: page,
                pageSize,
                totalPages: Math.ceil(notCreatedInspections.count / pageSize),
              }
            };
        }
        else{
          const notCreatedInspections = await this.InspectionModel.findAndCountAll({
            where: { 
              inspectionStatus: 'notCreated', 
              prospectiveTenantId:userId,
              isDeleted: false 
            },
            limit,
            offset,
          });
          return {
            data: notCreatedInspections.rows,
            pagination:{
            totalItems: notCreatedInspections.count,
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(notCreatedInspections.count / pageSize),
            }
          };
        }
    
      }
      else if (type === 'getPendingInspection') {


        if(role==='list'){
          const pendingInspections = await this.InspectionModel.findAndCountAll({
            where: { inspectionStatus: 'pending', isDeleted: false },
            limit,
            offset,
            include: [
              {
                model: Building,
                /*attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], */
                where: { propertyManagerId: userId },
            },
          ],
          });
          return {
            data: pendingInspections.rows,
            pagination:{
              totalItems: pendingInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(pendingInspections.count / pageSize),
            }
          };
        }else{
          const pendingInspections = await this.InspectionModel.findAndCountAll({
            where: {
               inspectionStatus: 'pending', 
               prospectiveTenantId:userId,
               isDeleted: false },
            limit,
            offset,
            include: [
              {
                model: Building,
                /*attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], */
              },
          ],
          });
          return {
            data: pendingInspections.rows,
            pagination:{
              totalItems: pendingInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(pendingInspections.count / pageSize),
            }
          };
        }

       
  
      } 
      else if (type === 'getDeclineInspection') {

        if(role==='list'){
          const declinedInspections = await this.InspectionModel.findAndCountAll({
            where: { 
              inspectionStatus: 'decline',
              isDeleted: false 
            },
              limit,
              offset,
              include: [
              {
                model: Building,
                attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], 
                where: { propertyManagerId: userId },
                required: true
              },
          ]
          });
          return {
            data: declinedInspections.rows,
            pagination:{
              totalItems: declinedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(declinedInspections.count / pageSize),
            }
          };
        }
        else{
          const declinedInspections = await this.InspectionModel.findAndCountAll({
            where: { 
              inspectionStatus: 'decline',
              prospectiveTenantId:userId,
              isDeleted: false 
            },
              limit,
              offset,
              include: [
              {
                model: Building,
                attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], 
          },
          ]
          });
          return {
            data: declinedInspections.rows,
            pagination:{
              totalItems: declinedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(declinedInspections.count / pageSize),
            }
          };
        }
      
      } 
      else if (type === 'getAcceptedInspection') {
      
        if(role==='list'){

          const acceptedInspections = await this.InspectionModel.findAndCountAll({
            where: { 
              inspectionStatus: 'accepted', isDeleted: false },
              limit,
              offset,
              include: [
              {
                model: Building,
              /*  attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], */
                where: { propertyManagerId: userId },
                required: true
          },
          ]
          });
          return {
            data: acceptedInspections.rows,
            pagination:{
              totalItems: acceptedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(acceptedInspections.count / pageSize),
            }
          };
        }
        else{
          const acceptedInspections = await this.InspectionModel.findAndCountAll({
            where: { 
              inspectionStatus: 'accepted',
              prospectiveTenantId:userId,
              isDeleted: false },
              limit,
              offset,
              include: [
              {
                model: Building,
                attributes: [
                  'id',
                  'propertyManagerId',
                  'propertyPreference',
                  'propertyLocation',
                  'city',
                  'address',
                  'lat',
                  'lng',
                  'numberOfFloors',
                  'numberOfRooms',
                  'amenity',
                  'roomPreference',
                  'availability',
                  'furnishingStatus',
                  'rentalDuration',
                  'price',
                  'electricityBill',
                  'wasteBill',
                  'commissionBill',
                  'propertyDescription',
                  'bedroomSizeLength',
                  'bedroomSizeWidth',
                  'bedroomSizeImage',
                  'kitchenSizeLength',
                  'kitchenSizeWidth',
                  'kitchenSizeImage',
                  'livingRoomSizeLength',
                  'livingRoomSizeWidth',
                  'livingRoomSizeImage',
                  'diningAreaSizeLength',
                  'diningAreaSizeWidth',
                  'diningAreaSizeImage',
                  'propertyTerms',
                ], 
          },
          ]
          });
          return {
            data: acceptedInspections.rows,
            pagination:{
              totalItems: acceptedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(acceptedInspections.count / pageSize),
            }
          };
        }
      
      } 
      else if (type === 'createInspection') {

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        });

        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
           
        await inspection.update({
          inspectionMode,
          fullDate,      
          emailAddress,
          tel,
          fullName,
          gender,
          inspectionStatus: 'pending',
        });
  
        return inspection;
  
      }
      else if (type === 'refund') {

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        });

        const RefundLogModelResult2 = await this.RefundLogModel.findOne({
          where: { 
            transactionReference: inspectionId.transactionReference,
            isDeleted: false }
        });

        if(RefundLogModelResult2.refundStatus==='COMPLETED') return "refund already made"


        const transactionResult = await this.TransactionModel.findOne({
          where: { transactionReference: inspection.transactionReference, 
            isDeleted: false }
        });

        const ProspectiveTenantResult = await this.ProspectiveTenantModel.findOne({
          where: { id: inspection.prospectiveTenantId, 
            isDeleted: false }
        });
      
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }

        const transactionReference=this.generateReference()
        const refund = await this.RefundLogModel.create({
          oldTransactionReference: inspection.transactionReference,
          refundTransactionReference: "refund_inspection"+"_"+transactionReference,
          inspectionId: inspection.id,
          buildingId: inspection.buildingId,
          refundReason: note, 
          prospectiveTenantId: inspection.prospectiveTenantId, 
          role
        });

        const authToken = await authService.getAuthTokenMonify();

        const refundMetaData={
          transactionReference: inspection.transactionReference,
          refundReference:"refund_inspection"+"_"+transactionReference,
          refundAmount: transactionResult.amount, 
          refundReason: note, 
          customerNote:note,
          destinationAccountNumber: ProspectiveTenantResult.bankAccount,
          destinationAccountBankCode: ProspectiveTenantResult.bankCode
        }

        const refundResponse = await this.initiateRefund(refundMetaData ,authToken);
      
          if (refundResponse.responseBody.refundStatus=="COMPLETED") {

            const RefundLogModelResult = await this.RefundLogModel.findOne({
              where:{
                transactionReference:refundResponse.responseBody.refundReference
              }
            });
            await RefundLogModelResult.update({
              refundStatus: 'PAID'
            });

            await inspection.update({
              inspectionStatus: 'refunded',
              note:refundResponse.responseBody.refundReason,
              propertyManagerStatus:false
            });
           
            return 'refund completed';
          } 
          else {
            refund.update({
              refundStatus:refundResponse.responseBody.refundStatus
            })
          }
       
      }      
      else if (type === 'acceptInspection') {

        if(role=='rent')throw new BadRequestError("Not a property owner")

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        })

        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }

        const building = await this.BuildingModel.findOne({
          where: { 
            id: inspection.buildingId, 
            propertyManagerId:userId, 
            isDeleted: false 
          }
        })

        if(building){

          await inspection.update({
            inspectionStatus:'accepted',
          });
    
          return inspection;
           
        }
        else{
          throw new NotFoundError('Inspection not found for the building');
        }

      }
      else if (type === 'declineInspection') {
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        });
  
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
        

        if(note){
          await inspection.update({
            inspectionStatus:'decline',
            note
          });
        }else{
          await inspection.update({
            inspectionStatus:'decline'
          });
        }
       
  
        return inspection;
  
      }
      else if(type==='acceptTenant'){
        
        const inspection = await this.InspectionModel.findOne({
          where: { 
            id: inspectionId, 
            isDeleted: false 
          }
        })
  
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
        if(inspection.tenentStatus===true&&inspection.propertyManagerStatus===true) return 'Tenant has been accepted already'

        await inspection.update({
          propertyManagerStatus:true
        });

        if(inspection.tenentStatus===true){

          const BuildingModelResult= await this.BuildingModel.findOne({
            where: { id: inspection.buildingId, isDeleted: false }
          })
          const TransactionModelResult2= await this.TransactionModel.findOne({
            where: { id: inspection.transactionReference, isDeleted: false }
          })

          const PropertyManagerModelResult= await this.PropertyManagerModel.findByPk(BuildingModelResult.propertyManagerId)
          
          this.processDisbursement(PropertyManagerModelResult ,inspection ,TransactionModelResult2)

         
        }

      }
      else if(type==='releaseFund'){
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        })
  
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
        
        if(inspection.tenentStatus===true&&inspection.propertyManagerStatus===true) return 'transaction has been initiated check transaction status'
        
      
        await inspection.update({
          tenentStatus:true
        });
      

        if(inspection.propertyManagerStatus===true){

            const BuildingModelResult= await this.BuildingModel.findOne({
              where: { id: inspection.buildingId, isDeleted: false }
            })
  
            const TransactionModelResult2= await this.TransactionModel.findOne({
              where: { transactionReference: inspection.transactionReference, isDeleted: false }
            })
  
            const PropertyManagerModelResult= await this.PropertyManagerModel.findByPk(BuildingModelResult.propertyManagerId)
            
            this.processDisbursement(PropertyManagerModelResult ,inspection ,TransactionModelResult2)
          
        }

      }
      else if(type==='escrowBalance'){
        
        const buildings = await this.BuildingModel.findAll({
          where: { propertyManagerId: userId },
          attributes: ['id'],
        });
    
        if (buildings.length === 0) {
          return {totalBalance : 0};
        }
    
        const buildingIds = buildings.map(building => building.id);
    
        // Fetch all inspections for the user's buildings with the specified criteria
        const inspections = await this.InspectionModel.findAll({
          where: {
            buildingId: buildingIds,
            propertyManagerStatus: null,
            tenentStatus: null,
            inspectionStatus: {
              [Op.or]: ['accepted', 'pending', 'notCreated']
            }
          },
          attributes: ['transactionReference']
        });
    
        if (inspections.length === 0) {
          return {totalBalance : 0};
        }
    
        const transactionReferences = inspections.map(inspection => inspection.transactionReference);
    
        // Fetch all transactions for the transaction references found
        const transactions = await this.TransactionModel.findAll({
          where: {
            transactionReference: transactionReferences
          },
          attributes: ['amount']
        });
    
        // Calculate the total balance
        const totalBalance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
        return {totalBalance : totalBalance};

      }
  
    } catch (error) {
      console.log(error)
      throw new SystemError(error.name,  error.parent)

    }
 


  }

  async processDisbursement(PropertyManagerModelResult, inspection, TransactionModelResult){
    
    const TransactionModelResultAmount=TransactionModelResult.amount
    try {
      if(PropertyManagerModelResult=='landLord'){
        const authToken = await authService.getAuthTokenMonify();
  
        const paymentReference="firstRent"+"_"+this.generateReference()
  
         await this.TransactionModel.create({
          userId: inspection.prospectiveTenantId,
          inspectionId:inspection.id,
          buildingId:inspection.buildingId,
          amount:TransactionModelResult.amount,
          paymentReference,
          transactionType:'fistRent'
        });
  
        const transferDetails = {
          amount: this.calculateDistribution(TransactionModelResultAmount, 'landlord', false, 'initial deposit').landlordShare,
          reference: paymentReference,
          narration: 'Rent Payment ',
          destinationBankCode: PropertyManagerModelResult.landlordBankCode,
          destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
          currency: 'NGN',
          sourceAccountNumber: serverConfig.MONNIFY_ACC,
          async:true
        };
  
        await this.initiateTransfer(authToken, transferDetails);
      
      }
      else{

        const paymentReference="firstRent"+"_"+this.generateReference()
  
        const authToken = await authService.getAuthTokenMonify();

        await this.TransactionModel.create({
          userId: inspection.prospectiveTenantId,
          inspectionId:inspection.id,
          buildingId:inspection.buildingId,
          amount:TransactionModelResultAmount,
          paymentReference,
          transactionType:'fistRent'
        });

        const transferDetails = {
          amount: this.calculateDistribution(TransactionModelResultAmount, 'landlord', true, 'initial deposit').landlordShare,
          reference: paymentReference,
          narration: 'Rent Payment ',
          destinationBankCode: PropertyManagerModelResult.landlordBankCode,
          destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
          currency: 'NGN',
          twoFaEnabled:false,
          sourceAccountNumber: serverConfig.MONNIFY_ACC,
          async:true
        };
  
        await this.initiateTransfer(authToken, transferDetails);
      
  
          
        
        //BELOW IS FOR AGENT TRANSFER
  
        const paymentReference2="commission"+"_"+this.generateReference()
  

        await this.TransactionModel.create({
          userId: inspection.prospectiveTenantId,
          inspectionId:inspection.id,
          buildingId:inspection.buildingId,
          amount:TransactionModelResultAmount,
          paymentReference:paymentReference2,
          transactionType:'commission'
        });
        const transferDetails2 = {
          amount: this.calculateDistribution(TransactionModelResultAmount, 'landlord', true, 'initial deposit').agentShare,
          reference: paymentReference2,
          narration: 'commission',
          destinationBankCode: PropertyManagerModelResult.agentBankCode,
          destinationAccountNumber: PropertyManagerModelResult.agentBankAccount,
          currency: 'NGN',
          twoFaEnabled:false,
          sourceAccountNumber: serverConfig.MONNIFY_ACC,
          async:true
        };
  
        await this.initiateTransfer(authToken, transferDetails2);
       
      }
    } catch (error) {
        console.log(error)
        throw(error)
    }
  }

  async updateTransferTransaction(db, transferData){

    try {
      const TransactionModelResult=db.findOne({
        where:{
          transactionReference:transferData.responseBody.reference
        }
      })
      if (TransactionModelResult) {

        await TransactionModelResult.update({
          paymentStatus:transferData.responseBody.status
        });
  
        if(transferData.responseBody.status==="SUCCESS"){

          const BuildingModelResult=await this.BuildingModel.findByPk(TransactionModelResult.buildingId)

          const TenantModelResult=await this.TenantModel.findOne({
            where:{
              buildingId:TransactionModelResult.buildingId
            }
          })

          if(!TenantModelResult||TenantModelResult.status=='terminated'){
            this.TenantModel.create({
              buildingId:TransactionModelResult.buildingId,
              prospectiveTenantId:TransactionModelResult.prospectiveTenantId,
              status:'active',
              rentNextDueDate:this.calculateRentNextDueDate(BuildingModelResult.rentalDuration)
            })
          }
        }
  
      } else {
        console.log('Transaction not found with reference:', reference);
      }


    } catch (error) {
      console.error('An error occurred while updating the transaction:', error.message);
    }

  }


  calculateRentNextDueDate(months, fromDate = new Date()) {
    if (!Number.isInteger(months) || months <= 0) {
      throw new Error('The number of months must be a positive integer.');
    }
  
    const rentNextDueDate = addMonths(fromDate, months);
    return rentNextDueDate;
  }

  async  initiateTransfer(token, transferDetails) {
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
  }

  async handleChat(data, file) {

    const validationResult= await userUtil.verifyHandleChat.validateAsync(data);
    
    const { userId, receiverId, messageType, message, repliedMessageId, role } = validationResult;

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

      const newChat = await this.ChatModel.create({
        senderId: userId,
        receiverId,
        messageType,
        role,
        message: messageType === 'text' ? message : null,
        image: messageType === 'file' ? imageUrl : null,
        repliedMessageId: repliedMessageId || null,
      });
  
      return newChat;

   
 
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
  }



  async handleGetChat(data) {

    const validationResult= await userUtil.verifyHandleGetChat.validateAsync(data);
    
    const { userId, type, partnerId, role } = validationResult;

    console.log(role)
    try { 
      
      let chatMessages;

      // Define the role opposites
      const oppositeRole = (role) => (role === 'list' ? 'rent' : 'list');
    
      if (type === 'chatDetail') {
        chatMessages = await this.ChatModel.findAll({
          where: {
            isDeleted: false,
            [Op.or]: [
              { senderId: userId, receiverId: partnerId, role },
              { senderId: partnerId, receiverId: userId, role: oppositeRole(role) },
            ],
          },
          include: [
            {
              model: Chat,
              as: 'RepliedMessage',
              attributes: ['id', 'message', 'messageType'],
            },
          ],
          order: [['createdAt', 'ASC']]
        });
      } 
      else if (type === 'summary') {

     
        const chatMap = new Map();

        // Fetch summary of chat messages for a given userId
        let allchat = await this.ChatModel.findAll({
          where: {
            isDeleted: false,
            [Op.or]: [
              // Case when the user is the sender
              { senderId: userId, role },
              // Case when the user is the receiver and the opposite role is checked
              { receiverId: userId, role: oppositeRole(role) },
            ],
          },
          include: [
            {
              model: Chat,
              as: 'RepliedMessage',
              attributes: ['id', 'message', 'messageType'],
            },
          ],
        });

        allchat.forEach((message) => {
          const key = `${message.senderId}-${message.receiverId}`;
          
          if (!chatMap.has(key)) {
            chatMap.set(key, message);
          } else {
            const existingMessage = chatMap.get(key);

            //console.log(existingMessage)
            const messageTimestamp = new Date(message.createdAt).getTime();
            const existingMessageTimestamp = new Date(existingMessage.createdAt).getTime();
            if (messageTimestamp > existingMessageTimestamp) {
              chatMap.set(key, message);
            }
          }
        });


        chatMessages= Array.from(chatMap.values());

      } 
    
      return chatMessages;

 
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

    }
  }





  generateReference() {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric string
  
    return `REF-${timestamp}-${randomString}`;
  }


  calculateDistribution(amount, type, hasAgent, paymentType) {
    let landlordShare = 0;
    let agentShare = 0;
    let appShare = 0;

    if (paymentType === 'initial deposit') {
        if (hasAgent) {
            agentShare = amount * 0.10;
            appShare = amount * 0.05;
            landlordShare = amount - agentShare - appShare;
        } else {
            appShare = amount * 0.05;
            landlordShare = amount - appShare;
        }
    } else if (paymentType === 'rent') {
        appShare = amount * 0.05;
        landlordShare = amount - appShare;
    }

    return {
        landlordShare,
        agentShare,
        appShare
    };
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
  

  async  sendEmailVerificationCode(emailAddress, userId ,password) {

    try {
 
        try {

          const params = new URLSearchParams();
                params.append('userId', userId);
                params.append('verificationCode',verificationCode);
                params.append('type', 'email');

            
            await mailService.sendMail({ 
              to: emailAddress,
              subject: "Account details and verification",
              templateName: "sendInvoice",
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