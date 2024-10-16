import * as jose from 'jose';

// Public key for encryption (This should be provided by your backend)
const PUBLIC_KEY = process.env.PUBLIC_KEY as string;

// Private key for decryption (This should be kept secret and only used by the backend)
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;

export async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();

  // Import the public key
  const publicKey = await jose.importSPKI(PUBLIC_KEY, 'RSA-OAEP-256');

  // Encrypt the data
  const jwe = await new jose.CompactEncrypt(encoder.encode(text))
    .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
    .encrypt(publicKey);

  return jwe;
}

export async function decrypt(jwe: string): Promise<string> {
  // Import the private key
  const privateKey = await jose.importPKCS8(PRIVATE_KEY, 'RSA-OAEP-256');

  // Decrypt the data
  const { plaintext } = await jose.compactDecrypt(jwe, privateKey);

  return new TextDecoder().decode(plaintext);
}