import { Router } from "express";
import { CreateUserLogin, GetAllUserLogin } from "../controllers/UserLoginController";


const routes = Router( )


// routes.post("/user-login", CreateUserLogin);
routes.get("/user-login",GetAllUserLogin)



export default routes