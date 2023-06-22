import * as admin from "firebase-admin";
import { type ServiceAccount } from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.ADMIN as string
) as ServiceAccount;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
