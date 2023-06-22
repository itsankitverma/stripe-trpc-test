import { useSession } from "next-auth/react";
import React from "react";
import getStripe from "~/lib/helper";

async function fetchPostJSON(url: string, data?: {}) {
  try {
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

const ProductCard = () => {
  const { data: sessionData } = useSession();

  const handleOnAddToCart = async (event: any) => {
    event.preventDefault();

    const response = await fetchPostJSON("/api/checkout_sessions", {
      client_reference_id: sessionData?.user.email,
    });

    if (response.statusCode === 500) {
      console.error(response.message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: response.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };
  return (
    <div>
      <button
        onClick={handleOnAddToCart}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        // onClick={handleMutate}
      >
        Add to cart
      </button>
    </div>
  );
};

export default ProductCard;
