import { Model, DataTypes } from "sequelize";
import Connection from "../db/dbConfig";
import UserLogingModel from "./UserLoginModel";

export interface PostModelProp {
  post_id?: number;
  title?: string;
  description?: String;
  post_by?: number;
  edite_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

class PostModel extends Model<PostModelProp> {}

PostModel.init(
  {
    post_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    post_by: { type: DataTypes.INTEGER, defaultValue: null },
    edite_by: { type: DataTypes.INTEGER, defaultValue: null },
    created_at: { type: DataTypes.DATE, defaultValue: Date.now },
    updated_at: { type: DataTypes.DATE, defaultValue: Date.now },
  },
  {
    timestamps: false,
    sequelize: Connection,
    modelName: "post",
  }
);
PostModel.hasMany(UserLogingModel);
UserLogingModel.hasMany(PostModel, { foreignKey: "post_by" });
PostModel.belongsTo(UserLogingModel, { foreignKey: "post_by", as: "PostBy" });

UserLogingModel.hasMany(PostModel, { foreignKey: "edite_by" });
PostModel.belongsTo(UserLogingModel, { foreignKey: "edite_by", as: "EditBy" });

export default PostModel;
