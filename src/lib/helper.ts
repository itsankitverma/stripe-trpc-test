import { loadStripe } from "@stripe/stripe-js";
import Stripe from "stripe";

let stripePromise: any;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      "pk_test_51NAdoFSHuHuSftrQu0L3oWQTCIDMlftWbhtkVyrV2jxNH3RxyvBllxPmXvS8f3pzsWMS6jt5ROIBylaCKmP1dEUe00IxcbahZV"
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return stripePromise;
};

export default getStripe;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2022-11-15",
});
