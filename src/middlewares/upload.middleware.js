import multer from "multer";
import serverConfig from "../config/server.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const localUploadDir = path.join(__dirname, "../../public/images");
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

const storageA = multer.diskStorage({
  destination: function (req, file, cb) {
    if (serverConfig.NODE_ENV === "production" && fs.existsSync("/public/images")) {
      cb(null, "/public/images");
    } else {
      cb(null, localUploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const image = multer({
  storage: storageA,
  limits: { fileSize: 3 * 1024 * 1024 },
});

export default { image };
