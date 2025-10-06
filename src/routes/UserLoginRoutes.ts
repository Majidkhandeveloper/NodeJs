import { Router } from "express";
import {
  CreateUserLogin,
  CreateUsers,
  GetAllUserLogin,
} from "../controllers/UserLoginController";
import protect from "../middleware/AuthMiddleware";
import permission from "../controllers/permission";

const routes = Router();

routes.post("/user-login", CreateUserLogin);
routes.post("/users_create", CreateUsers);
routes.get("/user-login",protect,permission("user-login"), GetAllUserLogin);

export default routes;
