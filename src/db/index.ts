import mongoose from "mongoose";

let isConnected = false;

const initDb = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI as string);
  isConnected = true;
  console.log("Connected to MongoDB");
};

export { initDb };
