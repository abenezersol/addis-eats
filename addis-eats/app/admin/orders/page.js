import Link from "next/link";
import { requireAdminPage } from "../../../lib/adminGuard";
import { getOrders } from "../../../lib/orders";
import { ORDER_STATUSES } from "../../../lib/orderStatus";
import { formatETB } from "../../../lib/dashboardData";
import AdminOrderActions from "../AdminOrderActions";

export const metadata = {
  title: "Manage orders",
  description: "See every customer order, move it through its stages, or delete it."
};

const PAGE_SIZE = 20;
const SORT_KEYS = ["date", "total", "status", "customer"];

function getHref({ filter, sort, dir, page }) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (sort !== "date") params.set("sort", sort);
  if (dir !== (sort === "date" ? "desc" : "asc")) params.set("dir", dir);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

function SortLink({ label, field, sort, dir, filter }) {
  const active = sort === field;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  const ariaSort = active ? (dir === "asc" ? "ascending" : "descending") : "none";
  return (
    <th scope="col" aria-sort={ariaSort}>
      <Link
        className="table-sort-link"
        href={getHref({ filter, sort: field, dir: nextDir, page: 1 })}
      >
        {label}{active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    </th>
  );
}

export default async function AdminOrdersPage({ searchParams }) {
  await requireAdminPage("/admin/orders");
  const params = await searchParams;
  const statusParam = typeof params?.status === "string" ? params.status : "all";
  const filter = statusParam === "all" || ORDER_STATUSES.includes(statusParam) ? statusParam : "all";
  const requestedSort = typeof params?.sort === "string" ? params.sort : "date";
  const sort = SORT_KEYS.includes(requestedSort) ? requestedSort : "date";
  const dir = params?.dir === "asc" ? "asc" : params?.dir === "desc" ? "desc" : sort === "date" ? "desc" : "asc";
  const requestedPage = Number(params?.page ?? 1);
  const safePage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const allOrders = getOrders().slice();
  const filteredOrders = filter === "all" ? allOrders : allOrders.filter((order) => order.status === filter);
  filteredOrders.sort((a, b) => {
    let result = 0;
    if (sort === "total") result = Number(a.total) - Number(b.total);
    else if (sort === "status") result = a.status.localeCompare(b.status);
    else if (sort === "customer") result = a.customerName.localeCompare(b.customerName);
    else result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (result === 0) result = a.id.localeCompare(b.id);
    return dir === "desc" ? -result : result;
  });

  const pages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const page = Math.min(safePage, pages);
  const orders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sortLabel = { date: "date", total: "total", status: "status", customer: "customer" }[sort];

  return (
    <main className="container page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN · ORDERS</span>
          <h1>Orders</h1>
          <p>Sort and page through order records. {filteredOrders.length} {filter === "all" ? "orders" : `${filter} orders`} found.</p>
        </div>
      </div>

      <nav className="categories" aria-label="Filter orders by status">
        <Link href={getHref({ filter: "all", sort, dir, page: 1 })} className={filter === "all" ? "chip active" : "chip"}>all</Link>
        {ORDER_STATUSES.map((value) => (
          <Link key={value} href={getHref({ filter: value, sort, dir, page: 1 })} className={filter === value ? "chip active" : "chip"}>
            {value}
          </Link>
        ))}
      </nav>

      {!filteredOrders.length ? (
        <div className="empty-state large">
          <div className="empty-icon" aria-hidden="true">📦</div>
          <h2>{filter === "all" ? "No orders yet" : `No ${filter} orders`}</h2>
          <p>{filter === "all" ? "Orders will appear here as customers place them." : "Try another status filter or return to all orders."}</p>
          {filter !== "all" ? <Link className="button secondary" href="/admin/orders">View all orders</Link> : <Link className="button secondary" href="/menu">Browse menu</Link>}
        </div>
      ) : (
        <>
          <p className="table-context">Page {page} of {pages} · Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} · Sorted by {sortLabel} ({dir === "asc" ? "ascending" : "descending"})</p>
          <div className="table-wrap">
            <table className="admin-table orders-data-table">
              <caption>Orders, filtered by status and sorted by {sortLabel} {dir === "asc" ? "ascending" : "descending"}</caption>
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <SortLink label="Customer" field="customer" sort={sort} dir={dir} filter={filter} />
                  <SortLink label="Status" field="status" sort={sort} dir={dir} filter={filter} />
                  <SortLink label="Placed" field="date" sort={sort} dir={dir} filter={filter} />
                  <SortLink label="Total (ETB)" field="total" sort={sort} dir={dir} filter={filter} />
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders/${order.id}`} className="text-link">{order.id}</Link></td>
                    <td><span>{order.customerName}</span><small className="table-subtext">{order.phone}</small></td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString("en-ET", { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td className="numeric-cell">{formatETB(order.total)}</td>
                    <td><div className="table-actions"><Link href={`/admin/orders/${order.id}`} className="text-link">Details</Link><AdminOrderActions orderId={order.id} status={order.status} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="pagination" aria-label="Order table pages">
            {page > 1 ? <Link className="button secondary" href={getHref({ filter, sort, dir, page: page - 1 })}>← Previous</Link> : <span className="button secondary is-disabled" aria-disabled="true">← Previous</span>}
            <span aria-current="page">Page {page} of {pages}</span>
            {page < pages ? <Link className="button secondary" href={getHref({ filter, sort, dir, page: page + 1 })}>Next →</Link> : <span className="button secondary is-disabled" aria-disabled="true">Next →</span>}
          </nav>
        </>
      )}
    </main>
  );
}
