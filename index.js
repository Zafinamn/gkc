import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

if (!PAGE_TOKEN) {
  console.error("❌ PAGE_ACCESS_TOKEN is missing! Check your .env file.");
  process.exit(1);
}

/* ---------- In-memory user state ---------- */
const userAskedForContact = {}; // track if user already received "ask contact" message

/* ---------- Webhook verification ---------- */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/* ---------- Webhook POST handler ---------- */
app.post("/webhook", async (req, res) => {
  try {
    console.log("🔔 Webhook POST received:", JSON.stringify(req.body, null, 2));

    const event = req.body.entry?.[0]?.messaging?.[0];
    const senderId = event?.sender?.id;
    if (!senderId) return res.sendStatus(200);

    // Handle text messages
    if (event.message && event.message.text) {
      const text = event.message.text.toLowerCase();

      // First-time unknown message: ask for contact + show Button Menu
      if (!userAskedForContact[senderId]) {
        await sendMessage(senderId, "Та холбоо барих дугаараа үлдээнэ үү 📞");
        userAskedForContact[senderId] = true;

        // Optional reset after 24h
        setTimeout(() => {
          userAskedForContact[senderId] = false;
        }, 24 * 60 * 60 * 1000);

        // Send Button Menu immediately
        await sendButtonMenu(senderId);
      }
      else {
        // Normal keyword handling
        if (text.includes("hello") || text.includes("сайн уу")) {
          await sendButtonMenu(senderId);
        } else if (text.includes("тэтгэлэг")) {
          await sendMessage(senderId, `Солонгосын засгийн газрын тэтгэлэг маань шилдэг 74 их сургуулийн 400 орчим мэргэжлээс сонгон суралцах боломжтой...
1️⃣ Та ямар мэргэжлээр суралцах төлөвлөгөөтэй вэ?
2️⃣ Хэдэн онд аль сургуулийг хэд голчтой төгссөн бэ?
3️⃣ Та дараах шаардлагыг хангасан уу?`);
        } else if (text.includes("холбоо барих")) {
          await sendMessage(senderId, "📞 Утас: 8583-2416, 8874-6951");
        } else if (text.includes("хаяг") || text.includes("байршил")) {
          await sendMessage(senderId, "📍 UBH center, 12 давхар, 1223 тоот");
        }
        // else do nothing (already asked for contact)
      }
    }

    // Handle postbacks from Persistent Menu or Button Template
    if (event.postback && event.postback.payload) {
      await handlePostback(senderId, event.postback.payload);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error handling webhook:", err);
    res.sendStatus(500);
  }
});

/* ---------- Send normal message ---------- */
async function sendMessage(senderId, text) {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text }
      }
    );
    console.log("✅ Message sent:", res.data);
  } catch (err) {
    console.error("❌ Error sending message:", err.response?.data || err.message);
  }
}

/* ---------- Send Button Template ---------- */
async function sendButtonMenu(senderId) {
  const body = {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Сайн байна уу! 👋 Та дараах Menu-с сонголтоо хийнэ үү:",
          buttons: [
            { type: "postback", title: "Тэтгэлэг мэдээлэл", payload: "SCHOLARSHIP_INFO" },
            { type: "postback", title: "Холбоо барих", payload: "CONTACT" },
            { type: "postback", title: "Хаяг байршил", payload: "LOCATION" }
          ]
        }
      }
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
      body
    );
    console.log("✅ Button Menu sent:", res.data);
  } catch (err) {
    console.error("❌ Error sending Button Menu:", err.response?.data || err.message);
  }
}

/* ---------- Handle Postback ---------- */
async function handlePostback(senderId, payload) {
  switch (payload) {
    case "GET_STARTED":
      await sendButtonMenu(senderId);
      break;
    case "SCHOLARSHIP_INFO":
      await sendMessage(senderId, `Солонгосын засгийн газрын тэтгэлэг маань шилдэг 74 их сургуулийн 400 орчим мэргэжлээс сонгон суралцах боломжтой...
1️⃣ Та ямар мэргэжлээр суралцах төлөвлөгөөтэй вэ?
2️⃣ Хэдэн онд аль сургуулийг хэд голчтой төгссөн бэ?
3️⃣ Та дараах шаардлагыг хангасан уу?`);
      break;
    case "CONTACT":
      await sendMessage(senderId, "📞 Утас: 8583-2416, 8874-6951");
      break;
    case "LOCATION":
      await sendMessage(senderId, "📍 UBH center, 12 давхар, 1223 тоот");
      break;
    default:
      await sendMessage(senderId, "Би ойлгоогүй байна 😅");
  }
}

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Bot is running on port ${PORT}`));
