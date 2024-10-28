import { Router } from "express";
import {
  signup,
  login,
  getUserInfo,
  updateProfile,
  logout,
} from "../controller/AuthCntroller.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

// Route to handle user signup
authRoutes.post("/signup", signup);

// Route to handle user login
authRoutes.post("/login", login);

// Route to get user info, which requires authentication
authRoutes.get("/user-info", verifyToken, getUserInfo);

//
authRoutes.post("/update-profile", verifyToken, updateProfile);
// authRoutes.post("/update-profile", updateProfile);

authRoutes.post("/logout", verifyToken, logout);
export default authRoutes;
