import userService from "../../service/user.service.js";
import authService from "../../service/auth.service.js";

export default class UserController {





 
  async updateProfile(req, res, next) {

    try {
      const data = req.body;        
      const { file } = req;

      let my_bj = {
        ...data,
        userId:req.user.id,
        role:req.user.role,
        image:{
          size:file?.size
        }
      }

       await userService.handleUpdateProfile(my_bj,file);
  
      return res.status(200).json({
        status: 200,
        message: "updated successfully",
      });
       
        
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  
  async updatelistedBuilding(req, res, next) {

    try {
      const data = req.body;        
      const { files } = req;

      let amenities;
      if (typeof data.amenity === 'string') {
        try {
          // Try to parse the stringified array
          amenities = JSON.parse(data.amenity);
        } catch (error) {
          // If parsing fails, keep it as is (string or invalid JSON)
          amenities = data.amenity;
        }
      } else {
        // If it's already an array, keep it as is
        amenities = data.amenity;
      }

      let my_bj = {
        ...data,
        role:req.user.role,
        bedroomSizeImage: files?.bedroomSizeImage ? { size: files.bedroomSizeImage[0].size } : undefined,
        kitchenSizeImage: files?.kitchenSizeImage ? { size: files.kitchenSizeImage[0].size } : undefined,
        livingRoomSizeImage: files?.livingRoomSizeImage ? { size: files.livingRoomSizeImage[0].size } : undefined,
        diningAreaSizeImage: files?.diningAreaSizeImage ? { size: files.diningAreaSizeImage[0].size } : undefined,
        propertyTerms: files?.propertyTerms ? { size: files.propertyTerms[0].size } : undefined,
        amenity:amenities,
        userId:req.user.id,
      }

       await userService.handleUpdatelistedBuilding(my_bj,files);
        
      return res.status(200).json({
        status: 200,
        message: "updated successfully",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async listBuilding(req, res, next) {

    try {
      const data = req.body;        
      const { files } = req;

      let amenities;
      if (typeof data.amenity === 'string') {
        try {
          // Try to parse the stringified array
          amenities = JSON.parse(data.amenity);
        } catch (error) {
          // If parsing fails, keep it as is (string or invalid JSON)
          amenities = data.amenity;
        }
      } else {
        // If it's already an array, keep it as is
        amenities = data.amenity;
      }

      let my_bj = {
        ...data,
        role:req.user.role,
        bedroomSizeImage: files?.bedroomSizeImage ? { size: files.bedroomSizeImage[0].size } : undefined,
        kitchenSizeImage: files?.kitchenSizeImage ? { size: files.kitchenSizeImage[0].size } : undefined,
        livingRoomSizeImage: files?.livingRoomSizeImage ? { size: files.livingRoomSizeImage[0].size } : undefined,
        diningAreaSizeImage: files?.diningAreaSizeImage ? { size: files.diningAreaSizeImage[0].size } : undefined,
        propertyTerms: files?.propertyTerms ? { size: files.propertyTerms[0].size } : undefined,
        amenity:amenities,
        userId:req.user.id,
      }

       await userService.handleListBuilding(my_bj,files);
        
      return res.status(200).json({
        status: 200,
        message: "Building listed successfully",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }



  
  async ProspectiveTenantInformation(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleProspectiveTenantInformation(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async tenant(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleTenant(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  
  async rentAction(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleRentAction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getInspectionDetails(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetInspectionDetails(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getTransactionRefund(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetTransactionRefund(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getTransaction(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetTransaction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getChat(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetChat(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  

  async getBuildingDetails(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetBuildingDetails(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }

  async getBuildings(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetBuildings(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getUpcomingInspection(req, res, next) {

    try {

      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetUpcomingInspection(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
  
  async getTenantsWithDueRent(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetTenantsWithDueRent(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        response
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  
  async getALLreviewTenant(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetALLreviewTenant(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  async   getBuildingPreference(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetBuildingPreference(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async getNotification(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      const response=await userService.handleGetNotification(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  async getAllTrasaction(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
      }

      const result=await userService.handleGetAllTrasaction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  
  async getIncome(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const result=await userService.handleGetIncome(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  
  async getCount(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const result=await userService.handleGetCount(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  async getTotalEscrowBalance(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const result=await userService.handleGetTotalEscrowBalance(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  
  async getAllLordData(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const result=await userService.handleGetAllLordData(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  
  async getAllUser(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const result=await userService.handleGetAllUser(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:result
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
  
  async appointmentAndRent(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

      await userService.handleAppointmentAndRent(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  

  async reviewBuildingAction(req, res, next) {

    try {
      const data = req.body;          

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

       await userService.handleReviewBuildingAction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async reviewBuilding(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

       await userService.handleReviewBuilding(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  

  async disableAccount(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

       await userService.handleDisableAccount(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }



  async BuildingPreferenceAction(
    req,
    res,
    next
  ) {
    try {


      const data = req.body;        



      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }
      
      await userService.handleBuildingPreferenceAction(my_bj);

      return res.status(200).json({
        status: 200,
        message: "successfull"
      });

    } catch (error) {
      next(error);
    }
  }

  async validateNIN(
    req,
    res,
    next
  ) {
    try {


      const data = req.body;        

      let my_bj = {
        ...data,
      }
      
      await userService.handleValidateNIN(my_bj);

      return res.status(200).json({
        status: 200,
        message: "opt has been sent to the number attached to the nin"
      });

    } catch (error) {
      next(error);
    }
  }


  async reviewTenant(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

       await userService.handleReviewTenant(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async quitNoticeAction(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        role:req.user.role,
        userId:req.user.id
      }

       await userService.handleQuitNoticeAction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }


  async getMyProperty(req, res, next) {

    try {
      const data = req.query;        

      let my_bj = {
        ...data,
        userId:req.user.id,
        role:req.user.role
      }

      const response= await userService.handleGetMyProperty(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
       
        
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  

  async sendInvoce(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        userId:req.user.id,
        role:req.user.role
      }

      const response=await userService.handleSendInvoce(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
       
        
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async inspectionAction(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        userId:req.user.id,
        role:req.user.role
      }

      const response=await userService.handleInspectionAction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "successfull",
        data:response
      });
       
        
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }

  async chat(req, res, next) {

    try {
      const data = req.body;        
      const { file } = req;

      let my_bj = {
        ...data,
        userId:req.user.id,
        role:req.user.role,
        image:{
          size:file?.size
        }
      }

       await userService.handleChat(my_bj, file);
  
      return res.status(200).json({
        status: 200,
        message: "updated successfully",
      });
       
        
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }









/*


  async sendVerificationCodeEmailOrTelAdmin(req, res, next) {

    try {

      const data = req.body;        

      let my_bj = {
        ...data,
      }

      const obj = await userService.handleSendVerificationCodeEmailOrTelAdmin(my_bj);
  

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


  
  async addOrUpdatefilter(req, res, next) {

    try {
      const data = req.body;        

      let my_bj = {
        ...data,
        userId:req.user.id
      }

      const obj = await userService.handleAddOrUpdatefilter(my_bj);
  

      
        return res.status(200).json({
          status: 200,
          message: "filter setting updated successfully",
        });
      
     
    } catch (error) {
      console.log(error);
      next(error)
    }
    
  }
*/
  async updatefcmToken(
    req,
    res,
    next
  ){
    const data=req.body
 
    try {
      
        const my_bj = {
          ...data,
          userId:req.user.id, 
        }
                          
        await userService.handleUpdatefcmToken(my_bj);

        return res.status(200).json({
          status: 200,
          message: "success",
        });
      
     
    } catch (error) {
      console.log(error)
      next(error);
    }
  }


  async whoIAm(
    req,
    res,
    next
  ){
   
    try {
    
        const my_bj = {
          userId:req.user.id
        }
                          
        const result=await userService.handleWhoIAm(my_bj);

      return res.status(200).json({
        status: 200,
        data:result,
      });
    } catch (error) {
      console.log(error)
      next(error);
    }
  }













}
