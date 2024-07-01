import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Define the User interface
export interface IUser extends Document {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  profileImage: string;
  dateOfBirth: Date;
  location: string;
  bands?: Array<string>;
  instruments?: Array<string>;
  videos?: Array<string>;
  followers?: Array<string>;
  following?: Array<string>;
  coverImage: string;
  googleId?: string;
  refreshToken?: string;
  isAdmin: boolean;
}

// Define the static method interface
interface IUserModel extends Model<IUser> {
  checkCredentials(email: string, password: string): Promise<IUser | null>;
}

// Define the User schema
const UserSchema = new Schema<IUser>({
  firstname: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, maxlength: 50 },
  dateOfBirth: { type: Date },
  profileImage: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  bands: { type: [String], default: [] },
  location: { type: String },
  instruments: { type: [String], default: [] },
  videos: [{ type: Schema.Types.ObjectId, ref: 'Video' }],
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  isAdmin: { type: Boolean, default: false }
});

// Add checkCredentials static method
UserSchema.statics.checkCredentials = async function (
  email: string,
  password: string
): Promise<IUser | null> {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
  }
  return null;
};

// Pre-save middleware to hash the password
UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (user.isModified("password")) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  next();
});

// Method to remove sensitive information
UserSchema.methods.toJSON = function () {
  const user = this.toObject({ getters: true, virtuals: true }) as IUser;
  const { password, __v, ...userWithoutSensitiveInfo } = user;
  return userWithoutSensitiveInfo;
};

// Create the User model
const UserModel = (mongoose.models.User || mongoose.model<IUser, IUserModel>("User", UserSchema)) as IUserModel;

export default UserModel;
