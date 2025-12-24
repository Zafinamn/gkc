import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function resetMessengerProfile() {
  try {
    // 1️⃣ Reset Get Started
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_TOKEN}`,
      {
        get_started: { payload: "GET_STARTED" },
      }
    );
    console.log("✅ Get Started button set!");

    // 2️⃣ Reset Persistent Menu
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_TOKEN}`,
      {
        persistent_menu: [
          {
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [
              {
                type: "postback",
                title: "Тэтгэлгийн дэлгэрэнгүй",
                payload: "SCHOLARSHIP_INFO",
              },
              { type: "postback", title: "Холбоо барих", payload: "CONTACT" },
              { type: "postback", title: "Хаяг байршил", payload: "LOCATION" },
            ],
          },
        ],
      }
    );
    console.log("✅ Persistent menu set!");
  } catch (err) {
    console.error(err.response?.data || err);
  }
}

// Run the reset
resetMessengerProfile();
