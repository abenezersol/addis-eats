"use client";

import useSWR from "swr";
import { fetcher } from "../../../lib/fetcher";

export default function OrderStatusClient({ id, initial }) {
  const { data: order, error } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initial,
    refreshInterval: 5000,
    revalidateOnFocus: true
  });

  if (error) {
    return (
      <div className="error-state">
        <h2>Could not refresh this order</h2>
        <p>Your last known status is shown below.</p>
        <OrderCard order={initial} />
      </div>
    );
  }

  return (
    <div>
      <div className="live-status">
        <span className={`status ${order.status}`}>{order.status}</span>
        <span>Live updates every 5 seconds</span>
      </div>
      <OrderCard order={order} />
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-head">
        <div>
          <span className={`status ${order.status}`}>{order.status}</span>
          <h2>Order {order.id}</h2>
          <small>{new Date(order.createdAt).toLocaleString()}</small>
        </div>
        <strong>{order.total.toLocaleString()} ETB</strong>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id}>
            <span>{item.quantity} × {item.name}</span>
            <strong>{(item.price * item.quantity).toLocaleString()} ETB</strong>
          </div>
        ))}
      </div>
      <div className="order-foot">
        <span>Deliver to {order.deliveryArea}</span>
      </div>
    </article>
  );
}
