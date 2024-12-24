import { config } from "dotenv";

config();
   


class ServerConfig {
   NODE_ENV = process.env.NODE_ENV;
   PORT = process.env.PORT;
   DOMAIN = process.env.DOMAIN; 
   MONNIFY_CLIENT_SECRET  = process.env.MONNIFY_CLIENT_SECRET;
   MONNIFY_IP = process.env.MONNIFY_IP;
   MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL;
   MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
   MONNIFY_ACC = process.env.MONNIFY_ACC;

     


   DB_USERNAME = process.env.DB_USERNAME;
   DB_PASSWORD = process.env.DB_PASSWORD;
   DB_HOST = process.env.DB_HOST;
   DB_PORT = process.env.DB_PORT;
   DB_NAME = process.env.DB_NAME;
   DB_URI = process.env.DB_URI;

   EMAIL_HOST = process.env.EMAIL_HOST;
   EMAIL_PORT = process.env.EMAIL_PORT;
   EMAIL_USER = process.env.EMAIL_USER;
   EMAIL_PASS = process.env.EMAIL_PASS;
   EMAIL_SENDER = process.env.EMAIL_SENDER;


   TOKEN_SECRET=process.env.TOKEN_SECRET;
   TOKEN_ISSUER=process.env.TOKEN_ISSUER;
   TOKEN_EXPIRES_IN=process.env.TOKEN_EXPIRES_IN;


   FIREBASE_TYPE=process.env.FIREBASE_TYPE
   FIREBASE_PROJECT_ID=process.env.FIREBASE_PROJECT_ID
   FIREBASE_PRIVATE_KEY_ID=process.env.FIREBASE_PRIVATE_KEY_ID
   FIREBASE_PRIVATE_KEY=process.env.FIREBASE_PRIVATE_KEY
   FIREBASE_CLIENT_EMAIL=process.env.FIREBASE_CLIENT_EMAIL
   FIREBASE_CLIENT_ID=process.env.FIREBASE_CLIENT_ID
   FIREBASE_AUTH_URI=process.env.FIREBASE_AUTH_URI
   FIREBASE_TOKEN_URI=process.env.FIREBASE_TOKEN_URI
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL
   FIREBASE_CLIENT_X509_CERT_URL=process.env.FIREBASE_CLIENT_X509_CERT_URL
   FIREBASE_UNIVERSAL_DOMAIN=process.env.FIREBASE_UNIVERSAL_DOMAIN



   
   SMS_USER_NAME=process.env.SMS_USER_NAME;
   SMS_PASSWORD=process.env.SMS_PASSWORD;
}

export default new ServerConfig();
