import UserLogingModel from "../model/UserLoginModel";
import { Request, Response } from "express";


export const CreateUserLogin = async (
    req: any,
    res: Response
  ): Promise<void> => {
 console.log("req.body",req.body);
 
  
    try {
      const data = await UserLogingModel.create({
        ...req.body,
       
      });
      console.log("Data",data);
      
    //   ResponseMessage(res, 200, data);
  
    } catch (error) {
        console.log("error",error);
        
    //   ErrorMessage(res, error, 400);
    }
  };

export const GetAllUserLogin = async (
    req: any,
    res: Response
  ): Promise<void> => {

    try {
      const data = await UserLogingModel.findAll();
      console.log("Data",data);
      res.status(200).json(data)
    //   ResponseMessage(res, 200, data);
  
    } catch (error) {
        console.log("error",error);
        
    //   ErrorMessage(res, error, 400);
    }
  };