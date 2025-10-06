import { Router } from "express";
import {
  CreatePost,
  GetEditPost,
  GetPost,
} from "../controllers/PostController";
import protect from "../middleware/AuthMiddleware";

const routes = Router();

routes.post("/post/crete", protect, CreatePost);
routes.get("/post/get", GetPost);
routes.get("post/editpost", GetEditPost);

export default routes;
