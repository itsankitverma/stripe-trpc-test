import Stripe from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(
  "sk_test_51NAdoFSHuHuSftrQxoIY88VZgLJDWTsA37apV8XsHxoDCOFJmcGmQgCqWEJXJrQAq5NcRzIiUzBJuNN2DbKeSXZ500BIsKEigF",
  {
    apiVersion: "2022-11-15",
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: "price_1NLNnrSHuHuSftrQCqZ0lPnZ",
            quantity: 1,
          },
        ],
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
      });

      res.status(200).json(session);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      res.status(400).send(`Webhook Error: ${errorMessage}`);
      res.status(500).json({ statusCode: 500, message: errorMessage });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
