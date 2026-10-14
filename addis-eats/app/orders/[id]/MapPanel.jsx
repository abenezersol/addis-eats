"use client";

import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => <div className="delivery-map-placeholder" role="status">Loading delivery map…</div>
});

export default function MapPanel({ deliveryArea, orderId, status }) {
  return (
    <DeliveryMap
      deliveryArea={deliveryArea}
      orderId={orderId}
      status={status}
    />
  );
}
