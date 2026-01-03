import { Contact } from "../models/contact.model.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants.js";
import mongoose from "mongoose";

export const createContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      notes,
      tags,
      isFavorite,
    } = req.body;

    // Validation
    if ([firstName, lastName, email, phone].some((field) => !field?.trim())) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "First name, last name, email, and phone are required",
      });
    }

    // Check if contact already exists for this user
    const existingContact = await Contact.findOne({
      email,
      owner: req.user._id,
    });

    if (existingContact) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "Contact with this email already exists",
      });
    }

    // Create contact
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      notes,
      tags,
      isFavorite,
      owner: req.user._id,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: { contact },
      message: SUCCESS_MESSAGES.CONTACT_CREATED,
    });
  } catch (error) {
    console.error("Create contact error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "Contact with this email already exists",
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      favorite,
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    let query = { owner: req.user._id };

    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    // Filter favorites
    if (favorite !== undefined) {
      query.isFavorite = favorite === "true";
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get total count
    const total = await Contact.countDocuments(query);

    // Get contacts
    const contacts = await Contact.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          total,
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1,
        },
      },
      message: SUCCESS_MESSAGES.CONTACTS_FETCHED,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CONTACT_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { contact },
      message: "Contact fetched successfully",
    });
  } catch (error) {
    console.error("Get contact error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    // Remove owner from update data for security
    delete updateData.owner;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CONTACT_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { contact },
      message: SUCCESS_MESSAGES.CONTACT_UPDATED,
    });
  } catch (error) {
    console.error("Update contact error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "Contact with this email already exists",
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CONTACT_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.CONTACT_DELETED,
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!contact) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.CONTACT_NOT_FOUND,
      });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { contact },
      message: `Contact ${contact.isFavorite ? "added to" : "removed from"} favorites`,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    });
  }
};
