export const DB_NAME = "contact-saas";
export const JWT_EXPIRES_IN = "7d";
export const BCRYPT_SALT_ROUNDS = 10;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully",
  USER_LOGGED_IN: "User logged in successfully",
  CONTACT_CREATED: "Contact created successfully",
  CONTACT_UPDATED: "Contact updated successfully",
  CONTACT_DELETED: "Contact deleted successfully",
  CONTACTS_FETCHED: "Contacts fetched successfully",
};

export const ERROR_MESSAGES = {
  USER_EXISTS: "User already exists",
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  CONTACT_NOT_FOUND: "Contact not found",
  UNAUTHORIZED_ACCESS: "Unauthorized access",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
};
