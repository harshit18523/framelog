import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface Iuser extends Document {
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  }
}, { timestamps :true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(6);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default model<Iuser>("User", userSchema);
