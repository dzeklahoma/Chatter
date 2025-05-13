import CryptoJS from 'crypto-js';

// Generate a key pair for a user
export const generateKeyPair = (): { publicKey: string; privateKey: string } => {
  // In a real app, this would use proper asymmetric encryption
  // This is a simplified example using symmetric encryption
  const randomKey = CryptoJS.lib.WordArray.random(16).toString();
  const publicKey = CryptoJS.SHA256(randomKey).toString();
  const privateKey = randomKey;
  
  return { publicKey, privateKey };
};

// Store private key securely (in memory for demo, in a real app use better storage)
export const storePrivateKey = (privateKey: string): void => {
  sessionStorage.setItem('privateKey', privateKey);
};

// Get the stored private key
export const getPrivateKey = (): string => {
  return sessionStorage.getItem('privateKey') || '';
};

// Encrypt a message
export const encryptMessage = (message: string, publicKey: string): string => {
  return CryptoJS.AES.encrypt(message, publicKey).toString();
};

// Decrypt a message
export const decryptMessage = (encryptedMessage: string, privateKey: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, privateKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    return '[Encrypted message]';
  }
};