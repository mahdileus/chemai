"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CiSearch, CiEdit, CiTrash, CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import swal from "sweetalert";

export default function ProductsTable() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(""); // "", "true", "false"

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));

    if (q.trim()) params.set("q", q.trim());
    if (isActiveFilter) params.set("isActive", isActiveFilter);

    return params.toString();
  }, [pagination.page, pagination.limit, q, isActiveFilter]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/products?${queryString}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "خطا در دریافت محصولات");

      setItems(Array.isArray(data?.items) ? data.items : []);
      setPagination((prev) => ({
        ...prev,
        ...(data?.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || "خطا در دریافت محصولات");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setQ(searchInput);
  }

  async function handleSoftDelete(productId) {
    const ok = await swal({
      title: "این محصول غیرفعال شود؟",
      text: "این عملیات به صورت حذف نرم انجام می‌شود.",
      icon: "warning",
      buttons: ["نه", "بله، غیرفعال شود"],
      dangerMode: true,
    });

    if (!ok) return;

    try {
      setDeletingId(productId);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در حذف محصول");

      // پیام موفقیت با swal
      await swal({
        title: "انجام شد",
        text: data?.message || "محصول با موفقیت غیرفعال شد.",
        icon: "success",
        buttons: "باشه",
      });

      // اگر هنوز می‌خوای alert بالا هم نمایش داده بشه، اینو نگه دار:
      setSuccess(data?.message || "محصول غیرفعال شد.");

      // آپدیت UI
      setItems((prev) =>
        prev.map((item) =>
          item._id === productId ? { ...item, isActive: false } : item
        )
      );
    } catch (err) {
      const msg = err.message || "خطا در حذف محصول";
      setError(msg);

      await swal({
        title: "خطا",
        text: msg,
        icon: "error",
        buttons: "باشه",
      });
    } finally {
      setDeletingId("");
    }
  }

  function goToPage(page) {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
      {/* alerts */}
      {error ? (
        <div className="rounded-xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-green-300/30 bg-green-400/10 px-3 py-2 text-sm text-green-100">
          {success}
        </div>
      ) : null}

      {/* filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <CiSearch
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/55"
                size={18}
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجو در عنوان، اسلاگ، CAS، HS..."
                className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pr-10 pl-3 text-white placeholder:text-white/45 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              className="whitespace-nowrap rounded-xl border border-primary/40 bg-primary/90 px-4 py-2 text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
            >
              جستجو
            </button>
          </form>

          <div className="w-full lg:w-56">
            <label className="mb-1 block text-sm text-white/85">وضعیت</label>
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                setIsActiveFilter(e.target.value);
              }}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
            >
              <option value="" className="text-black">
                همه
              </option>
              <option value="true" className="text-black">
                فقط فعال
              </option>
              <option value="false" className="text-black">
                فقط غیرفعال
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-white/5">
              <tr className="text-right text-white/85">
                <th className="border-b border-white/10 px-3 py-3">تصویر</th>
                <th className="border-b border-white/10 px-3 py-3">عنوان</th>
                <th className="border-b border-white/10 px-3 py-3">دسته‌بندی</th>
                <th className="border-b border-white/10 px-3 py-3">فیلترها</th>
                <th className="border-b border-white/10 px-3 py-3">CAS / HS</th>
                <th className="border-b border-white/10 px-3 py-3">وضعیت</th>
                <th className="border-b border-white/10 px-3 py-3">تاریخ</th>
                <th className="border-b border-white/10 px-3 py-3">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-white/60">
                    در حال دریافت...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-white/60">
                    محصولی پیدا نشد.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const catTitle = item?.category?.title || "-";
                  const pharm = item?.pharmacopeia?.title || item?.pharmacopeia?.name || "-";
                  const grade = item?.grade?.title || item?.grade?.name || "-";
                  const form = item?.form?.title || item?.form?.name || "-";

                  return (
                    <tr key={item._id} className="align-top transition hover:bg-white/5">
                      <td className="border-b border-white/10 px-3 py-3">
                        {item.featuredImage ? (
                          <div className="h-14 w-14 overflow-hidden rounded-lg border border-white/20 bg-white/5">
                            <img
                              src={item.featuredImage}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/40">
                            ندارد
                          </div>
                        )}
                      </td>

                      <td className="border-b border-white/10 px-3 py-3">
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="mt-1 text-xs text-white/50">{item.slug}</div>
                      </td>

                      <td className="border-b border-white/10 px-3 py-3 text-white/85">
                        <div>{catTitle}</div>
                      </td>

                      <td className="border-b border-white/10 px-3 py-3">
                        <div className="space-y-1 text-xs text-white/75">
                          <div>فارماکوپه: {pharm}</div>
                          <div>گرید: {grade}</div>
                          <div>فرم: {form}</div>
                        </div>
                      </td>

                      <td className="border-b border-white/10 px-3 py-3">
                        <div className="space-y-1 text-xs text-white/75">
                          <div>CAS: {item.casNumber || "-"}</div>
                          <div>HS: {item.hsCode || "-"}</div>
                        </div>
                      </td>

                      <td className="border-b border-white/10 px-3 py-3">
                        {item.isActive ? (
                          <span className="inline-flex items-center rounded-full border border-green-300/30 bg-green-400/15 px-2 py-1 text-xs text-green-200">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/70">
                            غیرفعال
                          </span>
                        )}
                      </td>

                      <td className="border-b border-white/10 px-3 py-3 text-xs text-white/55">
                        {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                      </td>

                      <td className="border-b border-white/10 px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/p-admin/products/${item._id}/edit`}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-center text-white transition hover:bg-primary/20"
                          >
                            <CiEdit size={16} />
                            ویرایش
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleSoftDelete(item._id)}
                            disabled={deletingId === item._id || !item.isActive}
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-300/30 bg-red-400/10 px-3 py-1.5 text-red-100 transition hover:bg-red-400/20 disabled:opacity-50"
                          >
                            <CiTrash size={16} />
                            {deletingId === item._id ? "..." : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
            در حال دریافت...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
            محصولی پیدا نشد.
          </div>
        ) : (
          items.map((item) => {
            const catTitle = item?.category?.title || "-";
            const pharm = item?.pharmacopeia?.title || item?.pharmacopeia?.name || "-";
            const grade = item?.grade?.title || item?.grade?.name || "-";
            const form = item?.form?.title || item?.form?.name || "-";

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg"
              >
                <div className="mb-3 flex items-start gap-3">
                  {item.featuredImage ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/5">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/40">
                      ندارد
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{item.title}</p>
                    <p className="mt-1 truncate text-xs text-white/50">{item.slug}</p>

                    <div className="mt-2">
                      {item.isActive ? (
                        <span className="inline-flex items-center rounded-full border border-green-300/30 bg-green-400/15 px-2 py-1 text-xs text-green-200">
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/70">
                          غیرفعال
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">دسته‌بندی</p>
                    <p className="mt-1 text-white/85">{catTitle}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">تاریخ</p>
                    <p className="mt-1 text-white/85">
                      {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">CAS / HS</p>
                    <p className="mt-1 text-white/85">CAS: {item.casNumber || "-"}</p>
                    <p className="text-white/70">HS: {item.hsCode || "-"}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                    <p className="text-white/50">فیلترها</p>
                    <p className="mt-1 text-white/85">فارماکوپه: {pharm}</p>
                    <p className="text-white/70">گرید: {grade}</p>
                    <p className="text-white/70">فرم: {form}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/p-admin/products/${item._id}/edit`}
                    className="flex-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-center text-sm text-white transition hover:bg-primary/20"
                  >
                    ویرایش
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSoftDelete(item._id)}
                    disabled={deletingId === item._id || !item.isActive}
                    className="flex-1 rounded-xl border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-100 transition hover:bg-red-400/20 disabled:opacity-50"
                  >
                    {deletingId === item._id ? "..." : "حذف"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* pagination */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm md:flex-row md:items-center md:justify-between">
        <div className="text-white/70">
          مجموع: <span className="font-semibold text-white">{pagination.total ?? 0}</span>
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-end">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <CiCircleChevRight size={18} />
            قبلی
          </button>

          <span className="text-white/80">
            صفحه <span className="font-semibold">{pagination.page}</span> از{" "}
            <span className="font-semibold">{pagination.totalPages || 1}</span>
          </span>

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= (pagination.totalPages || 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            بعدی
            <CiCircleChevLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}