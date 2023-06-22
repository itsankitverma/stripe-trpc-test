import { ServiceAccount } from "firebase-admin";
import { buffer } from "micro";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import admin from "../../../server/api/firebaseAdmin"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// const webhookSecret: string = "whsec_p3vTgJSDGc6KjOF40GBhWG36d7nNINxk";
const webhookSecret: string = "whsec_p3vTgJSDGc6KjOF40GBhWG36d7nNINxk";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    const serviceAccount = JSON.parse(
      process.env.ADMIN as string
    ) as ServiceAccount;

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    let db: any = admin.firestore();
    const users = db.collection(`stripePaidUsers`);

    if (!db) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      );

      console.log(`event.data.object :>> event: ${event.data.object}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      console.log(`checkout.session.completed`);
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const periodStartTimestamp = session.created;
      const periodEndTimestamp = subscription.current_period_end;

      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      const periodStartDate = new Date(periodStartTimestamp * 1000);
      const periodEndDate = new Date(periodEndTimestamp * 1000);

      const daysDifference = Math.round(
        (periodEndDate.getTime() - periodStartDate.getTime()) /
          millisecondsPerDay
      );

      console.log(`event.type :>> event: ${event.type}`);
      users.doc(session.client_reference_id).set({
        stripePeriodEnd: periodEndDate,
        stripePeriodStart: periodStartDate,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        stripePriceId: subscription.items.data[0].price.id,
        stripeMembershipStatus: daysDifference - 1 > 0 ? "Active" : "Inactive",
      });
    }

    res.json({ message: "Payment Accepted" });
  }
};
export default cors(webhookHandler as any);
