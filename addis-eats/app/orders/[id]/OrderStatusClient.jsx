"use client";

import { useEffect, useState } from "react";
import { etb, when, formatRelativeTime } from "../../../lib/format";
import MapPanel from "./MapPanel";

const isTerminalStatus = (value) => value === "delivered" || value === "cancelled";

export default function OrderStatusClient({ id, initial }) {
  const [status, setStatus] = useState(initial.status);
  const [connection, setConnection] = useState(
    isTerminalStatus(initial.status) ? "complete" : "connecting"
  );
  const [lastUpdate, setLastUpdate] = useState(initial.updatedAt || initial.createdAt);

  useEffect(() => {
    if (isTerminalStatus(initial.status)) return undefined;

    const source = new EventSource(`/api/orders/${encodeURIComponent(id)}/stream`);
    let fallbackTimer;
    let stopped = false;

    const stopFallback = () => {
      if (fallbackTimer !== undefined) {
        window.clearInterval(fallbackTimer);
        fallbackTimer = undefined;
      }
    };

    const applyUpdate = (update) => {
      if (!update || update.id !== id || typeof update.status !== "string") return;

      setStatus(update.status);
      setLastUpdate(update.updatedAt || new Date().toISOString());

      if (isTerminalStatus(update.status)) {
        stopped = true;
        source.close();
        stopFallback();
        setConnection("complete");
      }
    };

    const pollOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });

        if (!response.ok) throw new Error("Unable to refresh order status");
        applyUpdate(await response.json());
      } catch {
        if (!stopped) setConnection("reconnecting");
      }
    };

    const startFallback = () => {
      if (fallbackTimer !== undefined || stopped) return;
      setConnection("reconnecting");
      void pollOrder();
      fallbackTimer = window.setInterval(() => {
        void pollOrder();
      }, 5000);
    };

    source.onopen = () => {
      stopFallback();
      if (!stopped) setConnection("live");
    };

    source.onmessage = (event) => {
      try {
        applyUpdate(JSON.parse(event.data));
        if (!stopped) setConnection("live");
      } catch {
        setConnection("reconnecting");
      }
    };

    source.onerror = () => {
      startFallback();
    };

    return () => {
      stopped = true;
      stopFallback();
      source.close();
    };
  }, [id, initial.status]);

  const connectionLabel = {
    connecting: "Connecting to live updates…",
    live: "Live updates connected",
    reconnecting: "Connection interrupted — checking order status…",
    complete: "Order tracking complete"
  }[connection];

  return (
    <div>
      <div className="live-status" aria-live="polite">
        <span className={`status ${status}`}>{status}</span>
        <span className={`connection-indicator ${connection}`}>
          <span aria-hidden="true">●</span> {connectionLabel}
        </span>
        <small>Updated {formatRelativeTime(lastUpdate)}</small>
      </div>
      <section className="tracking-section" aria-labelledby="tracking-map-heading">
        <div className="section-heading compact-heading">
          <div>
            <span className="eyebrow">DELIVERY LOCATION</span>
            <h2 id="tracking-map-heading">Delivery map</h2>
          </div>
        </div>
        <p className="map-disclaimer">
          The courier marker moves along an illustrative route when the status changes to “delivering”. This is simulated movement, not live GPS tracking.
        </p>
        <MapPanel deliveryArea={initial.deliveryArea} orderId={id} status={status} />
        <p className="map-text-address">
          <strong>Delivery area:</strong> {initial.deliveryArea || "Not provided"}. Use this text address if you cannot use the map.
        </p>
      </section>
      <OrderCard order={{ ...initial, status }} />
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
          <small>{when.format(new Date(order.createdAt))}</small>
        </div>
        <strong>{etb.format(order.total)}</strong>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div key={item.id}>
            <span>
              {item.quantity} × {item.name}
            </span>
            <strong>{etb.format(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>
      <div className="order-foot">
        <span>Deliver to {order.deliveryArea}</span>
      </div>
    </article>
  );
}
