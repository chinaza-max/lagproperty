import sequelize from "sequelize";
import { SystemError } from "../errors/index.js";
import Joi from "joi";

class SystemMiddlewares {
  async errorHandler(
    error,
    req,
    res,
    next
){
    if (error instanceof SystemError) {

      
      switch (error.name) {
        case "NotFoundError":
          return res.status(404).json({
            status: error.code,
            message: error.message,
          });
        case "BadRequestError":
          return res.status(400).json({
            status: error.code,
            message: error.message,
          });
        case "UnAuthorizedError":
          return res.status(401).json({
            status: error.code,
            message: error.message,
          });
        case "EmailClientError":
          return res.status(500).json({
            status: error.code,
            message: error.message,
          });
        case "ConflictError":
          return res.status(409).json({
            status: error.code,
            message: error.message,
          });
        case "TooManyRequestsError":
          return res.status(429).json({
            status: error.code,
            message: error.message,
          });
        case "AgendaSheduleError":
          return res.status(409).json({
            status: error.code,
            message: error.message,
          });
          case "SecurityCodeVerificationError":
            return res.status(403).json({
              status: error.code,
              message: error.message,
            });
        case "ServerError":
        case "SystemError":
        default:
          return res.status(500).json({
            status: error.code,
            message: error.message,
          });
      }
    }

   
    else if(error instanceof Joi.ValidationError){
      return res.status(400).json({
        status: "validation-error",
        errors: error.details,
      });
    }

    return res.status(500).json({
      status: "server-error",
      message: "An unexpected error occured.",
    });
    
  }
}

export default new SystemMiddlewares();
