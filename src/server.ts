import app from "./app";
import config from "./app/config";

const main = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

main();
