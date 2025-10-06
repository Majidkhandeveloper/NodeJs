import { Router } from "express";
import {
  CreatePost,
  GetEditPost,
  GetPost,
} from "../controllers/PostController";
import protect from "../middleware/AuthMiddleware";
import { CreatFlightSearch } from "../controllers/FlightSearchController";

const routes = Router();

routes.post("/flightSearch", CreatFlightSearch);
// protect

export default routes;
