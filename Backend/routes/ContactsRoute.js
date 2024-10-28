import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getAllContacts,
  getContactsForDMList,
  searchContacts,
} from "../controller/ContactsConntroller.js"; // Ensure this points to your controller

const contactsRoutes = Router();

// Define the correct route
contactsRoutes.post("/search-contacts", verifyToken, searchContacts); //serch contacts
contactsRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDMList); //get contacts list
contactsRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

export default contactsRoutes;
