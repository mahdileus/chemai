"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatStatus(status) {
    const map = {
        DRAFT: "پیش‌نویس",
        ACTIVE: "فعال",
        PAUSED: "متوقف",
        SOLD_OUT: "اتمام موجودی",
        ARCHIVED: "آرشیو",
    };
    return map[status] || status || "-";
}

function statusBadgeClass(status) {
    switch (status) {
        case "ACTIVE":
            return "bg-green-100 text-green-700";
        case "DRAFT":
            return "bg-yellow-100 text-yellow-700";
        case "PAUSED":
            return "bg-blue-100 text-blue-700";
        case "SOLD_OUT":
            return "bg-orange-100 text-orange-700";
        case "ARCHIVED":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

function variantSummary(v) {
    if (!v) return "-";
    const parts = [
        v?.pharmacopeia?.title || v?.pharmacopeia?.name,
        v?.grade?.title || v?.grade?.name,
        v?.form?.title || v?.form?.name,
    ].filter(Boolean);
    return parts.length ? parts.join(" | ") : "بدون مشخصات";
}

export default function MyListingsTable() {
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [searchInput, setSearchInput] = useState("");
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");

    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(pagination.page));
        params.set("limit", String(pagination.limit));
        if (q.trim()) params.set("q", q.trim());
        if (status) params.set("status", status);
        return params.toString();
    }, [pagination.page, pagination.limit, q, status]);

    useEffect(() => {
        fetchListings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryString]);

    async function fetchListings() {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`/api/users/listings?${queryString}`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "خطا در دریافت آگهی‌ها");

            setItems(Array.isArray(data?.items) ? data.items : []);
            setPagination((prev) => ({ ...prev, ...(data?.pagination || {}) }));
        } catch (err) {
            setError(err.message || "خطا در دریافت آگهی‌ها");
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        setPagination((prev) => ({ ...prev, page: 1 }));
        setQ(searchInput);
    }

    async function archiveListing(id) {
        const ok = window.confirm("آگهی آرشیو شود؟");
        if (!ok) return;

        try {
            setBusyId(id);
            setError("");
            setSuccess("");

            const res = await fetch(`/api/users/listings/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "خطا در آرشیو آگهی");

            setSuccess(data?.message || "آگهی آرشیو شد.");

            setItems((prev) =>
                prev.map((item) => (item._id === id ? { ...item, status: "ARCHIVED" } : item))
            );
        } catch (err) {
            setError(err.message || "خطا در آرشیو آگهی");
        } finally {
            setBusyId("");
        }
    }

    async function quickChangeStatus(id, nextStatus) {
        try {
            setBusyId(id);
            setError("");
            setSuccess("");

            const res = await fetch(`/api/users/listings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "خطا در تغییر وضعیت");

            setSuccess(data?.message || "وضعیت آگهی تغییر کرد.");

            setItems((prev) =>
                prev.map((item) =>
                    item._id === id ? { ...item, status: data?.listing?.status || nextStatus } : item
                )
            );
        } catch (err) {
            setError(err.message || "خطا در تغییر وضعیت");
        } finally {
            setBusyId("");
        }
    }

    function goToPage(page) {
        if (page < 1 || page > (pagination.totalPages || 1)) return;
        setPagination((prev) => ({ ...prev, page }));
    }

    return (
        <div className="bg-white border rounded-2xl p-4 space-y-4">
            {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
                    {success}
                </div>
            ) : null}

            {/* filters */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="جستجو در یادداشت/توضیحات"
                        className="w-full border rounded-xl px-3 py-2"
                    />
                    <button className="px-4 py-2 rounded-xl border bg-black text-white">جستجو</button>
                </form>

                <div className="w-full lg:w-56">
                    <label className="block mb-1 text-sm">وضعیت</label>
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="w-full border rounded-xl px-3 py-2 bg-white"
                    >
                        <option value="">همه</option>
                        <option value="DRAFT">پیش‌نویس</option>
                        <option value="ACTIVE">فعال</option>
                        <option value="PAUSED">متوقف</option>
                        <option value="SOLD_OUT">اتمام موجودی</option>
                        <option value="ARCHIVED">آرشیو</option>
                    </select>
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full min-w-[1100px] text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-right">
                            <th className="px-3 py-3 border-b">محصول</th>
                            <th className="px-3 py-3 border-b">واریانت</th>
                            <th className="px-3 py-3 border-b">بسته‌بندی</th>
                            <th className="px-3 py-3 border-b">قیمت</th>
                            <th className="px-3 py-3 border-b">وضعیت</th>
                            <th className="px-3 py-3 border-b">موجودی لات‌ها</th>
                            <th className="px-3 py-3 border-b">تاریخ</th>
                            <th className="px-3 py-3 border-b">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                    در حال دریافت...
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                    آگهی‌ای پیدا نشد.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const totalQty = Array.isArray(item.lots)
                                    ? item.lots.reduce((sum, lot) => sum + (Number(lot?.availableQty || 0) || 0), 0)
                                    : 0;

                                return (
                                    <tr key={item._id} className="align-top">
                                        <td className="px-3 py-3 border-b">
                                            <div className="flex items-start gap-2">
                                                {item?.product?.featuredImage ? (
                                                    <img
                                                        src={item.product.featuredImage}
                                                        alt={item?.product?.title || "product"}
                                                        className="w-12 h-12 rounded-lg object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg border bg-gray-50" />
                                                )}

                                                <div>
                                                    <div className="font-medium">{item?.product?.title || "-"}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item?.product?.slug || "-"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 border-b text-xs">
                                            {variantSummary(item.variant)}
                                        </td>

                                        <td className="px-3 py-3 border-b text-xs">
                                            <div>
                                                {item?.packaging?.type?.title || "-"}{" "}
                                                {item?.packaging?.type?.code ? `(${item.packaging.type.code})` : ""}
                                            </div>
                                            <div className="text-gray-500 mt-1">
                                                {item?.packaging?.amountPerPack || 0} {item?.packaging?.unit || ""}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 border-b text-xs">
                                            <div>{Number(item.price || 0).toLocaleString("fa-IR")}</div>
                                            <div className="text-gray-500 mt-1">
                                                {item.currency || "IRR"} / {item.priceUnit || "-"}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 border-b">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusBadgeClass(
                                                    item.status
                                                )}`}
                                            >
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 border-b text-xs">
                                            <div>{totalQty.toLocaleString("fa-IR")}</div>
                                            <div className="text-gray-500 mt-1">
                                                {item?.lots?.[0]?.qtyUnit || item?.packaging?.unit || ""}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3 border-b text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                                        </td>

                                        <td className="px-3 py-3 border-b">
                                            <div className="flex flex-col gap-2">
                                                {/* صفحه ویرایش را بعدی می‌بندیم */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        quickChangeStatus(
                                                            item._id,
                                                            item.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
                                                        )
                                                    }
                                                    disabled={busyId === item._id || item.status === "ARCHIVED"}
                                                    className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-50"
                                                >
                                                    {busyId === item._id
                                                        ? "..."
                                                        : item.status === "ACTIVE"
                                                            ? "توقف"
                                                            : "فعال‌سازی"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => archiveListing(item._id)}
                                                    disabled={busyId === item._id || item.status === "ARCHIVED"}
                                                    className="px-3 py-1.5 rounded-lg border text-xs text-red-600 disabled:opacity-50"
                                                >
                                                    آرشیو
                                                </button>

                                                <Link
                                                    href={`/p-users/listings/${item._id}`}
                                                    className="px-3 py-1.5 rounded-lg border text-xs text-center"
                                                >
                                                    ویرایش
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between gap-2 text-sm">
                <div className="text-gray-600">مجموع: {pagination.total ?? 0}</div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToPage((pagination.page || 1) - 1)}
                        disabled={(pagination.page || 1) <= 1}
                        className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
                    >
                        قبلی
                    </button>

                    <span>
                        صفحه {pagination.page || 1} از {pagination.totalPages || 1}
                    </span>

                    <button
                        onClick={() => goToPage((pagination.page || 1) + 1)}
                        disabled={(pagination.page || 1) >= (pagination.totalPages || 1)}
                        className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
                    >
                        بعدی
                    </button>
                </div>
            </div>
        </div>
    );
}