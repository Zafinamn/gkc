import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const persistentMenu = {
  persistent_menu: [
    {
      locale: "default",
      composer_input_disabled: false,
      call_to_actions: [
        { type: "postback", title: "Тэтгэлгийн дэлгэрэнгүй", payload: "SCHOLARSHIP_INFO" },
        { type: "postback", title: "Холбоо барих", payload: "CONTACT" },
        { type: "postback", title: "Хаяг байршил", payload: "LOCATION" }
      ]
    }
  ]
};

try {
  const res = await axios.post(
    `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_TOKEN}`,
    persistentMenu
  );
  console.log("✅ Persistent menu set!");
} catch (err) {
  console.error(err.response?.data || err);
}
