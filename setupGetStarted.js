import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

if (!PAGE_TOKEN) {
  console.error("❌ PAGE_ACCESS_TOKEN is missing! Check your .env file.");
  process.exit(1);
}

// Define Persistent Menu and Get Started payloads
const body = {
  get_started: { payload: "GET_STARTED" },
  persistent_menu: [
    {
      locale: "default",
      composer_input_disabled: false,
      call_to_actions: [
        { type: "postback", title: "Тэтгэлэг мэдээлэл", payload: "SCHOLARSHIP_INFO" },
        { type: "postback", title: "Холбоо барих", payload: "CONTACT" },
        { type: "postback", title: "Хаяг байршил", payload: "LOCATION" }
      ]
    }
  ]
};

// Send request to set Get Started + Persistent Menu
axios.post(`https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_TOKEN}`, body)
  .then(res => {
    console.log("✅ Get Started button and Persistent Menu set!");
    console.log(res.data);
  })
  .catch(err => {
    console.error("❌ Error setting menu:", err.response?.data || err.message);
  });
