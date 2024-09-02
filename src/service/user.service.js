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
import { addMonths } from 'date-fns';
import { fn, col, literal} from 'sequelize';

import {
  NotFoundError,   
  ConflictError,
  BadRequestError,
  SystemError

} from "../errors/index.js";
import { Console } from "console";
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

    const { userId, type ,role , page, pageSize,} = await userUtil.verifyHandleGetTransaction.validateAsync(data);

    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;
      
      let transactions;

      if (role === 'rent') {

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
        transactions = await this.TransactionModel.findAll({
          where: {
            isDeleted:false
          },
          order: [['createdAt', 'DESC']],
          include: [{
            model: this.BuildingModel,
            where: {
              userId: userId
            }
          }],
          limit,
          offset
        });
      }
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
          as: 'propertyManagerBuilding',
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
          attributes: ['id', 'reviewText', 'rating', 'createdAt'],
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
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
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
    threeDaysFromNow.setDate(today.getDate() + 3);

    const totalCount = await Inspection.count({
      include: [
        {
          model: this.BuildingModel,
          as: 'BuildingInspection',
          include: [
            {
              model: this.PropertyManagerModel,
              as: 'propertyManagerBuilding',
              where: { id: userId },
            },
          ],
        },
      ],
      where: {
        fullDate: {
          [Op.between]: [today, threeDaysFromNow], // Filter for inspections within today and the next 3 days
        },
        isDeleted: false,
      },
    });

    const upcomingInspections = await Inspection.findAll({
      include: [
        {
          model: Building,
          as: 'Building',
          include: [
            {
              model: PropertyManager,
              as: 'PropertyManager',
              where: { id: userId },
            },
          ],
        },
      ],
      where: {
        fullDate: {
          [Op.between]: [today, threeDaysFromNow], // Filter for inspections within today and the next 3 days
        },
        isDeleted: false,
      },
      limit,
      offset,
      order: [['fullDate', 'ASC']], // Order by date
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      inspections: upcomingInspections,
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
      const { count, rows } = await PropertyManagerReview.findAndCountAll({
        where: {
          tenantId: tenantId,
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
      tenantId,
      review,
    } = await userUtil.verifyHandleReviewTenant.validateAsync(data);
    
    if(role=='rent') throw new BadRequestError("Tenant dont have this access")

    try {
      await PropertyManagerReview.create({
        propertyManagerId:userId,
        tenantId:tenantId,
        review: review,
      });

    } catch (error) {
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
    

    if(role=='rent') throw new BadRequestError("Tenant dont have this access")

      if (type === 'send') {
        // Create a new quit notice
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
    

        console.log(whereCondition)

        const buildings = await this.BuildingModel.findAndCountAll({
          where: whereCondition, 
          limit,
          offset
        });
      
        return {
          data: buildings.rows,
          totalItems: buildings.count,
          currentPage: page,
          totalPages: Math.ceil(buildings.count / pageSize),
        };
      }
      
  
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

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
              totalItems: notCreatedInspections.count,
              currentPage: page,
              totalPages: Math.ceil(notCreatedInspections.count / pageSize),
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
            totalItems: notCreatedInspections.count,
            currentPage: page,
            totalPages: Math.ceil(notCreatedInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: pendingInspections.count,
            currentPage: page,
            totalPages: Math.ceil(pendingInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: pendingInspections.count,
            currentPage: page,
            totalPages: Math.ceil(pendingInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: declinedInspections.count,
            currentPage: page,
            totalPages: Math.ceil(declinedInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: declinedInspections.count,
            currentPage: page,
            totalPages: Math.ceil(declinedInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: acceptedInspections.count,
            currentPage: page,
            totalPages: Math.ceil(acceptedInspections.count / pageSize),
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
                as: 'BuildingInspection',
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
            totalItems: acceptedInspections.count,
            currentPage: page,
            totalPages: Math.ceil(acceptedInspections.count / pageSize),
          };
        }
      
  
      } 
      else if (type === 'createInspection') {

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        });

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
          refundTransactionReference: inspection.transactionReference,
          inspectionId: inspection.id,
          buildingId: inspection.buildingId,
          refundReason: note, 
          prospectiveTenantId: inspection.prospectiveTenantId, 
          role
        });

        const authToken = await authService.getAuthTokenMonify();

        const refundMetaData={
          transactionReference: transactionReference,
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
        
        await inspection.update({
          inspectionStatus:'accepted',
        });
  
        return inspection;
  
      }
      else if (type === 'declineInspection') {
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        });
  
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
  
        await inspection.update({
          inspectionStatus:'decline',
          note
        });
  
        return inspection;
  
      }
      else if(type==='acceptTenant'){
        
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false }
        })
  
        if (!inspection) {
          throw new NotFoundError('Inspection not found');
        }
        if(inspection.tenentStatus===true&&inspection.propertyManagerStatus===true) return 'Tenant has been accepted already'

        await inspection.update({
          inspectionStatus:'accepted',
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
    
          if(PropertyManagerModelResult=='landLord'){
            const authToken = await authService.getAuthTokenMonify();
            const transactionReference=this.generateReference()
            await this.TransactionModel.create({
              user: inspection.prospectiveTenantId,
              buildingId:inspection.buildingId,
              amount:this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare  ,
              transactionReference,
              paymentReference:"firstRent"+"_"+this.generateReference(),
              transactionType:'commissionOrRent'
            });


            landlordShare,
            agentShare,
            appShare
            const transferDetails = {
              amount:this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare ,   
              reference:transactionReference,
              narration: 'Rent Payment ',
              destinationBankCode: PropertyManagerModelResult.landlordBankCode,
              destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC
            };

              await this.initiateTransfer(authToken, transferDetails);
           /* if(transferResponse){
                this.updateTransferTransaction(this.TransactionModel, transferResponse);
            }*/
            

          }
          else{
            const authToken = await authService.getAuthTokenMonify();
            const transactionReference=this.generateReference()
            await this.TransactionModel.create({
              user: inspection.prospectiveTenantId,
              buildingId:inspectionId.buildingId,
              amount:this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare  ,
              transactionReference,
              paymentReference:"firstRent"+"_"+this.generateReference(),
              transactionType:'commissionOrRent'
            });


            const transferDetails = {
              amount: this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare,
              reference: transactionReference,
              narration: 'Rent Payment ',
              destinationBankCode: PropertyManagerModelResult.landlordBankCode,
              destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC
            };

            await this.initiateTransfer(authToken, transferDetails);
          /*  if(transferResponse){
                this.updateTransferTransaction(this.TransactionModel, transferResponse);
            }*/

            //BELOW IS FOR AGENT TRANSFER
            const transactionReference2=this.generateReference()

            await this.TransactionModel.create({
              user:  inspection.prospectiveTenantId,
              buildingId:inspectionId.buildingId,
              amount:this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare  ,
              transactionReference:transactionReference2,
              paymentReference:"commission"+"_"+this.generateReference(),
              transactionType:'commissionOrRent'
            });
            const transferDetails2 = {
              amount: this.calculateDistribution(TransactionModelResult2.amount, 'landlord', false, 'initial deposit').landlordShare,
              reference:transactionReference2,
              narration: 'commission',
              destinationBankCode: PropertyManagerModelResult.agentBankCode,
              destinationAccountNumber: PropertyManagerModelResult.agentBankAccount,
              currency: 'NGN',
              sourceAccountNumber: serverConfig.MONNIFY_ACC
            };

             await this.initiateTransfer(authToken, transferDetails2);
           /* if(transferResponse2){
                this.updateTransferTransaction(this.TransactionModel, transferResponse2);
            }*/
          }

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

        

        if(inspection.propertyManagerStatus===true){

            const BuildingModelResult= await this.BuildingModel.findOne({
              where: { id: inspection.buildingId, isDeleted: false }
            })
  
            const TransactionModelResult2= await this.TransactionModel.findOne({
              where: { id: inspection.transactionReference, isDeleted: false }
            })
  
            const PropertyManagerModelResult= await this.PropertyManagerModel.findByPk(BuildingModelResult.propertyManagerId)
      
            if(PropertyManagerModelResult=='landLord'){
              const authToken = await authService.getAuthTokenMonify();
  

              
              const TransactionModelResult = await this.TransactionModel.create({
                user: inspection.transactionReference,
                buildingId:inspectionId.buildingId,
                amount:TransactionModelResult2.amount,
                transactionReference:this.generateReference(),
                paymentReference:inspection.transactionReference,
                transactionType:'commissionOrRent'
              });
  
              const transferDetails = {
                amount: this.calculateDistribution(1000, 'landlord', false, 'initial deposit'),
                reference: TransactionModelResult.id,
                narration: 'Rent Payment ',
                destinationBankCode: PropertyManagerModelResult.landlordBankCode,
                destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
                currency: 'NGN',
                sourceAccountNumber: serverConfig.MONNIFY_ACC
              };
  
              const transferResponse = await this.initiateTransfer(authToken, transferDetails);
              if(transferResponse){
                  this.updateTransferTransaction(this.TransactionModel, transferResponse);
              }
              
            }
            else{
              const authToken = await authService.getAuthTokenMonify();
              const TransactionModelResult = await this.TransactionModel.create({
                user: inspection.transactionReference,
                buildingId:inspectionId.buildingId,
                amount:TransactionModelResult2.amount,
                transactionReference:this.generateReference(),
                paymentReference:inspection.transactionReference,
                transactionType:'commissionOrRent'
              });
              const transferDetails = {
                amount: this.calculateDistribution(1000, 'landlord', true, 'initial deposit'),
                reference: TransactionModelResult.id,
                narration: 'Rent Payment ',
                destinationBankCode: PropertyManagerModelResult.landlordBankCode,
                destinationAccountNumber: PropertyManagerModelResult.landlordBankAccount,
                currency: 'NGN',
                sourceAccountNumber: serverConfig.MONNIFY_ACC
              };
  
              const transferResponse = await this.initiateTransfer(authToken, transferDetails);
              if(transferResponse){
                  this.updateTransferTransaction(this.TransactionModel, transferResponse);
              }
  
              //BELOW IS FOR AGENT TRANSFER
  
              const TransactionModelResult2 = await this.TransactionModel.create({
                user: inspection.transactionReference,
                buildingId:inspectionId.buildingId,
                amount:TransactionModelResult2.amount,
                transactionReference:this.generateReference(),
                paymentReference:inspection.transactionReference,
                transactionType:'commissionOrRent'
              });
              const transferDetails2 = {
                amount: this.calculateDistribution(1000, 'landlord', true, 'initial deposit'),
                reference: TransactionModelResult.id,
                narration: 'commission',
                destinationBankCode: PropertyManagerModelResult.agentBankCode,
                destinationAccountNumber: PropertyManagerModelResult.agentBankAccount,
                currency: 'NGN',
                sourceAccountNumber: serverConfig.MONNIFY_ACC
              };
  
              const transferResponse2 = await this.initiateTransfer(authToken, transferDetails2);
              if(transferResponse2){
                  this.updateTransferTransaction(this.TransactionModel, transferResponse2);
              }
            }
  
          
        }

      }
  
    } catch (error) {

      throw new SystemError(error.name,  error.parent)

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