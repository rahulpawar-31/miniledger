import { config } from "./config.js";
import { createApp } from "./app.js";

createApp().listen(config.port, () => {
  console.log(`MiniLedger API running on http://localhost:${config.port}`);
});
