// import { Sequelize } from "sequelize-typescript";

// const Connection = new Sequelize({
// dialect: "mysql",
// host: "localhost",
// username: "root",
// password: "",
// database: "zaira_b2b_node",
// logging: false,

//   // dialect: "mysql",
//   // host: process.env.HOST as string,
//   // username:  process.env.DB_USER as string,
//   // password: "",
//   // database: "zaira_b2b_node",
//   // // database: process.env.DB_NAME as string,
//   // logging: false,
// });

// export default Connection;

// ************************** if you have port and db issues you can use the above approch ***********************
import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
dotenv.config();

const Connection = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as undefined,

  {
    // always check the port number of xamp
    port: ~~(process.env.DB_PORT || 3306),
    // Also, the host property in the options object is marked with a non-null assertion operator (!) to indicate that we're sure that process.env.HOST won't be undefined at runtime.
    host: process.env.HOST!,
    // host: "localhost",
    dialect: "mysql",
    logging: false,
  }
);

export default Connection;