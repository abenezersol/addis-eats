"use client";

import { ordersToCsv } from "../../../lib/csv";

export default function ExportOrdersButton({ orders }) {
  function downloadCsv() {
    const csv = ordersToCsv(orders);
    // The UTF-8 BOM helps spreadsheet applications recognise the encoding.
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `addis-eats-order-history-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Delay revocation so the browser has time to begin the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <button type="button" className="button secondary" onClick={downloadCsv}>
      Export CSV
    </button>
  );
}
