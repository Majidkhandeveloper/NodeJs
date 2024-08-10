import UserLogingModel from "../model/UserLoginModel";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { sign } from "jsonwebtoken";
import { ErrorMessage } from "../Utils/ErrorMessage";
import requestedIp from "ip";
import os from "os";
import { ResponseMessage } from "../Utils/ResponseMessage";
export const CreateUserLogin = async (
  req: any,
  res: Response
): Promise<any> => {
  console.log("req.body", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return ErrorMessage(res, "Please enter email or password", 200);
    // res.status(200).json({Message:"Please enter email or password"})
  }
  try {
    const user: any = await UserLogingModel.findOne({
      // attributes: { include: ["password"] },
    });
    // console.log("user", user);

    // console.log("userLogin pass", user.dataValues.password);

    // UserAttributes
    if (!user) return ErrorMessage(res, "wrong credentials", 400);
    const comparePassword = await bcrypt.compare(password, user.password);
    // console.log("comparePassword", comparePassword);

    if (!comparePassword) return ErrorMessage(res, "wrong credentials", 400);
    // condition to login only active users
    // if (!user) return ErrorMessage(res, "only active users allowed", 400);
    const token = jwt.sign(
      { email: user.email, id: user.user_id },
      process.env.SECRETE_KEY as string
    );
    const options = {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    // let {user_id,role_id,agent_id,l_name,f_name}=user
    // we are extracting the password from the user object that is not gona be shown in the end point
    const userData = user.get({ plain: true }) as { [key: string]: any };
    if (userData) {
      const deviceName = os.hostname();
      const agentUserId: any = userData.user_id;
      // Assuming requestedIp.address() returns the IP address as a string
      // const ipAddress: string = requestedIp.address();
      //     await UserLoginIpModel.create({
      //       user_id:agentUserId,
      //       ip_address:ipAddress,
      //       device_name:deviceName,
      //       current_time:moment(new Date()).format('YYYY-MM-DDThh:mm')
      //     })
    }
    delete userData.password; // Remove the password field from the user data
    return res
      .status(200)
      .cookie("token", token, options)
      .json({ result: userData, token });
  } catch (error) {
    console.log("error", error);
    res.status(400).json(error);
    // ErrorMessage(res, error, 400);
  }
};

export const CreateUsers = async (req: any, res: Response): Promise<any> => {
  const { password } = req.body;

  const hashPassword = await bcrypt.hash(password, 12);
  try {
    const data = await UserLogingModel.create({
      ...req.body,
      password: hashPassword,
    });
    ResponseMessage(res, 200, "Create Succesfully", data);
  } catch (error) {
    ErrorMessage(res, error, 400);
  }
};

export const GetAllUserLogin = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const data = await UserLogingModel.findAll();
    console.log("Data", data);
    res.status(200).json(data);
    //   ResponseMessage(res, 200, data);
  } catch (error) {
    console.log("error", error);

    //   ErrorMessage(res, error, 400);
  }
};
