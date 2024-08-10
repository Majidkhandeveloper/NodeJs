import { Router } from "express";
import {
  CreatePost,
  GetEditPost,
  GetPost,
} from "../controllers/PostController";
import protect from "../middleware/AuthMiddleware";

const routes = Router();

routes.post("/post", protect, CreatePost);
routes.get("/post", GetPost);
routes.get("/editpost", GetEditPost);

export default routes;
