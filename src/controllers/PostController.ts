import PostModel from "../model/PostModel";
import { Request, response } from "express";
import UserLogingModel from "../model/UserLoginModel";
import Sequelize from "sequelize";
import { ResponseMessage } from "../Utils/ResponseMessage";
import { Response } from "express";
import { Op } from "sequelize"; // Import Op from sequelize

export const CreatePost = async (req: any, res: Response): Promise<void> => {
  console.log("req.body", req.body);

  try {
    const data = await PostModel.create({
      ...req.body,
    });
    // console.log("Data",data);
    res.status(200).json({ message: "Data insert Successfuly" });

    // ResponseMessage(res, 200, data);
  } catch (error) {
    console.log("error", error);

    //   ErrorMessage(res, error, 400);
  }
};

export const GetPost = async (req: any, res: Response): Promise<void> => {
  try {
    const data = await PostModel.findAll({
      include: [
        {
          model: UserLogingModel,
          attributes: ["f_name", "l_name"],
          where: {
            user_id: Sequelize.col("post_by"), //user_id ===post_by id
          },
          as: "PostBy", // Alias for the first association
          required: false,
        },
        {
          model: UserLogingModel,
          attributes: ["f_name", "l_name"],
          where: {
            user_id: Sequelize.col("edite_by"),
          },
          as: "EditBy", // Alias for the first association
          required: false,
        },
      ],
    });
    ResponseMessage(res, 200, "success", data);
  } catch (error) {
    console.log(error);
  }
};

export const GetEditPost = async (req: any, res: Response): Promise<void> => {
  try {
    const data = await PostModel.findAll({
      where: {
        edite_by: {
          [Op.not]: null as unknown as string, //ensuring that the edite_by column is not null
        },
      },
      include: [
        {
          model: UserLogingModel,
          attributes: ["f_name", "l_name"],
          where: {
            user_id: Sequelize.col("post_by"), //user_id ===post_by id
          },
          as: "PostBy", // Alias for the first association
          required: false,
        },
        {
          model: UserLogingModel,
          attributes: ["f_name", "l_name"],
          where: {
            user_id: Sequelize.col("edite_by"),
          },
          as: "EditBy", // Alias for the first association
          required: false,
        },
      ],
    });
    ResponseMessage(res, 200, "success", data);
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in GetEditPost:", error);
    ResponseMessage(res, 500, "error", null); // Example response for an error
  }
};
