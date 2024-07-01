import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: "http://localhost:3000"
  },
  env: {
    "test_email": "mflynn24@jhu.edu",
    "test_password": "testingPassword",
  },
});
