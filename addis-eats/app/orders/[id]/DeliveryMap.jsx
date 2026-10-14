"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Area-level illustrative coordinates only. This is simulated movement, not courier GPS.
const AREA_COORDINATES = {
  bole: [8.995, 38.7896],
  "bole atlas": [8.9918, 38.7815],
  "bole medhanialem": [8.9972, 38.7871],
  piassa: [9.034, 38.7469],
  piasa: [9.034, 38.7469],
  kazanchis: [9.0178, 38.7665],
  kirkos: [9.01, 38.757],
  megenagna: [9.021, 38.805],
  "sar bet": [8.995, 38.723]
};

const ADDIS_CENTER = [8.995, 38.7896];
const DELIVERY_DURATION_MS = 10000;

const courierIcon = L.divIcon({
  className: "delivery-pin courier-pin",
  html: "<span>C</span>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const deliveryIcon = L.divIcon({
  className: "delivery-pin destination-pin",
  html: "<span>D</span>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export default function DeliveryMap({ deliveryArea, orderId, status = "pending" }) {
  const key = String(deliveryArea ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  const delivery = AREA_COORDINATES[key] ?? ADDIS_CENTER;

  // The simulated courier starts north-east of the delivery area.
  const start = [delivery[0] + 0.006, delivery[1] - 0.006];
  const [courier, setCourier] = useState(
    status === "delivered" ? delivery : start
  );
  const bounds = [start, delivery];

  useEffect(() => {
    if (status !== "delivering") {
      setCourier(status === "delivered" ? delivery : start);
      return undefined;
    }

    // Animate the marker along an illustrative route when status becomes "delivering".
    setCourier(start);
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / DELIVERY_DURATION_MS, 1);
      const easedProgress = progress * progress * (3 - 2 * progress);
      setCourier([
        start[0] + (delivery[0] - start[0]) * easedProgress,
        start[1] + (delivery[1] - start[1]) * easedProgress
      ]);

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [status, delivery[0], delivery[1], start[0], start[1]]);

  const isMoving = status === "delivering";

  return (
    <div
      className="delivery-map"
      aria-label={`Simulated delivery map for order ${orderId}`}
    >
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        style={{ height: "320px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline
          positions={bounds}
          pathOptions={{ color: "#d95f25", dashArray: "6 8" }}
        />
        <Marker position={courier} icon={courierIcon}>
          <Popup>
            {isMoving
              ? "Simulated courier movement — not live GPS"
              : status === "delivered"
                ? "Simulated courier reached the destination"
                : "Simulated courier starting point — not live GPS"}
          </Popup>
        </Marker>
        <Marker position={delivery} icon={deliveryIcon}>
          <Popup>Approximate delivery area: {deliveryArea || "Addis Ababa"}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
