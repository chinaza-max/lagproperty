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



  async listBuilding(req, res, next) {

    try {
      const data = req.body;        
      const { files } = req;

      let my_bj = {
        ...data,
        amenity:JSON.parse(data.amenity),
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
        response
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
        response
      });
      
     
    } catch (error) {
      console.log(error);
      next(error)
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

       await userService.handleGetMyProperty(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "updated successfully",
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

       await userService.handleInspectionAction(my_bj);
  
      return res.status(200).json({
        status: 200,
        message: "updated successfully",
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
