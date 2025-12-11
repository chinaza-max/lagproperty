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
  Notification,
  Setting,
  Tenant,
} from "../db/models/index.js";
import userUtil from "../utils/user.util.js";
import authService from "../service/auth.service.js";
import bcrypt from "bcrypt";
import serverConfig from "../config/server.js";
import { Op, Sequelize, where } from "sequelize";
import mailService from "../service/mail.service.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { addMonths, format } from "date-fns";
import { fn, col, literal } from "sequelize";

import axios from "axios";

import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  SystemError,
} from "../errors/index.js";
import { type } from "os";
import { response } from "express";

const regions = {
  "North Central": [
    "Benue",
    "Kogi",
    "Kwara",
    "Nasarawa",
    "Niger",
    "Plateau",
    "Federal Capital Territory",
  ],
  "North East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
  "North West": [
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Sokoto",
    "Zamfara",
  ],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": [
    "Akwa Ibom",
    "Bayelsa",
    "Cross River",
    "Delta",
    "Edo",
    "Rivers",
  ],
  "South West": ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"],
};

class UserService {
  EmailandTelValidationModel = EmailandTelValidation;
  PropertyManagerModel = PropertyManager;
  BuildingModel = Building;
  TenantModel = Tenant;
  TransactionModel = Transaction;
  InspectionModel = Inspection;
  RefundLogModel = RefundLog;
  ProspectiveTenantModel = ProspectiveTenant;
  ChatModel = Chat;
  QuitNoticeModel = QuitNotice;
  PropertyManagerReviewModel = PropertyManagerReview;
  TenantReviewModel = TenantReview;
  NotificationModel = Notification;
  SettingModel = Setting;

  /*
  async handleUpdateProfile(data, file) {
    if (data.role == "list") {
      let { userId, role, image, ...updateData } =
        await userUtil.verifyHandleUpdateProfileList.validateAsync(data);

      try {
        let imageUrl = "";
        if (file) {
          if (serverConfig.NODE_ENV == "production") {
            imageUrl = serverConfig.DOMAIN + file.path.replace("/home", "");
          } else if (serverConfig.NODE_ENV == "development") {
            imageUrl = serverConfig.DOMAIN + file.path.replace("public", "");
          }
        }

        if (file) {
          updateData.isProfileCompleted = true;

          await this.PropertyManagerModel.update(
            { image: imageUrl, ...updateData },
            { where: { id: userId } }
          );
        } else {
          updateData.isProfileCompleted = true;
          await this.PropertyManagerModel.update(updateData, {
            where: { id: userId },
          });
        }
      } catch (error) {
        throw new SystemError(error.name, error.parent);
      }
    } else {
      let { userId, role, image, lasrraId, ...updateData } =
        await userUtil.verifyHandleUpdateProfileRent.validateAsync(data);

      try {
        if (lasrraId) {
          updateData.isProfileCompleted = true;
          await this.ProspectiveTenantModel.update(
            { lasrraId, ...updateData },
            { where: { id: userId } }
          );
        } else {
          updateData.isProfileCompleted = true;
          await this.ProspectiveTenantModel.update(
            { lasrraId: uuidv4(), ...updateData },
            { where: { id: userId } }
          );
        }
      } catch (error) {
        throw new SystemError(error.name, error.parent);
      }
    }
  }
  */
  async handleUpdateProfile(data, file) {
    if (data.role === "list") {
      let { userId, role, image, nin, ...updateData } =
        await userUtil.verifyHandleUpdateProfileList.validateAsync(data);

      try {
        // Handle NIN validation
        if (nin) {
          const existingUser = await this.PropertyManagerModel.findOne({
            where: { nin },
          });

          if (existingUser) {
            if (existingUser.isNINValid && existingUser.id !== userId) {
              throw new SystemError(
                "NINAlreadyVerified",
                "This NIN is already verified by another user"
              );
            }
            // if not verified, allow update
          }
          updateData.nin = nin;
        }

        let imageUrl = "";
        if (file) {
          if (serverConfig.NODE_ENV === "production") {
            imageUrl = serverConfig.DOMAIN + file.path.replace("/home", "");
          } else if (serverConfig.NODE_ENV === "development") {
            imageUrl = serverConfig.DOMAIN + file.path.replace("public", "");
          }
        }

        updateData.isProfileCompleted = true;

        if (file) {
          await this.PropertyManagerModel.update(
            { image: imageUrl, ...updateData },
            { where: { id: userId } }
          );
        } else {
          await this.PropertyManagerModel.update(updateData, {
            where: { id: userId },
          });
        }
      } catch (error) {
        throw new SystemError(error.name, error.parent || error.message);
      }
    } else {
      let { userId, role, image, lasrraId, nin, ...updateData } =
        await userUtil.verifyHandleUpdateProfileRent.validateAsync(data);

      try {
        // Handle NIN validation for tenants
        if (nin) {
          const existingTenant = await this.ProspectiveTenantModel.findOne({
            where: { nin },
          });

          if (existingTenant) {
            if (existingTenant.isNINValid && existingTenant.id !== userId) {
              throw new SystemError(
                "NINAlreadyVerified",
                "This NIN is already verified by another user"
              );
            }
            // if not verified, allow update
          }
          updateData.nin = nin;
        }

        if (lasrraId) {
          updateData.isProfileCompleted = true;
          await this.ProspectiveTenantModel.update(
            { lasrraId, ...updateData },
            { where: { id: userId } }
          );
        } else {
          updateData.isProfileCompleted = true;
          await this.ProspectiveTenantModel.update(
            { lasrraId: uuidv4(), ...updateData },
            { where: { id: userId } }
          );
        }
      } catch (error) {
        throw new SystemError(error.name, error.parent || error.message);
      }
    }
  }

  async handleProspectiveTenantInformation(data) {
    const { userId, inspectionId, role, page, pageSize } =
      await userUtil.verifyHandleProspectiveTenantInformation.validateAsync(
        data
      );

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      const inspectionResult = await this.InspectionModel.findOne({
        where: { id: inspectionId, isDeleted: false },
      });

      if (!inspectionResult) {
        throw new Error("Inspection not found.");
      }

      let tenantData = await this.ProspectiveTenantModel.findOne({
        where: {
          id: inspectionResult.prospectiveTenantId,
        },
        include: [
          {
            as: "PropertyManagerReview",
            model: this.PropertyManagerReviewModel,
            limit,
            offset,
          },
        ],
      });

      if (!tenantData) {
        throw new NotFoundError("Tenant data not found");
      }

      const totalItems = await this.PropertyManagerReviewModel.count({
        where: {
          prospectiveTenantId: inspectionResult.prospectiveTenantId,
        },
      });

      const totalPages = Math.ceil(totalItems / pageSize);

      return {
        data: tenantData,
        pagination: {
          totalItems,
          currentPage: parseInt(page, 10),
          pageSize: limit,
          totalPages,
        },
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleTenant(data) {
    const { userId, role, page, pageSize } =
      await userUtil.verifyHandleTenant.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      let tenantData = await this.TenantModel.findAndCountAll({
        where: {
          status: { [Op.in]: ["active", "rentDue"] },
        },
        include: [
          {
            model: this.BuildingModel,
            attributes: ["price", "propertyPreference"],
            where: {
              propertyManagerId: userId,
            },
          },
          {
            model: this.ProspectiveTenantModel,
            attributes: [
              "id",
              "maritalStatus",
              "stateOfOrigin",
              "image",
              "firstName",
              "lastName",
              "tel",
              "emailAddress",
              "disableAccount",
              "lasrraId",
            ],
          },
        ],
        offset,
        limit,
      });

      const totalPages = Math.ceil(tenantData.count / pageSize);

      return {
        response: tenantData.rows,
        pagination: {
          totalItems: tenantData.count,
          currentPage: parseInt(page, 10),
          pageSize: limit,
          totalPages,
        },
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleRentAction(data) {
    const { userId, role, type, page, pageSize } =
      await userUtil.verifyHandleRentAction.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      let tenantData;
      let totalPages;

      if (role === "list") {
        if (type === "recentRent") {
          // Fetch tenants with rent recently received
          tenantData = await this.TenantModel.findAndCountAll({
            where: {
              status: "active",
              /*rentNextDueDate: {
                [Op.ne]: null, 
              }*/
            },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["price"],
                where: {
                  propertyManagerId: userId,
                },
              },
            ],
            order: [
              ["rentNextDueDate", "DESC"], // Order by most recent rent date
            ],
            offset,
            limit,
          });
        } else if (type === "tenantInvoicesDue") {
          // Fetch tenants with rent due
          tenantData = await this.TenantModel.findAndCountAll({
            where: {
              status: "rentDue",
              rentNextDueDate: {
                [Op.lte]: new Date(),
              },
            },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["id"],
                where: {
                  propertyManagerId: userId,
                },
              },
            ],
            order: [["rentNextDueDate", "ASC"]],
            offset,
            limit,
          });
        }

        totalPages = Math.ceil(tenantData.count / pageSize);
      } else if (role === "rent") {
        if (type === "tenantInvoicesDue") {
          // Fetch tenants with rent due
          tenantData = await this.TenantModel.findAndCountAll({
            where: {
              status: "rentDue",
              prospectiveTenantId: userId,
              rentNextDueDate: {
                [Op.lte]: new Date(),
              },
            },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["id"],
              },
            ],
            order: [["rentNextDueDate", "ASC"]],
            offset,
            limit,
          });
        }

        totalPages = Math.ceil(tenantData.count / pageSize);
      }
      return {
        response: tenantData.rows,
        pagination: {
          totalItems: tenantData.count,
          currentPage: parseInt(page, 10),
          pageSize: limit,
          totalPages,
        },
      };
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetInspectionDetails(data) {
    const { userId, role, inspectionId } =
      await userUtil.verifyHandleGetInspectionDetails.validateAsync(data);

    try {
      const inspection = await this.InspectionModel.findOne({
        where: { id: inspectionId },
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: Building,
            as: "BuildingInspection",
          },
          {
            model: this.ProspectiveTenantModel,
            as: "MyInspection",
            attributes: {
              exclude: ["password"],
            },
          },
        ],
      });

      if (!inspection) {
        throw new NotFoundError("Inspection not found");
      }

      return inspection;
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetTransactionRefund(data) {
    const { userId, role, page, pageSize } =
      await userUtil.verifyHandleGetTransactionRefund.validateAsync(data);

    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      let transactions;

      if (role === "rent") {
        transactions = await this.RefundLogModel.findAll({
          where: {
            prospectiveTenantId: userId,
          },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
      } else if (role === "list") {
        transactions = await this.RefundLogModel.findAll({
          where: {
            isDeleted: false,
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: this.BuildingModel,
              where: {
                prospectiveTenantId: userId,
              },
            },
          ],
          limit,
          offset,
        });
      }

      return transactions;
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetTransaction(data) {
    const { userId, role, page, pageSize } =
      await userUtil.verifyHandleGetTransaction.validateAsync(data);

    try {
      const offset = (page - 1) * pageSize;
      const limit = pageSize;

      let transactions;
      let totalCount;

      if (role === "rent") {
        totalCount = await this.TransactionModel.count({
          where: { userId },
        });

        transactions = await this.TransactionModel.findAll({
          where: {
            userId,
          },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
      } else if (role === "list") {
        totalCount = await this.TransactionModel.count({
          where: { isDeleted: false },
          include: [
            {
              model: this.BuildingModel,
              where: { propertyManagerId: userId },
              attributes: ["id"],
            },
          ],
        });

        transactions = await this.TransactionModel.findAll({
          where: {
            isDeleted: false,
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: this.BuildingModel,
              where: {
                propertyManagerId: userId,
              },
              attributes: ["id"],
            },
          ],
          limit,
          offset,
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
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetBuildingDetails(data) {
    const { buildingId } =
      await userUtil.verifyHandleGetBuildingDetails.validateAsync(data);

    try {
      const buildingDetails = await this.BuildingModel.findOne({
        where: { id: buildingId, isDeleted: false },
        include: [
          {
            model: this.PropertyManagerModel,
            attributes: {
              exclude: [
                "password",
                "agentBankCode",
                "agentBankAccount",
                "landlordBankCode",
                "landlordBankAccount",
                "lasrraId",
                "nin",
                "isDeleted",
                "disableAccount",
                "notificationAllowed",
                "role",
              ],
            },
          },
          {
            model: this.TenantReviewModel,
            as: "BuildingReview",
            attributes: ["id", "review", "rating", "createdAt"],
            required: false,
            include: [
              {
                model: this.ProspectiveTenantModel,
                attributes: [
                  "emailAddress",
                  "firstName",
                  "lastName",
                  "gender",
                  "image",
                ],
              },
            ],
            where: {
              isDeleted: false,
            },
          },
        ],
      });

      if (!buildingDetails) {
        throw new NotFoundError("BuildingNotFound", "Building not found");
      }

      return buildingDetails;
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetBuildings(data) {
    const {
      userId,
      page,
      pageSize,
      type,
      propertyLocation,
      propertyPreference,
      furnishingStatus,
      bedrooms,
      amenities,
      budgetMin,
      budgetMax,
      propertyRating,
    } = await userUtil.verifyHandleGetBuildings.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const buildingAttributes = [
      "id",
      "propertyManagerId",
      "propertyPreference",
      "propertyLocation",
      "city",
      "address",
      "lat",
      "lng",
      "numberOfFloors",
      "numberOfRooms",
      "amenity",
      "availability",
      "furnishingStatus",
      "rentalDuration",
      "price",
      "electricityBillArreas",
      "waterBillArreas",
      "electricityBillArreasType",
      "commissionBill",
      "propertyDescription",
      "propertyTerms",
      "buildingOccupantPreference",
      "propertyImages",
    ];

    try {
      let whereClause = {};
      let orderClause = [];
      let buildings = [];
      let totalCount = 0;

      const user = await this.ProspectiveTenantModel.findByPk(userId);

      if (type === "all") {
        if (propertyLocation) whereClause.propertyLocation = propertyLocation;
        if (propertyPreference)
          whereClause.propertyPreference = propertyPreference;
        if (furnishingStatus) whereClause.furnishingStatus = furnishingStatus;
        if (bedrooms) whereClause.numberOfRooms = bedrooms;

        if (amenities && amenities.length > 0) {
          whereClause.amenity = {
            [Op.and]: amenities.map((amenity) =>
              Sequelize.where(
                Sequelize.fn(
                  "JSON_CONTAINS",
                  Sequelize.col("amenity"),
                  Sequelize.literal(`'"${amenity}"'`)
                ),
                true
              )
            ),
          };
        }

        if (budgetMin || budgetMax) {
          whereClause.price = {};
          if (budgetMin) whereClause.price[Op.gte] = budgetMin;
          if (budgetMax) whereClause.price[Op.lte] = budgetMax;
        }

        if (propertyRating) {
          try {
            const { count, rows } = await this.BuildingModel.findAndCountAll({
              attributes: {
                include: [
                  [
                    fn("ROUND", fn("AVG", col("BuildingReview.rating"))),
                    "averageRating",
                  ],
                  [fn("COUNT", col("BuildingReview.id")), "reviewCount"],
                ],
              },
              include: [
                {
                  model: this.TenantReviewModel,
                  as: "BuildingReview",
                  attributes: [],
                  required: false,
                },
              ],
              where: {
                availability: "vacant",
                isDeleted: false,
                ...whereClause,
              },
              group: ["Building.id"],
              having: where(
                fn("ROUND", fn("AVG", col("BuildingReview.rating"))),
                "=",
                propertyRating
              ),
              //offset,
              //limit,
              subQuery: false, // Important for proper pagination with aggregates
            });

            buildings = rows ? rows : [];
            totalCount = count;
          } catch (error) {
            console.error(
              "Error fetching buildings with average rating:",
              error
            );
            throw error;
          }
        } else {
          const { count, rows } = await this.BuildingModel.findAndCountAll({
            where: {
              availability: "vacant",
              ...whereClause,
              isDeleted: false,
            },
            //offset,
            //limit
          });

          buildings = rows ? rows : [];
          totalCount = count;
        }
      } else if (type === "topRated") {
        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            availability: "vacant",
            isDeleted: false,
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [
              //fn('COALESCE', fn('AVG', col('BuildingReview.rating')), 0), 'averageRating'
              fn(
                "ROUND",
                fn("COALESCE", fn("AVG", col("BuildingReview.rating")), 0)
              ),
              "averageRating",
            ],
            // Count number of reviews
            [fn("COUNT", col("BuildingReview.id")), "reviewCount"],
          ],
          include: [
            {
              model: TenantReview,
              as: "BuildingReview",
              attributes: [],
              required: false,
            },
          ],
          group: ["Building.id"],
          order: [[literal("averageRating"), "DESC"]],
          //  offset,
          //  limit,
          subQuery: false,
        });

        buildings = rows
          ? rows.map((building) => ({
              ...building.toJSON(),
              averageRating:
                parseFloat(building.getDataValue("averageRating")) || 0,
              reviewCount:
                parseInt(building.getDataValue("reviewCount"), 10) || 0,
            }))
          : [];

        totalCount = count.length;
      } else if (type === "popular") {
        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            availability: "vacant",
            isDeleted: false,
          },
          attributes: [
            ...buildingAttributes,
            [
              fn("COALESCE", fn("AVG", col("BuildingReview.rating")), 0),
              "averageRating",
            ],
            [fn("COUNT", col("BuildingReview.id")), "reviewCount"],
            [fn("COUNT", col("BuildingTenant.id")), "tenantCount"],
          ],
          include: [
            {
              model: this.TenantReviewModel,
              as: "BuildingReview",
              attributes: [],
              required: false,
            },
            {
              model: this.TenantModel,
              as: "BuildingTenant",
              attributes: [],
              required: false,
            },
          ],
          /*  group: ['Building.id', 'Building.propertyPreference'],*/
          group: ["Building.id"],
          order: [[literal("tenantCount"), "DESC"]],
          // offset,
          // limit,
          distinct: true,
          subQuery: false,
        });

        buildings = rows
          ? rows.map((building) => ({
              ...building.toJSON(),
              averageRating: parseFloat(building.get("averageRating")) || 0,
              reviewCount: parseInt(building.get("reviewCount"), 10) || 0,
              tenantCount: parseInt(building.get("tenantCount"), 10) || 0,
            }))
          : [];

        totalCount = count.length;
      } else if (type == "recommended") {
        const user = await this.ProspectiveTenantModel.findByPk(userId);
        if (!user) {
          throw new NotFoundError("User not found");
        }

        const { propertyPreference, rentalDuration } = user;

        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            availability: "vacant",
            isDeleted: false,
            [Op.or]: [
              { rentalDuration: rentalDuration },
              {
                propertyPreference: {
                  [Op.in]: propertyPreference,
                },
              },
            ],
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [
              fn("COALESCE", fn("AVG", col("BuildingReview.rating")), 0),
              "averageRating",
            ],
            // Count number of reviews
            [fn("COUNT", col("BuildingReview.id")), "reviewCount"],
          ],
          include: [
            {
              model: TenantReview,
              as: "BuildingReview",
              attributes: [],
              required: false,
            },
          ],
          /* group: ['Building.id'],*/
          group: ["Building.id"],
          order: [[literal("averageRating"), "DESC"]],
          // offset,
          // limit,
          subQuery: false,
        });

        buildings = rows
          ? rows.map((building) => ({
              ...building.toJSON(),
              averageRating:
                parseFloat(building.getDataValue("averageRating")) || 0,
              reviewCount:
                parseInt(building.getDataValue("reviewCount"), 10) || 0,
            }))
          : [];

        totalCount = count.length;
      } else if (type === "bestOffer") {
        const user = await this.ProspectiveTenantModel.findByPk(userId);
        if (!user) {
          throw new NotFoundError("User not found");
        }

        const { budgetMin, budgetMax } = user;

        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            availability: "vacant",
            price: {
              [Op.between]: [budgetMin, budgetMax],
            },
            isDeleted: false,
          },
          attributes: [
            ...buildingAttributes,
            // Calculate average rating, default to 0 if no reviews
            [
              fn("COALESCE", fn("AVG", col("BuildingReview.rating")), 0),
              "averageRating",
            ],
            // Count number of reviews
            [fn("COUNT", col("BuildingReview.id")), "reviewCount"],
          ],
          include: [
            {
              model: TenantReview,
              as: "BuildingReview",
              attributes: [],
              required: false,
            },
          ],
          /* group: ['Building.id'],*/
          group: ["Building.id"],
          order: [["price", "ASC"]],
          // offset,
          // limit,
          subQuery: false,
        });

        buildings = rows
          ? rows.map((building) => ({
              ...building.toJSON(),
              averageRating:
                parseFloat(building.getDataValue("averageRating")) || 0,
              reviewCount:
                parseInt(building.getDataValue("reviewCount"), 10) || 0,
            }))
          : [];

        totalCount = count.length;
      } else {
        const { count, rows } = await this.BuildingModel.findAndCountAll({
          where: {
            propertyPreference: type,
            availability: "vacant",
            isDeleted: false,
          },
          // offset,
          // limit
        });

        buildings = rows ? rows : [];
        totalCount = count;
      }

      const filteredBuildings = this.filterBuildingsByUserPreferences(
        buildings,
        user
      );
      totalCount = filteredBuildings.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      //const totalPages = Math.ceil(totalCount / pageSize);
      const paginatedBuildings = filteredBuildings.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      return {
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          pageSize,
        },
        buildings: paginatedBuildings,
      };
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetUpcomingInspection(data) {
    const { userId, page, pageSize } =
      await userUtil.verifyHandleGetTenantsWithDueRent.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 7);

      const { count, rows } = await Inspection.findAndCountAll({
        include: [
          {
            model: this.BuildingModel,
            include: [
              {
                model: this.PropertyManagerModel,
                where: { id: userId },
              },
            ],
          },
        ],
        where: {
          fullDate: {
            [Op.between]: [today, threeDaysFromNow], // Filter for inspections within today and the next 3 days
          },
          inspectionStatus: "accepted",
          isDeleted: false,
        },
        limit,
        offset,
        order: [["fullDate", "ASC"]], // Order by date
      });

      console.log(rows);

      const totalPages = Math.ceil(count / pageSize);

      return {
        totalCount: count,
        totalPages,
        currentPage: page,
        pageSize,
        data: rows,
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetTenantsWithDueRent(data) {
    const { userId, page, pageSize } =
      await userUtil.verifyHandleGetTenantsWithDueRent.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      const { count, rows } = await this.TenantModel.findAndCountAll({
        include: [
          {
            model: this.BuildingModel,
            where: { propertyManagerId: userId },
          },
          {
            model: this.ProspectiveTenantModel,
            attributes: ["id", "image"],
          },
        ],
        where: {
          /*[Op.or]: [
            { status: 'rentDue' },
            { status: 'terminated' }


          ],*/
          status: "rentDue",
          isDeleted: false,
          rentNextDueDate: {
            [Op.lte]: new Date(), // Ensure due date is in the past or today
          },
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
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetBuildingPreference() {
    try {
      const setting = await this.SettingModel.findByPk(1);

      if (!setting) {
        throw new Error("Settings record not found.");
      }

      let preferences = {};
      if (typeof setting.preferences === "string") {
        // Safely parse JSON if preferences is stored as a string
        try {
          preferences = JSON.parse(setting.preferences);
        } catch (error) {
          console.error("Failed to parse preferences JSON", error);
          throw new Error("Invalid preferences format in the database.");
        }
      } else if (typeof setting.preferences === "object") {
        preferences = setting.preferences;
      } else {
        throw new Error("Unexpected preferences data type.");
      }

      // Extract the desired fields and ensure non-existent ones default to an empty array
      const {
        buildingPreferences = [],
        region = [],
        maritalStatus = [],
        religion = [],
        gender = [],
      } = preferences;

      // Validate that each field is an array; if not, return an empty array
      const response = {
        buildingPreferences: Array.isArray(buildingPreferences)
          ? buildingPreferences
          : [],
        region: Array.isArray(region) ? region : [],
        maritalStatus: Array.isArray(maritalStatus) ? maritalStatus : [],
        religion: Array.isArray(religion) ? religion : [],
        gender: Array.isArray(gender) ? gender : [],
      };

      return response;
    } catch (error) {
      console.error("Error fetching building preferences:", error);
      throw new SystemError(error.name, error.message);
    }
  }

  async handleGetNotification(data) {
    const { userId, role, page, pageSize } =
      await userUtil.verifyHandleGetNotification.validateAsync(data);

    // Calculate pagination offset and limit
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      // Query the notifications based on userId and role (notificationFor)
      const { count, rows } = await this.NotificationModel.findAndCountAll({
        where: {
          userId: userId,
          notificationFor: role,
        },
        limit,
        offset,
        include: [
          {
            model: this.BuildingModel,
            attributes: [
              "id",
              "propertyPreference",
              "address",
              "city",
              "price",
              "furnishingStatus",
              "amenity",
            ],
            include: [
              {
                model: this.PropertyManagerModel,
                attributes: [
                  "id",
                  "firstName",
                  "lastName",
                  "emailAddress",
                  "tel",
                  "companyName",
                  "image",
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]], // Most recent notifications first
      });

      const formattedNotifications = [];
      for (let i = 0; i < rows.length; i++) {
        const notification = rows[i];

        if (notification.type === "inspection") {
          const building = notification.Building;
          const propertyManager = building ? building.PropertyManager : null;

          formattedNotifications.push({
            notificationId: notification.id,
            type: notification.type,
            message: notification.message,
            building: {
              propertyPreference: building ? building.propertyPreference : null,
              address: building ? building.address : null,
              city: building ? building.city : null,
            },
            propertyOwner: propertyManager
              ? {
                  firstName: propertyManager.firstName,
                  lastName: propertyManager.lastName,
                  emailAddress: propertyManager.emailAddress,
                  tel: propertyManager.tel,
                  image: propertyManager.image,
                  companyName: propertyManager.companyName,
                }
              : null,
            createdAt: notification.createdAt,
          });
        } else if (notification.type === "rentPayment") {
          const tenant = await this.ProspectiveTenantModel.findByPk(
            notification.userId
          );

          formattedNotifications.push({
            notificationId: notification.id,
            type: notification.type,
            message: notification.message,
            tenant: tenant
              ? {
                  name: `${tenant.firstName} ${tenant.lastName}`, // Assuming tenant has firstName and lastName
                  image: tenant.image || null,
                  emailAddress: tenant.emailAddress,
                  tel: tenant.tel,
                }
              : null,
            createdAt: notification.createdAt,
          });
        }
      }

      // Return paginated result and formatted notifications
      return {
        response: formattedNotifications,
        pagination: {
          totalItems: count,
          currentPage: page,
          totalPages: Math.ceil(count / pageSize),
          pageSize: pageSize,
        },
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetALLreviewTenant(data) {
    const { prospectiveTenantId, page, pageSize } =
      await userUtil.verifyHandleGetALLreviewTenant.validateAsync(data);

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    try {
      /*
      const TenantResult=await this.TenantModel.findByPk(tenantId)

      if(!TenantResult){
          throw new NotFoundError("Tenant not found ")
      }*/
      //PropertyManagerReview

      const { count, rows } =
        await this.PropertyManagerReviewModel.findAndCountAll({
          where: {
            prospectiveTenantId: prospectiveTenantId,
            isDeleted: false,
          },
          include: [
            {
              model: this.ProspectiveTenantModel,
              attributes: {
                exclude: [
                  "password",
                  "nin",
                  "bankCode",
                  "bankAccount",
                  "lasrraId",
                  "image",
                ],
              },
            },
            {
              model: this.PropertyManagerModel,
              attributes: [
                "id",
                "image",
                "emailAddress",
                "firstName",
                "lastName",
              ],
            },
          ],
          limit,
          offset,
        });

      return {
        response: rows,
        pagination: {
          totalItems: count,
          currentPage: page,
          totalPages: Math.ceil(count / pageSize),
          pageSize: pageSize,
        },
      };
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetAllTrasaction(data) {
    try {
      const queryOptions = {
        where: {
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      };

      if (data) {
        const { limit } =
          await userUtil.verifyHandleGetAllTrasaction.validateAsync(data);

        queryOptions.limit = limit;
      }
      const transactions = await this.TransactionModel.findAll(queryOptions);

      return transactions;
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetIncome() {
    try {
      const inspections = await this.InspectionModel.findAll({
        where: {
          inspectionStatus: ["pending", "accepted", "declined", "notCreated"],
          isDeleted: false,
        },
        attributes: ["transactionReference"],
      });

      const transactionReferences = inspections.map(
        (ins) => ins.transactionReference
      );

      const transactions = await this.TransactionModel.findAll({
        where: {
          transactionType: "appointmentAndRent",
          transactionReference: transactionReferences, // filter by the fetched references
          isDeleted: false,
        },
        attributes: ["amount"],
      });

      const totalEscrowBalance = transactions.reduce(
        (acc, transaction) => acc + transaction.amount,
        0
      );
      const totalBalance = await authService.getAcctBalance(5948568393);

      const currentBalance =
        totalBalance.availableBalance -
        totalEscrowBalance +
        totalEscrowBalance * 0.05;
      return {
        currentBalance: currentBalance,
      };
    } catch (error) {
      console.error(error.response);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetCount() {
    try {
      const propertyManagerCount = await this.PropertyManagerModel.count();
      const prospectiveTenantCount = await this.ProspectiveTenantModel.count();
      const tenantCount = await this.TenantModel.count();
      const BuildingCount = await this.BuildingModel.count();

      return {
        prospectiveTenantCount,
        tenantCount,
        propertyManagerCount,
        BuildingCount,
      };
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetTotalEscrowBalance() {
    try {
      const inspections = await this.InspectionModel.findAll({
        where: {
          inspectionStatus: ["pending", "accepted", "declined", "notCreated"],
          isDeleted: false,
        },
        attributes: ["transactionReference"],
      });

      // If no inspections are found, return 0
      if (inspections.length === 0) {
        return { totalEscrowBalance: 0 };
      }

      const transactionReferences = inspections.map(
        (inspection) => inspection.transactionReference
      );

      const transactions = await this.TransactionModel.findAll({
        where: {
          transactionReference: transactionReferences,
          isDeleted: false,
        },
        attributes: ["amount"],
      });

      const totalEscrowBalance = transactions.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);

      return { totalEscrowBalance };
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetAllLordData(data) {
    let { buildingId, listId, type } =
      await userUtil.verifyHandleGetAllLordData.validateAsync(data);

    try {
      if (type === "transaction") {
        const TransactionResult = await this.TransactionModel.findAll({
          where: {
            isDeleted: false,
            buildingId,
          },
        });
        return TransactionResult;
      } else if (type === "building") {
        const BuildingModelResult = await this.BuildingModel.findAll({
          where: {
            isDeleted: false,
            propertyManagerId: listId,
          },
        });
        return BuildingModelResult;
      } else {
        const TenantModelResult = await this.TenantModel.findAll({
          where: {
            isDeleted: false,
            buildingId,
          },
          include: [
            {
              model: this.ProspectiveTenantModel,
              attributes: {
                exclude: [
                  "password",
                  "nin",
                  "bankCode",
                  "bankAccount",
                  "lasrraId",
                  "image",
                ],
              },
            },
          ],
        });
        return TenantModelResult;
      }
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetAllUser(data) {
    let { type } = await userUtil.verifyHandleGetAllUser.validateAsync(data);

    try {
      if (type === "list") {
        const propertyManagers = await this.PropertyManagerModel.findAll({
          where: {
            isDeleted: false,
          },
          attributes: {
            exclude: [
              "password",
              "nin",
              "agentBankCode",
              "agentBankAccount",
              "landlordBankCode",
              "landlordBankAccount",
            ],
            include: [
              [
                Sequelize.fn(
                  "COUNT",
                  Sequelize.col("propertyManagerBuilding.id")
                ),
                "buildingCount",
              ],
              [
                Sequelize.fn(
                  "COUNT",
                  Sequelize.col("propertyManagerBuilding->BuildingTenant.id")
                ),
                "tenantCount",
              ],
            ],
          },
          include: [
            {
              model: this.BuildingModel,
              as: "propertyManagerBuilding",
              required: false,
              attributes: [],
              include: [
                {
                  model: this.TenantModel,
                  as: "BuildingTenant",
                  required: false,
                  attributes: [],
                },
              ],
            },
          ],
          group: ["PropertyManager.id"],
          subQuery: false, // Ensures proper aggregation handling with includes
        });
        return propertyManagers;
      } else {
        const prospectiveTenants = await this.ProspectiveTenantModel.findAll({
          where: {
            isDeleted: false,
          },
          attributes: {
            exclude: ["password", "nin", "bankCode", "bankAccount"],
          },
        });
        return prospectiveTenants;
      }
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleAppointmentAndRent(data) {
    let { paymentReference } =
      await userUtil.verifyHandleAppointmentAndRent.validateAsync(data);

    try {
      const transactionStatus = await this.getTransactionStatusDisbursement(
        paymentReference
      );
      authService.handleDisbursement(transactionStatus);
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleReviewBuildingAction(data) {
    let { userId, role, review, buidingId, rating, reviewId, type } =
      await userUtil.verifyHandleReviewBuildingAction.validateAsync(data);

    if (role == "list")
      throw new BadRequestError("landlord or agent dont have this access");

    try {
      if (type === "updateReview") {
        const updateData = {};

        if (review) {
          updateData.review = review;
        }

        if (rating !== undefined && rating !== null) {
          updateData.rating = rating;
        }

        await this.TenantReviewModel.update(updateData, {
          where: { id: reviewId },
        });
      } else if (type === "deleteReview") {
        await this.TenantReviewModel.update(
          {
            isDeleted: true,
          },
          {
            where: { id: reviewId },
          }
        );
      }
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleReviewBuilding(data) {
    let { userId, role, review, buildingId, rating } =
      await userUtil.verifyHandleReviewBuilding.validateAsync(data);

    if (role == "list")
      throw new BadRequestError("landlord or agent dont have this access");

    try {
      await this.TenantReviewModel.create({
        review: review,
        buildingId: buildingId,
        prospectiveTenantId: userId,
        rating: rating ? 0 : rating,
      });
    } catch (error) {
      console;
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleDisableAccount(data) {
    let { userId, role, type, userId2 } =
      await userUtil.verifyHandleDisableAccount.validateAsync(data);

    if (role == "rent" || role == "list")
      throw new BadRequestError("No access");

    let user;

    try {
      if (type === "rent") {
        user = await this.ProspectiveTenantModel.findByPk(userId2);
      } else if (type === "list") {
        user = await this.PropertyManagerModel.findByPk(userId2);
      }

      if (!user) {
        throw new BadRequestError("User not found");
      }

      const newStatus = !user.disableAccount;
      await user.update({ disableAccount: newStatus });
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleBuildingPreferenceAction(data) {
    const { preferenceName, type } =
      await userUtil.validateHandleValidateNIN.validateAsync(data);

    try {
      const setting = await this.SettingModel.findOne({ where: { id: 1 } });

      if (!setting) {
        throw new NotFoundError("NotFoundError", "Settings not found");
      }

      //let buildingPreferences =typeof setting.preferences === 'string' ?  JSON.parse(setting.preferences)?.buildingPreferences||[] : setting.preferences?.buildingPreferences||[]

      let buildingPreferences = [];

      if (typeof setting?.preferences === "string") {
        try {
          const parsedPreferences = JSON.parse(setting.preferences); // Safely parse JSON
          buildingPreferences = parsedPreferences?.buildingPreferences || [];
        } catch (error) {
          console.error("Invalid JSON string in setting.preferences", error);
        }
      } else if (
        setting?.preferences &&
        typeof setting.preferences === "object"
      ) {
        buildingPreferences = setting.preferences?.buildingPreferences || [];
      }

      console.log("buildingPreferences", buildingPreferences);
      console.log("type", type);

      if (type === "add") {
        if (!buildingPreferences.includes(preferenceName)) {
          buildingPreferences.push(preferenceName);
        }
      } else if (type === "deleted") {
        const index = buildingPreferences.indexOf(preferenceName);
        if (index !== -1) {
          buildingPreferences.splice(index, 1);
        }
      }

      //remove duplicate
      const buildingPreferencesNew = [...new Set(buildingPreferences)];

      if (typeof setting.preferences === "string") {
        // If preferences is a string (JSON), parse it into an object
        setting.preferences = JSON.parse(setting.preferences);
      }
      setting.preferences.buildingPreferences = buildingPreferencesNew;

      await setting.save();
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error?.response?.data?.error);
    }
  }

  async handleValidateNIN(data) {
    var { nin, userId, role } =
      await userUtil.validateHandleValidateNIN2.validateAsync(data);
    let user;
    if (role == "rent") {
      user = await this.ProspectiveTenantModel.findByPk(userId);
    } else {
      user = await this.PropertyManagerModel.findByPk(userId);
    }

    let phone = user ? user.telCode + user.tel : null;

    const accessToken = await authService.getAuthTokenMonify();
    const body = {
      nin: nin,
    };

    try {
      /*
      const response = await axios.post(
        `${serverConfig.MONNIFY_BASE_URL}/api/v1/vas/nin-details`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
*/
      //  const phone = response.data.responseBody.mobileNumber;

      authService.sendNINVerificationCode(phone, userId, role);
    } catch (error) {
      console.log("error monify");

      console.log(error);

      console.log(error?.response?.data);
      throw new SystemError(error.name, error?.response?.data?.error);
    }
  }

  async handleReviewTenant(data) {
    let { userId, role, prospectiveTenantId, review } =
      await userUtil.verifyHandleReviewTenant.validateAsync(data);

    if (role == "rent")
      throw new BadRequestError("Tenant dont have this access");

    try {
      await this.PropertyManagerReviewModel.create({
        propertyManagerId: userId,
        prospectiveTenantId: prospectiveTenantId,
        review: review,
      });
    } catch (error) {
      console;
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleQuitNoticeAction(data) {
    let { userId, role, tenantId, quitNoticeId, ...updateData } =
      await userUtil.verifyHandleQuitNoticeAction.validateAsync(data);

    if (type === "send") {
      // Create a new quit notice

      if (role == "rent")
        throw new BadRequestError("Tenant dont have this access");

      const newQuitNotice = await this.QuitNoticeModel.create({
        propertyManagerId: userId,
        tenantId: tenantId,
        ...updateData,
      });

      await this.sendQuitNoticeEmail(newQuitNotice.id);

      return newQuitNotice;
    } else if (type === "get") {
      const quitNotices = await this.QuitNoticeModel.findAll({
        where: { tenantId: tenantId, isDeleted: false },
        order: [["noticeDate", "DESC"]],
      });
      return quitNotices;
    } else if (type === "acknowledged") {
      // Acknowledge a particular quit notice
      const quitNoticeToUpdate = await this.QuitNoticeModel.findOne({
        where: { id: quitNoticeId },
      });

      if (!quitNoticeToUpdate) {
        throw new NotFoundError("Quit notice not found");
      }

      quitNoticeToUpdate.type = "acknowledged";
      await quitNoticeToUpdate.save();
      return quitNoticeToUpdate;
    } else if (type === "delete") {
      const quitNoticeToDelete = await this.QuitNoticeModel.findByPk(
        quitNoticeId
      );

      if (!quitNoticeToDelete) {
        throw new NotFoundError("Quit notice not found");
      }

      quitNoticeToDelete.isDeleted = true;
      await quitNoticeToDelete.save();
      return quitNoticeToDelete;
    }
  }

  /*

  async   handleUpdatelistedBuilding(data) {
    let { 
      userId,
      role,
      image,
      propertyTerms,
      buildingId,
      ...updateData
    } = await userUtil.verifyHandleUpdatelistedBuilding.validateAsync(data);
    
    let imageUrls = {};
  
    try {
      // Function to handle image updates
      const updateImage = (field, files) => {
        if (files[field] && files[field].length > 0) {
          const file = files[field][0];
          return serverConfig.NODE_ENV === "production"
            ? serverConfig.DOMAIN + file.path.replace("/home", "")
            : serverConfig.DOMAIN + file.path.replace("public", "");
        }
        return undefined; // Return undefined if no new image is provided
      };
  
      // Update image fields only if new files are provided
      imageUrls.bedroomSizeImage = updateImage('bedroomSizeImage', files);
      imageUrls.kitchenSizeImage = updateImage('kitchenSizeImage', files);
      imageUrls.livingRoomSizeImage = updateImage('livingRoomSizeImage', files);
      imageUrls.diningAreaSizeImage = updateImage('diningAreaSizeImage', files);
      imageUrls.propertyTerms = updateImage('propertyTerms', files);
  
      // Remove undefined values from imageUrls and updateData
      imageUrls = Object.fromEntries(Object.entries(imageUrls).filter(([_, v]) => v != null));
      updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v != null));
  
      // Combine imageUrls and updateData, excluding null or undefined values
      const finalUpdateData = {
        ...imageUrls,
        ...updateData
      };
  
      // Find the existing building by ID
      const building = await this.BuildingModel.findByPk(buildingId);
  
      if (!building) {
        throw new Error('Building not found');
      }
  
  
      // Update the building with the new data
      await building.update(finalUpdateData);
  
      return building;
  
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.message);
    }
  }
*/

  async handleUpdatelistedBuilding(data) {
    const {
      buildingId,
      userId,
      role,
      propertyImages,
      propertyTerms,
      ...updateData
    } = await userUtil.verifyHandleUpdatelistedBuilding.validateAsync(data);

    try {
      // Check if building exists and belongs to the user
      const building = await this.BuildingModel.findOne({
        where: {
          id: buildingId,
          propertyManagerId: userId,
        },
      });

      if (!building) {
        throw new Error("Building not found or unauthorized");
      }

      // Handle property images update
      if (propertyImages) {
        // Get current images and ensure it's an array
        let currentImages = [];
        try {
          // Safely get current images

          currentImages = building.propertyImages
            ? building.propertyImages
            : [];
        } catch (error) {
          console.error("Error parsing current images:", error);
          currentImages = [];
        }

        // Process each new image
        const updatedImages = propertyImages.reduce(
          (acc, newImage) => {
            // Find if an image with this title already exists
            const existingImageIndex = acc.findIndex(
              (img) => img.title === newImage.title
            );

            if (existingImageIndex !== -1) {
              // Update existing image
              acc[existingImageIndex] = {
                ...acc[existingImageIndex],
                ...newImage,
              };
            } else {
              // Add new image
              acc.push(newImage);
            }

            return acc;
          },
          [...currentImages]
        );

        // Set the stringified array directly
        updateData.propertyImages = updatedImages;
      }

      // Handle property terms if provided
      if (propertyTerms) {
        updateData.propertyTerms = propertyTerms.url;
      }

      // Update the building with merged data
      await this.BuildingModel.update(updateData, {
        where: {
          id: buildingId,
          propertyManagerId: userId,
        },
      });
    } catch (error) {
      console.error(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  /*
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
    }


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
*/

  async handleListBuilding(data) {
    const { userId, role, propertyImages, propertyTerms, ...updateData } =
      await userUtil.verifyHandleListBuilding.validateAsync(data);

    try {
      await this.BuildingModel.create({
        propertyManagerId: userId,
        propertyImages,
        propertyTerms: propertyTerms.url,
        ...updateData,
      });
    } catch (error) {
      console.error(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetMyProperty(data) {
    let { userId, role, type, page, propertyManagerId, pageSize } =
      await userUtil.verifyHandleGetMyProperty.validateAsync(data);

    try {
      if (role === "list") {
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let whereCondition = {
          propertyManagerId: userId,
          isDeleted: false,
        };

        if (type === "vacant") {
          whereCondition.availability = {
            [Op.or]: ["vacant", "booked"],
          };
        } else if (type === "occupied") {
          whereCondition.availability = "occupied";
        } else if (type === "listing") {
          whereCondition.propertyManagerId = userId;
        } else if (type === "booked") {
          whereCondition.availability = "booked";
        } else if (type === "cancelled") {
          const refundedInspections = await this.InspectionModel.findAll({
            where: { inspectionStatus: "refunded" },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["id"],
                include: [
                  {
                    model: this.PropertyManagerModel,
                    where: { id: userId },
                    attributes: [],
                  },
                ],
              },
            ],
          });

          const buildingIds = refundedInspections.map(
            (inspection) => inspection.Building.id
          );

          whereCondition.id = buildingIds;
        }

        let buildings = await this.BuildingModel.findAndCountAll({
          where: whereCondition,
          limit,
          offset,
        });

        // buildings.buildingOccupantPreference=JSON.parse(buildings.buildingOccupantPreference)
        // buildings.buildingOccupantPreference=JSON.parse(buildings.buildingOccupantPreference)
        /*
         console.log(buildings)
         const my=buildings.rows.map(obj => {
          const property="buildingOccupantPreference"
          if (obj.hasOwnProperty(property)) {
              return {
                  ...obj,
                  [property]: JSON.parse(obj[property])
              };
          }
              return obj; // If the property doesn't exist, return the object as is.
          });
          console.log(my)*/

        return {
          response: buildings.rows,
          pagination: {
            totalItems: buildings.count,
            currentPage: page,
            totalPages: Math.ceil(buildings.count / pageSize),
          },
        };
      } else if (role === "rent") {
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let whereCondition = {
          isDeleted: false,
        };

        if (type === "cancelled") {
          const refundedInspections = await this.InspectionModel.findAll({
            where: { inspectionStatus: "refunded" },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["id"],
              },
              {
                model: this.ProspectiveTenantModel,
                where: {
                  id: userId,
                },
                attributes: [],
              },
            ],
          });

          const buildingIds = refundedInspections.map(
            (inspection) => inspection.Building.id
          );

          whereCondition.id = buildingIds;
          /*
          const buildings = await this.BuildingModel.findAndCountAll({
            where: whereCondition, 
            limit,
            offset
          })
        
          return {
            response: buildings.rows,
            pagination:{
              totalItems: buildings.count,
              currentPage: page,
              totalPages: Math.ceil(buildings.count / pageSize)
            }
          };
          */
        } else if (type === "listing") {
          whereCondition.propertyManagerId = propertyManagerId;

          /*
          const buildings = await this.BuildingModel.findAndCountAll({
            where: whereCondition, 
            limit,
            offset
          });
        
          return {
            response: buildings.rows,
            pagination:{
              totalItems: buildings.count,
              currentPage: page,
              totalPages: Math.ceil(buildings.count / pageSize)
            }
          };*/
        } else if (type === "booked") {
          const Inspections = await this.InspectionModel.findAll({
            where: {
              inspectionStatus: [
                "pending",
                "accepted",
                "declined",
                "notCreated",
              ],
              id: userId,
            },
            include: [
              {
                model: this.BuildingModel,
                attributes: ["id"],
              },
            ],
          });

          const buildingIds = Inspections.map(
            (inspection) => inspection.Building.id
          );

          whereCondition.id = buildingIds;

          /*
          const buildings = await this.BuildingModel.findAndCountAll({
            where: whereCondition, 
            limit,
            offset
          });
        
          return {
            response: buildings.rows,
            pagination:{
              totalItems: buildings.count,
              currentPage: page,
              totalPages: Math.ceil(buildings.count / pageSize)
            }
          };

          */
        }

        const buildings = await this.BuildingModel.findAndCountAll({
          where: whereCondition,
          limit,
          offset,
        });

        buildings.buildingOccupantPreference =
          typeof buildings.buildingOccupantPreference === "string"
            ? JSON.parse(buildings.buildingOccupantPreference)
            : buildings.buildingOccupantPreference;

        return {
          response: buildings.rows,
          pagination: {
            totalItems: buildings.count,
            currentPage: page,
            totalPages: Math.ceil(buildings.count / pageSize),
          },
        };
      }
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleSendInvoce(data) {
    let { userIdList } = await userUtil.verifyHandleSendInvoce.validateAsync(
      data
    );

    try {
      const processInvoices = async (userIdList) => {
        if (userIdList.length === 0) return;

        const userId = userIdList[0];
        const remainingUserIdList = userIdList.slice(1);

        try {
          // Fetch tenant and building details
          const tenant = await this.TenantModel.findOne({
            where: {
              id: userId,
              isDeleted: false,
            },
          });

          if (!tenant) {
            throw new NotFoundError("Tenant not found ");
          }

          const ProspectiveTenantResult =
            await this.ProspectiveTenantModel.findOne({
              where: {
                id: tenant.prospectiveTenantId,
                isDeleted: false,
              },
            });

          const building = await this.BuildingModel.findOne({
            where: {
              id: tenant.buildingId,
              isDeleted: false,
            },
          });

          const PropertyManagerModelResult =
            await this.PropertyManagerModel.findOne({
              where: {
                id: building.propertyManagerId,
              },
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
            transactionType: "rent",
          });

          const customerName =
            ProspectiveTenantResult.firstName +
            " " +
            ProspectiveTenantResult.lastName;

          const createInvoiceData = await this.createInvoice({
            amount: building.price,
            invoiceReference: paymentReference,
            customerName: customerName,
            customerEmail: ProspectiveTenantResult.emailAddress,
            description: "Rent invoice",
            contractCode: "1209006936",
            expiryDate: format(addMonths(new Date(), 1), "yyyy-MM-dd HH:mm:ss"),
            redirectUrl: "https://lagproperty.com",
          });
          // Send the invoice

          await this.sendInvoiceEmail(
            createInvoiceData,
            format(new Date(tenant.rentNextDueDate), "MMMM yyyy"),
            tenant.rentNextDueDate,
            building.rentalDuration,
            PropertyManagerModelResult.companyName,
            customerName
          );
        } catch (error) {
          console.error("Error processing invoice:", error);
        }

        // Recursively process the remaining tenants
        await processInvoices(remainingUserIdList);
      };

      processInvoices(userIdList);
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  async createInvoice({
    amount,
    invoiceReference,
    customerName,
    customerEmail,
    description,
    currencyCode = "NGN", // Default currency code
    contractCode,
    expiryDate,
    incomeSplitConfig,
    redirectUrl,
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
        redirectUrl,
      };

      // Make the API request to create the invoice
      const response = await axios.post(
        `${serverConfig.MONNIFY_BASE_URL}/api/v1/invoice/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Check if the request was successful
      if (response.data.requestSuccessful) {
        // Extract and return the invoice data
        return response.data.responseBody;
      } else {
        // Log and handle the error
        console.error(
          "Invoice creation failed:",
          response.data.responseMessage
        );
        return null;
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error creating invoice:", error);
      return null;
    }
  }

  async sendInvoiceEmail(
    invoiceDetails,
    rentFor,
    rentNextDueDate,
    month,
    companyName,
    customerName
  ) {
    try {
      const {
        customerEmail,
        amount,
        invoiceReference,
        checkoutUrl,
        description,
      } = invoiceDetails;

      const params = new URLSearchParams();
      params.append("invoiceReference", invoiceReference);

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
      console.error("Error sending invoice email:", error);
    }
  }

  async handleInspectionAction(data) {
    let {
      userId,
      role,
      type,
      page,
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

      if (type === "getNotCreatedInspection") {
        if (role === "list") {
          const notCreatedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "notCreated",
                isDeleted: false,
              },
              include: [
                {
                  model: this.BuildingModel,
                  where: { propertyManagerId: userId },
                  required: true,
                },
              ],
              limit,
              offset,
            });
          return {
            response: notCreatedInspections.rows,
            pagination: {
              totalItems: notCreatedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(notCreatedInspections.count / pageSize),
            },
          };
        } else {
          const notCreatedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "notCreated",
                prospectiveTenantId: userId,
                isDeleted: false,
              },
              limit,
              offset,
            });

          return {
            response: notCreatedInspections.rows,
            pagination: {
              totalItems: notCreatedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(notCreatedInspections.count / pageSize),
            },
          };
        }
      } else if (type === "getPendingInspection") {
        if (role === "list") {
          const pendingInspections = await this.InspectionModel.findAndCountAll(
            {
              where: { inspectionStatus: "pending", isDeleted: false },
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
            }
          );
          return {
            response: pendingInspections.rows,
            pagination: {
              totalItems: pendingInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(pendingInspections.count / pageSize),
            },
          };
        } else {
          const pendingInspections = await this.InspectionModel.findAndCountAll(
            {
              where: {
                inspectionStatus: "pending",
                prospectiveTenantId: userId,
                isDeleted: false,
              },
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
            }
          );
          return {
            response: pendingInspections.rows,
            pagination: {
              totalItems: pendingInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(pendingInspections.count / pageSize),
            },
          };
        }
      } else if (type === "getDeclineInspection") {
        if (role === "list") {
          const declinedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "decline",
                isDeleted: false,
              },
              limit,
              offset,
              include: [
                {
                  model: Building,
                  attributes: [
                    "id",
                    "propertyManagerId",
                    "propertyPreference",
                    "propertyLocation",
                    "city",
                    "address",
                    "lat",
                    "lng",
                    "numberOfFloors",
                    "numberOfRooms",
                    "amenity",
                    "availability",
                    "furnishingStatus",
                    "rentalDuration",
                    "price",
                    "electricityBill",
                    "wasteBill",
                    "commissionBill",
                    "propertyDescription",
                    "bedroomSizeLength",
                    "bedroomSizeWidth",
                    "bedroomSizeImage",
                    "kitchenSizeLength",
                    "kitchenSizeWidth",
                    "kitchenSizeImage",
                    "livingRoomSizeLength",
                    "livingRoomSizeWidth",
                    "livingRoomSizeImage",
                    "diningAreaSizeLength",
                    "diningAreaSizeWidth",
                    "diningAreaSizeImage",
                    "propertyTerms",
                  ],
                  where: { propertyManagerId: userId },
                  required: true,
                },
              ],
            });
          return {
            response: declinedInspections.rows,
            pagination: {
              totalItems: declinedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(declinedInspections.count / pageSize),
            },
          };
        } else {
          const declinedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "decline",
                prospectiveTenantId: userId,
                isDeleted: false,
              },
              limit,
              offset,
              include: [
                {
                  model: Building,
                  attributes: [
                    "id",
                    "propertyManagerId",
                    "propertyPreference",
                    "propertyLocation",
                    "city",
                    "address",
                    "lat",
                    "lng",
                    "numberOfFloors",
                    "numberOfRooms",
                    "amenity",
                    "availability",
                    "furnishingStatus",
                    "rentalDuration",
                    "price",
                    "electricityBill",
                    "wasteBill",
                    "commissionBill",
                    "propertyDescription",
                    "bedroomSizeLength",
                    "bedroomSizeWidth",
                    "bedroomSizeImage",
                    "kitchenSizeLength",
                    "kitchenSizeWidth",
                    "kitchenSizeImage",
                    "livingRoomSizeLength",
                    "livingRoomSizeWidth",
                    "livingRoomSizeImage",
                    "diningAreaSizeLength",
                    "diningAreaSizeWidth",
                    "diningAreaSizeImage",
                    "propertyTerms",
                  ],
                },
              ],
            });
          return {
            response: declinedInspections.rows,
            pagination: {
              totalItems: declinedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(declinedInspections.count / pageSize),
            },
          };
        }
      } else if (type === "getAcceptedInspection") {
        if (role === "list") {
          const acceptedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "accepted",
                isDeleted: false,
              },
              limit,
              offset,
              include: [
                {
                  model: this.BuildingModel,
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
                  required: true,
                },
              ],
            });
          return {
            response: acceptedInspections.rows,
            pagination: {
              totalItems: acceptedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(acceptedInspections.count / pageSize),
            },
          };
        } else {
          const acceptedInspections =
            await this.InspectionModel.findAndCountAll({
              where: {
                inspectionStatus: "accepted",
                prospectiveTenantId: userId,
                isDeleted: false,
              },
              limit,
              offset,
              include: [
                {
                  model: Building,
                  attributes: [
                    "id",
                    "propertyManagerId",
                    "propertyPreference",
                    "propertyLocation",
                    "city",
                    "address",
                    "lat",
                    "lng",
                    "numberOfFloors",
                    "numberOfRooms",
                    "amenity",
                    "availability",
                    "furnishingStatus",
                    "rentalDuration",
                    "price",
                    "electricityBill",
                    "wasteBill",
                    "commissionBill",
                    "propertyDescription",
                    "bedroomSizeLength",
                    "bedroomSizeWidth",
                    "bedroomSizeImage",
                    "kitchenSizeLength",
                    "kitchenSizeWidth",
                    "kitchenSizeImage",
                    "livingRoomSizeLength",
                    "livingRoomSizeWidth",
                    "livingRoomSizeImage",
                    "diningAreaSizeLength",
                    "diningAreaSizeWidth",
                    "diningAreaSizeImage",
                    "propertyTerms",
                  ],
                },
              ],
            });
          return {
            response: acceptedInspections.rows,
            pagination: {
              totalItems: acceptedInspections.count,
              currentPage: page,
              pageSize,
              totalPages: Math.ceil(acceptedInspections.count / pageSize),
            },
          };
        }
      } else if (type === "createInspection") {
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false },
        });

        if (!inspection) {
          throw new NotFoundError("Inspection not found");
        }

        await inspection.update({
          inspectionMode,
          fullDate,
          emailAddress,
          tel,
          fullName,
          gender,
          inspectionStatus: "pending",
        });

        return inspection;
      } else if (type === "refund") {
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false },
        });

        if (role == "list") {
          await inspection.update({
            tenentStatus: false,
            note,
          });
        } else {
          await inspection.update({
            propertyManagerStatus: false,
            note,
          });
        }

        /*
        const RefundLogModelResult2 = await this.RefundLogModel.findOne({
          where: { 
            transactionReference: inspectionId.transactionReference,
            isDeleted: false 
          }
        });

        if(RefundLogModelResult2?.refundStatus==='COMPLETED') return "refund already made"

        const transactionResult = await this.TransactionModel.findOne({
          where: { 
            transactionReference: inspection.transactionReference, 
            isDeleted: false 
          }
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
              refundStatus: refundResponse.responseBody.refundStatus
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
          */
      } else if (type === "acceptInspection") {
        if (role == "rent") throw new BadRequestError("Not a property owner");

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false },
        });

        if (!inspection) {
          throw new NotFoundError("Inspection not found");
        }

        const building = await this.BuildingModel.findOne({
          where: {
            id: inspection.buildingId,
            propertyManagerId: userId,
            isDeleted: false,
          },
        });

        if (building) {
          await inspection.update({
            inspectionStatus: "accepted",
          });

          await this.NotificationModel.create({
            notificationFor: "rent",
            userId: inspection.prospectiveTenantId,
            type: "inspection",
            message: `Good news! Your inspection for ${building.propertyPreference} at ${building.address}, ${building.city} has been accepted. We are excited to help you proceed with the next steps, and you will receive further details soon.Thank you for trusting us with your property needs!`,
            buildingId: building.id,
          });

          return inspection;
        } else {
          throw new NotFoundError("Inspection not found for the building");
        }
      } else if (type === "declineInspection") {
        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false },
        });

        if (!inspection) {
          throw new NotFoundError("Inspection not found");
        }

        if (note) {
          await inspection.update({
            inspectionStatus: "declined",
            note,
          });
        } else {
          await inspection.update({
            inspectionStatus: "declined",
          });
        }

        const building = await this.BuildingModel.findOne({
          where: { id: inspection.buildingId, isDeleted: false },
        });

        await this.NotificationModel.create({
          notificationFor: "rent",
          userId: inspection.prospectiveTenantId,
          type: "inspection",
          message: `Your inspection request for ${building.propertyTitle} on the selected date cannot be accommodated. Please choose a new date.`,
          buildingId: inspection.buildingId,
        });

        return inspection;
      } else if (type === "acceptTenant") {
        if (role == "rent")
          throw new BadRequestError("landlord or agent dont have this access");

        const inspection = await this.InspectionModel.findOne({
          where: {
            id: inspectionId,
            isDeleted: false,
          },
        });

        if (!inspection) {
          throw new NotFoundError("Inspection not found");
        }
        if (
          inspection.tenentStatus === true &&
          inspection.propertyManagerStatus === true
        )
          return "Tenant has been accepted already";

        await inspection.update({
          propertyManagerStatus: true,
        });

        if (inspection.tenentStatus === true) {
          const BuildingModelResult = await this.BuildingModel.findOne({
            where: { id: inspection.buildingId, isDeleted: false },
          });
          const TransactionModelResult2 = await this.TransactionModel.findOne({
            where: { id: inspection.transactionReference, isDeleted: false },
          });

          const PropertyManagerModelResult =
            await this.PropertyManagerModel.findByPk(
              BuildingModelResult.propertyManagerId
            );

          this.processDisbursement(
            PropertyManagerModelResult,
            inspection,
            TransactionModelResult2
          );
        }
      } else if (type === "releaseFund") {
        if (role == "list")
          throw new BadRequestError("landlord or agent dont have this access");

        const inspection = await this.InspectionModel.findOne({
          where: { id: inspectionId, isDeleted: false },
        });

        if (!inspection) {
          throw new NotFoundError("Inspection not found");
        }

        if (
          inspection.tenentStatus === true &&
          inspection.propertyManagerStatus === true
        )
          return; /*'transaction has been initiated check transaction status'*/

        await inspection.update({
          tenentStatus: true,
        });

        /*

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
        */
      } else if (type === "escrowBalance") {
        if (role === "list") {
          const buildings = await this.BuildingModel.findAll({
            where: { propertyManagerId: userId },
            attributes: ["id"],
          });

          if (buildings.length === 0) {
            return { totalBalance: 0 };
          }

          const buildingIds = buildings.map((building) => building.id);

          // Fetch all inspections for the user's buildings with the specified criteria
          const inspections = await this.InspectionModel.findAll({
            where: {
              buildingId: buildingIds,
              propertyManagerStatus: null,
              tenentStatus: null,
              inspectionStatus: {
                [Op.or]: ["accepted", "pending", "notCreated"],
              },
            },
            attributes: ["transactionReference"],
          });

          if (inspections.length === 0) {
            return { totalBalance: 0 };
          }

          const transactionReferences = inspections.map(
            (inspection) => inspection.transactionReference
          );

          // Fetch all transactions for the transaction references found
          const transactions = await this.TransactionModel.findAll({
            where: {
              transactionReference: transactionReferences,
            },
            attributes: ["amount"],
          });

          // Calculate the total balance
          const totalBalance = transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );

          return { totalBalance: totalBalance };
        } else if (role === "rent") {
          const inspections = await this.InspectionModel.findAll({
            where: {
              prospectiveTenantId: userId,
              inspectionStatus: {
                [Op.or]: ["accepted", "pending", "notCreated"],
              },
            },
            attributes: ["transactionReference"],
          });

          if (inspections.length === 0) {
            return { totalBalance: 0 };
          }

          const transactionReferences = inspections.map(
            (inspection) => inspection.transactionReference
          );

          // Fetch all transactions for the transaction references found
          const transactions = await this.TransactionModel.findAll({
            where: {
              transactionReference: transactionReferences,
            },
            attributes: ["amount"],
          });

          // Calculate the total balance
          const totalBalance = transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
          );
          return { totalBalance: totalBalance };
        }
      }
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.parent);
    }
  }

  /*
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
          amount:TransactionModelResultAmount,
          paymentReference,
          transactionType:'firstRent'
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
          transactionType:'firstRent'
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
        console.error('Error fetching transaction status2:', error.response.data);
        throw new SystemError(error.name,  error.response.data)

    }
  }
  */

  async updateTransferTransaction(db, transferData) {
    try {
      const TransactionModelResult = db.findOne({
        where: {
          transactionReference: transferData.responseBody.reference,
        },
      });
      if (TransactionModelResult) {
        await TransactionModelResult.update({
          paymentStatus: transferData.responseBody.status,
        });

        if (transferData.responseBody.status === "SUCCESS") {
          const BuildingModelResult = await this.BuildingModel.findByPk(
            TransactionModelResult.buildingId
          );

          const TenantModelResult = await this.TenantModel.findOne({
            where: {
              buildingId: TransactionModelResult.buildingId,
            },
          });

          if (!TenantModelResult || TenantModelResult.status == "terminated") {
            this.TenantModel.create({
              buildingId: TransactionModelResult.buildingId,
              prospectiveTenantId: TransactionModelResult.prospectiveTenantId,
              status: "active",
              rentMoneyStatus: "paid",
              rentNextDueDate: this.calculateRentNextDueDate(
                BuildingModelResult.rentalDuration
              ),
            });
          }
        }
      } else {
        console.log("Transaction not found with reference:", reference);
      }
    } catch (error) {
      console.error(
        "An error occurred while updating the transaction:",
        error.message
      );
    }
  }

  calculateRentNextDueDate(months, fromDate = new Date()) {
    if (!Number.isInteger(months) || months <= 0) {
      throw new Error("The number of months must be a positive integer.");
    }

    const rentNextDueDate = addMonths(fromDate, months);
    return rentNextDueDate;
  }

  async initiateTransfer(token, transferDetails) {
    try {
      const response = await axios.post(
        `${serverConfig.MONNIFY_BASE_URL}/api/v2/disbursements/single`,
        transferDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new SystemError(error.name, error.response.data);
    }
  }

  async handleChat(data, file) {
    const validationResult = await userUtil.verifyHandleChat.validateAsync(
      data
    );

    const { userId, receiverId, messageType, message, repliedMessageId, role } =
      validationResult;

    try {
      let imageUrl = "";
      if (file) {
        if (serverConfig.NODE_ENV == "production") {
          imageUrl = serverConfig.DOMAIN + file.path.replace("/home", "");
        } else if (serverConfig.NODE_ENV == "development") {
          imageUrl = serverConfig.DOMAIN + file.path.replace("public", "");
        }
      }

      const newChat = await this.ChatModel.create({
        senderId: userId,
        receiverId,
        messageType,
        role,
        message: messageType === "text" ? message : null,
        image: messageType === "file" ? imageUrl : null,
        repliedMessageId: repliedMessageId || null,
      });

      return newChat;
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async handleGetChat(data) {
    const validationResult = await userUtil.verifyHandleGetChat.validateAsync(
      data
    );

    const { userId, type, partnerId, role } = validationResult;

    console.log(role);
    try {
      let chatMessages;

      // Define the role opposites
      const oppositeRole = (role) => (role === "list" ? "rent" : "list");

      if (type === "chatDetail") {
        const messages = await this.ChatModel.findAll({
          where: {
            isDeleted: false,
            [Op.or]: [
              { senderId: userId, receiverId: partnerId, role },
              {
                senderId: partnerId,
                receiverId: userId,
                role: oppositeRole(role),
              },
            ],
          },
          include: [
            {
              model: Chat,
              as: "RepliedMessage",
              attributes: ["id", "message", "messageType"],
            },
          ],
          order: [["createdAt", "ASC"]],
        });

        for (const message of messages) {
          const sender = await this.fetchUserDetails(
            message.role === "rent"
              ? this.ProspectiveTenantModel
              : this.PropertyManagerModel,
            message.senderId
          );

          const receiver = await this.fetchUserDetails(
            message.role === "rent"
              ? this.PropertyManagerModel
              : this.ProspectiveTenantModel,
            message.receiverId
          );

          // Add sender and receiver details to each message
          message.dataValues.sender = sender;
          message.dataValues.receiver = receiver;
        }

        chatMessages = messages;
      } else if (type === "summary") {
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
              as: "RepliedMessage",
              attributes: ["id", "message", "messageType"],
            },
          ],
        });

        for (const message of allchat) {
          const key = `${message.senderId}-${message.receiverId}`;

          const sender = await this.fetchUserDetails(
            message.role === "rent"
              ? this.ProspectiveTenantModel
              : this.PropertyManagerModel,
            message.receiverId
          );
          const receiver = await this.fetchUserDetails(
            message.role === "rent"
              ? this.PropertyManagerModel
              : this.ProspectiveTenantModel,
            message.senderId
          );

          if (!chatMap.has(key)) {
            //chatMap.set(key, message);
            chatMap.set(key, { ...message.dataValues, sender, receiver });
          } else {
            const existingMessage = chatMap.get(key);

            //console.log(existingMessage)
            const messageTimestamp = new Date(message.createdAt).getTime();
            const existingMessageTimestamp = new Date(
              existingMessage.createdAt
            ).getTime();
            if (messageTimestamp > existingMessageTimestamp) {
              chatMap.set(key, { ...message.dataValues, sender, receiver });
            }
          }
        }

        chatMessages = Array.from(chatMap.values());
      }

      return chatMessages;
    } catch (error) {
      throw new SystemError(error.name, error.parent);
    }
  }

  async fetchUserDetails(model, userId) {
    return await model.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "image"], // Adjust fields as needed
    });
  }

  generateReference() {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase(); // Random alphanumeric string

    return `REF-${timestamp}-${randomString}`;
  }

  calculateDistribution(amount, type, hasAgent, paymentType) {
    let landlordShare = 0;
    let agentShare = 0;
    let appShare = 0;

    amount = parseFloat(amount.toFixed(2));
    if (paymentType === "initial deposit") {
      if (hasAgent) {
        agentShare = amount * 0.1;
        appShare = amount * 0.05;
        landlordShare = amount - agentShare - appShare;
      } else {
        appShare = amount * 0.05;
        landlordShare = amount - appShare;
      }
    } else if (paymentType === "rent") {
      appShare = amount * 0.05;
      landlordShare = amount - appShare;
    }

    return {
      landlordShare: parseFloat(landlordShare.toFixed(2)),
      agentShare: parseFloat(agentShare.toFixed(2)),
      appShare: parseFloat(appShare.toFixed(2)),
    };
  }

  /*
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
  
*/
  async sendEmailVerificationCode(emailAddress, userId, password) {
    try {
      try {
        const params = new URLSearchParams();
        params.append("userId", userId);
        params.append("verificationCode", verificationCode);
        params.append("type", "email");

        await mailService.sendMail({
          to: emailAddress,
          subject: "Account details and verification",
          templateName: "sendInvoice",
          variables: {
            password,
            email: emailAddress,
            domain: serverConfig.DOMAIN,
            resetLink:
              serverConfig.NODE_ENV === "development"
                ? `http://localhost/COMPANYS_PROJECT/verifyEmail.html?${params.toString()}`
                : `${
                    serverConfig.DOMAIN
                  }/adminpanel/PasswordReset.html?${params.toString()}`,
          },
        });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async sendQuitNoticeEmail(quitNoticeId) {
    // Fetch the quit notice
    const quitNotice = await this.QuitNoticeModel.findByPk(quitNoticeId, {
      include: [
        { model: Tenant, include: [ProspectiveTenant] },
        { model: this.PropertyManagerModel },
        { model: this.BuildingModel },
      ],
    });

    if (!quitNotice) {
      throw new Error("Quit notice not found");
    }

    const tenant = quitNotice.Tenant;
    const prospectiveTenant = tenant.ProspectiveTenant;
    const propertyManager = quitNotice.PropertyManager;
    const building = quitNotice.Building;

    // Prepare the email data
    const emailData = {
      tenantName: `${prospectiveTenant.firstName} ${prospectiveTenant.lastName}`,
      propertyAddress: `${building.address}, ${building.city}`,
      quitDate: quitNotice.quitDate.toDateString(),
      reason: quitNotice.reason,
      status: quitNotice.status,
      propertyManagerName: `${propertyManager.firstName} ${propertyManager.lastName}`,
      companyName: propertyManager.companyName, // You might want to store this in a config file
      acknowledgeUrl: `${serverConfig.DOMAIN}/acknowledge-quit-notice/${quitNotice.id}`,
    };

    // Send the email
    await mailService.sendMail({
      to: prospectiveTenant.emailAddress,
      subject: "Quit Notice",
      templateName: "quit_notice",
      variables: emailData,
    });
  }

  async generateRandomPassword(length = 12) {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }

  isStateInRegions(state, regionArray) {
    if (regionArray.includes("All")) {
      return true;
    }

    for (let region of regionArray) {
      if (regions[region] && regions[region].includes(state)) {
        return true;
      }
    }
    return false;
  }

  filterBuildingsByUserPreferences(buildings, user) {
    return buildings.filter((building) => {
      if (building.buildingOccupantPreference) {
        let preferences =
          typeof building.buildingOccupantPreference === "string"
            ? JSON.parse(building.buildingOccupantPreference)
            : building.buildingOccupantPreference;

        if (!Array.isArray(preferences.maritalStatus)) {
          //let  preferences = JSON.parse(building.buildingOccupantPreference) || {};
          console.error("maritalStatus is not an array.");
          return false; // Exit or handle the invalid case
        } else {
          // Check marital status
          if (
            preferences.maritalStatus &&
            Array.isArray(preferences.maritalStatus) &&
            !preferences.maritalStatus.includes("All") &&
            !preferences.maritalStatus.includes(user.maritalStatus)
          ) {
            return false;
          }

          // Check religion
          if (
            preferences.religion &&
            Array.isArray(preferences.religion) &&
            !preferences.religion.includes("All") &&
            !preferences.religion.includes(user.religion)
          ) {
            return false;
          }

          // Check gender
          if (
            preferences.gender &&
            Array.isArray(preferences.gender) &&
            !preferences.gender.includes("All") &&
            !preferences.gender.includes(user.gender)
          ) {
            return false;
          }

          // Check region using the provided `isStateInRegions` function
          if (
            preferences.region &&
            Array.isArray(preferences.region) &&
            !preferences.region.includes("All") &&
            !this.isStateInRegions(user.stateOfOrigin, preferences.region)
          ) {
            return false;
          }

          return true;
        }
      }
    });
  }
}

export default new UserService();

//
