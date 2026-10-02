import CryptoJS from "crypto-js";

export const encrypt = (Data: string) => {
  return CryptoJS.AES.encrypt(
    Data,
    process.env.SECRET_KEY as string
  ).toString();
};

export const decrypt = (encryptedData: string) => {
  if (!encryptedData) {
    return encryptedData;
  }
  const bytes = CryptoJS.AES.decrypt(
    encryptedData,
    process.env.SECRET_KEY as string
  );

  return bytes.toString(CryptoJS.enc.Utf8);
};