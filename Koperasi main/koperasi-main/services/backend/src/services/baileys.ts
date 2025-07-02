import { makeWASocket, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import fs from "fs";

let sock: any;
export let qrCode: string | null = null;
export let isConnected: boolean = false;

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_baileys");

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("connection.update", async (update: any) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCode = qr;
    }

    if (connection === "close") {
      isConnected = false;
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("Logged out, resetting auth state...");
        await resetAuthState();
        await startSock();
      } else {
        console.log("Connection closed with status code:", statusCode);
        await startSock();
      }
    } else if (connection === "open") {
      isConnected = true;
      qrCode = null;
      console.log("WhatsApp connection opened.");
    }

    console.log("Connection update:", update);
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (m: any) => {
    const msg = m.messages[0];
    if (!msg.key.fromMe && m.type === "notify") {
      console.log("Sender Number:", msg.key.remoteJid);
      console.log("Message:", msg.message.conversation);
    }
  });
};

const resetAuthState = async () => {
  const authDir = "./auth_baileys";

  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
    console.log("Auth state reset successfully.");
  } else {
    console.warn("Auth state directory does not exist.");
  }
};

export const sendTextWA = async (number: string, message: string) => {
  const formattedNumber = `${number}@s.whatsapp.net`;
  try {
    if (!isConnected) {
      throw new Error("WhatsApp is not connected.");
    }

    await sock.sendMessage(formattedNumber, { text: message });
    console.log(`Message sent to ${number}`);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

startSock();
