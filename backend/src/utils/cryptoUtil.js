import crypto from "crypto";
const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;

const ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export const encryptMessage = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

export const decryptMessage = (encryptedText) => {
  if (!encryptedText.includes(":")) {
    return encryptedText;
  }
  const parts = encryptedText.split(":");
  const ivHex = parts.shift();
  if (ivHex.length !== IV_LENGTH * 2) {
    throw new Error("Invalid initialization vector length");
  }
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = parts.join(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
