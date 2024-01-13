import { Model, DataTypes } from "sequelize";
import Connection from "../db/dbConfig";



export interface AgentUserProp {
  user_id?: number;
  role_id?: number;
  f_name?: string;
  l_name?: string;
  mobile_no?: string;
  email?: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
 
}

class AgentUserModel extends Model<AgentUserProp> {}

AgentUserModel.init(
  {
    user_id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    f_name: { type: DataTypes.STRING },
    l_name: { type: DataTypes.STRING },
    mobile_no: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING},
    password: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: Date.now },
    updated_at: { type: DataTypes.DATE, defaultValue: Date.now },
    
  },
  {
    timestamps: false,
    sequelize: Connection,
    modelName: "users_login",
  }
);




export default AgentUserModel;
