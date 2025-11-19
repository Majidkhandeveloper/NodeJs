import express from "express";
import cors from "cors";
// import Connection from "./db/dbConfig";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Connection from "./db/dbConfig";
import UserLoginRoutes from "./routes/UserLoginRoutes";
import PostRoutes from "./routes/PostRoutes";
import FlighSearchRoutes from "./routes/FlighSearchRoutes";

const app = express();
dotenv.config();
app.set("trust proxy", true);

app.use(
  cors({
      origin: {
        // this url and methods mean that this project is only access to this url and these methods only for security porpuse
        URL: [process.env.FRONTEND_URL],
      } as any,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// middlewares
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("", express.static("uploads"));

app.use("/api/v1/p2p", UserLoginRoutes);
app.use("/api/v1/p2p", PostRoutes); //explain a table relation with  a table twice post_by and edit_by id belon userLoinTable
app.use("/api/v1/p2p",FlighSearchRoutes)

// req.body {
//   departingOn: '16-10-2025',
//   locationDep: 'ISB-Islamabad International Airport',
//   locationArrival: 'KHI-Jinnah International Airport',
//   ReturningOn: '04-10-2025',
//   multi_des_from: [ 'KHI-Jinnah International Airport-Karachi' ],
//   multi_des_to: [ '' ],
//   multi_des_from_date: [ '16-10-2025' ],
//   multi_des_ticket_class: [ 'Economy' ],
//   adultsCount: 1,
//   adult_ages: [ '30' ],
//   childCount: 0,
//   children_ages: [ '5' ],
//   infantNo: 0,
//   infant_ages: [],
//   trip_type: 'ONE WAY',
//   gds: 'HITIT',
//   ticket_class: 'Economy'
// }



const PORT: number = parseInt(process.env.PORT || "4000");
Connection.authenticate()
  .then((err) => {
    console.log("Connected successfully to the database.");
  })
  .catch((error) => {
    console.log("Unable to connect to the database:", error);
  });
Connection.sync()
  .then(() => {
    console.log("tables created");
  })
  .catch((error: any) => {
    console.error("An error occured while creating table", error);
  });
app.listen(PORT, () => {
  console.log(`server runs on PORT ${PORT}`);
});
