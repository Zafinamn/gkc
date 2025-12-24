import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const getStartedPayload = {
  get_started: { payload: "GET_STARTED" }
};

try {
  const res = await axios.post(
    `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_TOKEN}`,
    getStartedPayload
  );
  console.log("✅ Get Started button set!");
} catch (err) {
  console.error(err.response?.data || err);
}
