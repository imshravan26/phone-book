import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    company: {
      type: String,
      trim: true,
      maxLength: [100, "Company name cannot exceed 100 characters"],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxLength: [100, "Job title cannot exceed 100 characters"],
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxLength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxLength: [100, "City name cannot exceed 100 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxLength: [100, "State name cannot exceed 100 characters"],
      },
      zipCode: {
        type: String,
        trim: true,
        maxLength: [20, "Zip code cannot exceed 20 characters"],
      },
      country: {
        type: String,
        trim: true,
        maxLength: [100, "Country name cannot exceed 100 characters"],
      },
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes cannot exceed 500 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxLength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for email and owner
contactSchema.index({ email: 1, owner: 1 }, { unique: true });

// Virtual for full name
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
contactSchema.set("toJSON", {
  virtuals: true,
});

export const Contact = mongoose.model("Contact", contactSchema);
