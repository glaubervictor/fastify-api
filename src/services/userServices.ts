import { User } from "@/db/userSchema";
import bcrypt from "bcrypt";
import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

export interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserWithGoogleSso {
  name: string;
  email: string;
  googleId: string;
}

export const getMe = async (request: FastifyRequest) => {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    throw new Error("No token provided");
  }
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET ?? ""
  ) as jwt.JwtPayload;
  return decoded as { id: string; email: string };
};

export const createUser = async (user: CreateUser) => {
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);

  const newUser = new User({
    ...user,
    password: hashedPassword,
  });
  await newUser.save();

  return {
    id: newUser._id.toString(),
    name: user.name,
    email: user.email,
  };
};

export const createUserWithGoogleSso = async (
  user: CreateUserWithGoogleSso
) => {
  const existingUser = await User.findOne({ email: user.email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const newUser = new User(user);
  await newUser.save();

  return {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password ?? "");
  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET ?? "",
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};
