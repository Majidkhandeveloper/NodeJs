import { Router } from "express";
import {
  CreatePost,
  GetEditPost,
} from "../controllers/PostController";
import protect from "../middleware/AuthMiddleware";
import { CreatFlightSearch, GetPrediction } from "../controllers/FlightSearchController";

const routes = Router();

routes.post("/flightSearch", CreatFlightSearch);
routes.post("/predict", GetPrediction);
// protect

export default routes;
