import { Router } from "express";
import {
  CreateUserLogin,
  CreateUsers,
  GetAllUserLogin,
  startPayfastPayment,
} from "../controllers/UserLoginController";
import axios from "axios";
import protect from "../middleware/AuthMiddleware";
import permission from "../controllers/permission";

const routes = Router();

routes.post("/user-login", CreateUserLogin);
routes.post("/users_create", CreateUsers);
routes.get("/user-login",protect,permission("user-login"), GetAllUserLogin);
routes.post("/payfast",startPayfastPayment)



export default routes;
