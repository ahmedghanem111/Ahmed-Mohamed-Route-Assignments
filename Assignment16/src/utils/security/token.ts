import jwt from "jsonwebtoken";

export const generateToken = (payload: string | object, secretKey: jwt.Secret, options: jwt.SignOptions = {}) => {
    const token = jwt.sign(payload, secretKey, options);
    return token;
};

export const verifyToken = (token: string, secretKey: jwt.Secret, options: jwt.VerifyOptions = {}) =>{
  const payload = jwt.verify(token, secretKey, options);  
  return payload;
} 