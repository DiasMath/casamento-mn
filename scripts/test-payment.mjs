import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file manually
const envPath = resolve(import.meta.dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  let value = trimmed.slice(eqIndex + 1).trim();
  // Remove surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

// Init Firebase Admin
const pk = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")?.replace(/\\r/g, "")?.trim();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: pk,
    }),
  });
}

const db = admin.firestore();

// Get args
const giftId = process.argv[2];
const amount = Number(process.argv[3]) || 10;
const contributorName = process.argv[4] || "Teste Local";

if (!giftId) {
  console.log("Uso: node scripts/test-payment.mjs <giftId> [amount] [nome]");
  console.log("Exemplo: node scripts/test-payment.mjs abc123 50 'Joao Silva'");
  process.exit(1);
}

async function simulatePayment() {
  try {
    const giftRef = db.collection("gifts").doc(giftId);
    const giftSnap = await giftRef.get();

    if (!giftSnap.exists) {
      console.error(`Presente ${giftId} nao encontrado`);
      process.exit(1);
    }

    const giftData = giftSnap.data();
    console.log(`Presente: ${giftData.title}`);
    console.log(`Arrecadado atual: R$ ${giftData.raised}`);
    console.log(`Adicionando: R$ ${amount}`);

    await giftRef.update({
      raised: admin.firestore.FieldValue.increment(amount),
    });

    await db.collection("contributions").add({
      giftId,
      contributorName,
      value: amount,
      date: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: `test-local-${Date.now()}`,
      method: "pix",
    });

    console.log(`\nPagamento simulado com sucesso!`);
    console.log(`Novo arrecadado: R$ ${(giftData.raised || 0) + amount}`);
    console.log(`\nO onSnapshot no frontend deve detectar a mudanca e mostrar o ThankYouSheet.`);
  } catch (error) {
    console.error("Erro:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

simulatePayment();
