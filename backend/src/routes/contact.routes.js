import { Router } from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  toggleFavorite,
} from "../controllers/contact.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  validateContactCreation,
  validateContactUpdate,
} from "../middlewares/validation.middleware.js";

const router = Router();

// All contact routes require authentication
router.use(verifyJWT);

// Contact CRUD routes
router
  .route("/")
  .get(getAllContacts)
  .post(validateContactCreation, createContact);

router
  .route("/:id")
  .get(getContactById)
  .put(validateContactUpdate, updateContact)
  .delete(deleteContact);

// Additional routes
router.route("/:id/favorite").patch(toggleFavorite);

export default router;
