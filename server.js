import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.GRAPH_API_VERSION || "v25.0";

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "whatsapp-coexistence",
    endpoints: ["/health", "/webhook/whatsapp"]
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "whatsapp-coexistence",
    time: new Date().toISOString()
  });
});

app.get("/webhook/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook/whatsapp", (req, res) => {
  console.log("WHATSAPP WEBHOOK:", JSON.stringify(req.body, null, 2));
  return res.sendStatus(200);
});

app.post("/send-text", async (req, res) => {
  try {
    const { phone_number_id, to, body } = req.body;

    if (!phone_number_id || !to || !body || !ACCESS_TOKEN) {
      return res.status(400).json({
        error: "Informe phone_number_id, to e body. O access token deve estar configurado no Vercel."
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phone_number_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body }
        })
      }
    );

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/sync", async (req, res) => {
  try {
    const { phone_number_id, sync_type } = req.body;

    if (!phone_number_id || !["smb_app_state_sync", "history"].includes(sync_type) || !ACCESS_TOKEN) {
      return res.status(400).json({
        error: "Use phone_number_id, sync_type=smb_app_state_sync|history. O access token deve estar configurado no Vercel."
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phone_number_id}/smb_app_data`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          sync_type
        })
      }
    );

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`WhatsApp Coexistence server running on port ${PORT}`);
});
