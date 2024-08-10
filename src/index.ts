import express from "express";
import cors from "cors";
// import Connection from "./db/dbConfig";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Connection from "./db/dbConfig";
import UserLoginRoutes from "./routes/UserLoginRoutes";
import PostRoutes from "./routes/PostRoutes";

const app = express();
dotenv.config();
app.use(
  cors({
    //   origin: {
    //     // this url and methods mean that this project is only access to this url and these methods only for security porpuse
    //     URL: [process.env.FRONTEND_URL],
    //   } as any,
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
