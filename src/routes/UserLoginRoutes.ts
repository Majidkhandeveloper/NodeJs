import { Router } from "express";
import {
  CreateUserLogin,
  CreateUsers,
  GetAllUserLogin,
} from "../controllers/UserLoginController";

const routes = Router();

routes.post("/user-login", CreateUserLogin);
routes.post("/users_create", CreateUsers);
routes.get("/user-login", GetAllUserLogin);

export default routes;
