import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

/* Webhook verification */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* Receive messages and postbacks */
app.post("/webhook", async (req, res) => {
  const event = req.body.entry?.[0]?.messaging?.[0];
  const senderId = event?.sender?.id;
  if (!senderId) return res.sendStatus(200);

  // Handle text messages
  if (event.message && event.message.text) {
    const text = event.message.text.toLowerCase();
    let reply = "Би ойлгоогүй байна 😅";

    if (text.includes("hello") || text.includes("сайн уу")) {
      reply = "Сайн байна уу! 👋 Та Persistent Menu-с сонголтоо хийнэ үү.";
    } else if (text.includes("тэтгэлэг")) {
      reply = `Солонгосын засгийн газрын тэтгэлэг маань шилдэг 74 их сургуулийн 400 орчим мэргэжлээс сонгон суралцах боломжтой...
1️⃣ Та ямар мэргэжлээр суралцах төлөвлөгөөтэй вэ?
2️⃣ Хэдэн онд аль сургуулийг хэд голчтой төгссөн бэ?
3️⃣ Та дараах шаардлагыг хангасан уу?`;
    } else if (text.includes("холбоо барих")) {
      reply = "📞 Утас: 8583-2416, 8874-6951";
    } else if (text.includes("хаяг") || text.includes("байршил")) {
      reply = "📍 UBH center, 12 давхар, 1223 тоот";
    }

    await sendMessage(senderId, reply);
  }

  // Handle postbacks from Persistent Menu
  if (event.postback && event.postback.payload) {
    const payload = event.postback.payload;

    if (payload === "SCHOLARSHIP_INFO") {
      await sendMessage(senderId,
`Солонгосын засгийн газрын тэтгэлэг маань шилдэг 74 их сургуулийн 400 орчим мэргэжлээс сонгон суралцах боломжтой...
1️⃣ Та ямар мэргэжлээр суралцах төлөвлөгөөтэй вэ?
2️⃣ Хэдэн онд аль сургуулийг хэд голчтой төгссөн бэ?
3️⃣ Та дараах шаардлагыг хангасан уу?`);
    } else if (payload === "CONTACT") {
      await sendMessage(senderId, "📞 Утас: 8583-2416, 8874-6951");
    } else if (payload === "LOCATION") {
      await sendMessage(senderId, "📍 UBH center, 12 давхар, 1223 тоот");
    }
  }

  res.sendStatus(200);
});

/* Send message function */
async function sendMessage(senderId, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`,
    {
      recipient: { id: senderId },
      message: { text },
    }
  );
}

/* Start server */
app.listen(process.env.PORT, () => {
  console.log(`🤖 Bot is running on port ${process.env.PORT}`);
});
