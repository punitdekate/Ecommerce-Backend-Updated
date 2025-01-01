import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  postalCode: { type: String },
  type: { type: String },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name."],
    minLength: [3, "Your name must be at least 3 characters long."],
  },
  email: {
    type: String,
    required: [true, "Email address is required."],
    unique: [true, "This email is already associated with an account."],
    validate: {
      validator: function (mail) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
      },
      message: "Please provide a valid email address.",
    },
  },
  password: {
    type: String,
    required: [true, "Please create a password."],
    minLength: [8, "Your password must be at least 8 characters long."],
    maxLength: [16, "Your password cannot exceed 16 characters."],
  },
  phone: {
    type: Number,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: "Phone number must be exactly 10 digits.",
    },
  },
  profile: {
    type: String,
  },
  role: {
    type: String,
    enum: ["seller", "customer", "admin"],
    default: "customer",
  },
  status: {
    type: Boolean,
    default: true,
  },
  address: [addressSchema],
  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpiry: {
    type: Date, // Change to Date for better handling of expiry
  },
});

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to generate JWT token
userSchema.methods.generateJwtToken = async function () {
  return await jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
};

// Method to compare passwords
userSchema.methods.compare = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateResetToken = async function (password) {
  const salt = crypto.randomBytes(16).toString("hex"); // Generate a random salt
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512") // Derive key with PBKDF2
    .toString("hex");
  this.resetPasswordToken = hash;
  this.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;
};

userSchema.methods.verifyPassword = async function (password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  if (this.resetPasswordTokenExpiry < Date.now()) {
    return false;
  }
  return hash === originalHash;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
