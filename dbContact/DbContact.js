import mongoose from "mongoose";

const startServer = async (app) => {
  const PORT = process.env.PORT;
  const MONGODB_URI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(" Connected to MongoDB successfully!");

    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(" Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};


export default startServer;