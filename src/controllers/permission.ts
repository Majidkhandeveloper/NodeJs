import { Request, Response, NextFunction } from "express";

// Call as: permission("project")
const permission = (moduleName: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.user_id;
console.log("userId", userId);

   
      next();
    } catch (err) {
      res.status(500).json({ message: "Permission check failed", error: err });
    }
  };
};

export default permission;
