"use client";

import { useEffect, useMemo, useState } from "react";
import swal from "sweetalert";
import {
  CiCirclePlus,
  CiEdit,
  CiTrash,
  CiSearch,
  CiCircleCheck,
  CiCircleRemove,
  CiGrid41,
  CiBoxes,
} from "react-icons/ci";

const initialForm = { title: "", code: "", isActive: true };

function normalizeCode(v = "") {
  return String(v).trim().toUpperCase();
}

function formatFaDate(date) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("fa-IR");
  } catch {
    return "-";
  }
}

function InputField({ label, value, onChange, placeholder, dir = "rtl" }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/90">{label}</label>
      <input
        dir={dir}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:border-primary/80 focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

export default function ReferenceCrudPage({
  title,
  endpoint, // مثال: /api/admin/grades
  codeLabel = "کد",
  titleLabel = "عنوان",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const modalTitle = useMemo(() => {
    return editingItem ? `ویرایش ${title}` : `افزودن ${title}`;
  }, [editingItem, title]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const t = String(item?.title || "").toLowerCase();
      const c = String(item?.code || "").toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [items, search]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      setItems(list);
    } catch (err) {
      console.error(err);
      swal({ title: "خطا در دریافت اطلاعات", icon: "error", buttons: "باشه" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, saving]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item?.title || "",
      code: item?.code || "",
      isActive: item?.isActive ?? true,
    });
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setEditingItem(null);
    setForm(initialForm);
  };

  const submitHandler = async (e) => {
    e?.preventDefault?.();

    if (!form.title.trim()) {
      return swal({ title: `${titleLabel} الزامی است`, icon: "error", buttons: "باشه" });
    }

    if (!form.code.trim()) {
      return swal({ title: `${codeLabel} الزامی است`, icon: "error", buttons: "باشه" });
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        code: normalizeCode(form.code),
        isActive: !!form.isActive,
      };

      const isEdit = !!editingItem?._id;
      const url = isEdit ? `${endpoint}/${editingItem._id}` : endpoint;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return swal({
          title: data?.message || "خطا در ذخیره اطلاعات",
          icon: "error",
          buttons: "باشه",
        });
      }

      swal({
        title: isEdit ? "ویرایش با موفقیت انجام شد" : "آیتم با موفقیت اضافه شد",
        icon: "success",
        buttons: "باشه",
      });

      closeModal();
      await fetchItems();
    } catch (err) {
      console.error(err);
      swal({ title: "خطای سرور", icon: "error", buttons: "باشه" });
    } finally {
      setSaving(false);
    }
  };

  const deleteHandler = async (item) => {
    const ok = await swal({
      title: `حذف "${item.title}" ؟`,
      text: "این عملیات قابل بازگشت نیست",
      icon: "warning",
      buttons: ["نه", "بله حذف شود"],
      dangerMode: true,
    });

    if (!ok) return;

    try {
      const res = await fetch(`${endpoint}/${item._id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return swal({
          title: data?.message || "خطا در حذف آیتم",
          icon: "error",
          buttons: "باشه",
        });
      }

      swal({ title: "حذف شد", icon: "success", buttons: "باشه" });
      await fetchItems();
    } catch (err) {
      console.error(err);
      swal({ title: "خطای سرور", icon: "error", buttons: "باشه" });
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Glass Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90">
              <CiGrid41 size={16} />
              مرجع‌ها
            </div>
            <h1 className="text-lg font-bold text-white md:text-xl">{title}</h1>
            <p className="mt-1 text-sm text-white/70">
              مدیریت {title} (افزودن، ویرایش، حذف)
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-primary/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
          >
            <CiCirclePlus size={20} />
            <span>افزودن {title}</span>
          </button>
        </div>
      </div>

      {/* Glass Toolbar */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <CiSearch
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`جستجو در ${titleLabel} و ${codeLabel}`}
              className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pr-10 pl-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:border-primary/80 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="text-xs text-white/70">
            تعداد کل: <span className="font-semibold text-white">{items.length}</span>
            <span className="mx-1">|</span>
            نمایش: <span className="font-semibold text-white">{filteredItems.length}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl md:block">
        {loading ? (
          <div className="p-6 text-sm text-white/70">در حال دریافت اطلاعات...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-white/70">
            آیتمی برای نمایش پیدا نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-white/5">
                <tr className="text-right text-white/85">
                  <th className="px-3 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">{titleLabel}</th>
                  <th className="px-3 py-3 font-semibold">{codeLabel}</th>
                  <th className="px-3 py-3 font-semibold">وضعیت</th>
                  <th className="px-3 py-3 font-semibold">تاریخ ایجاد</th>
                  <th className="px-3 py-3 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="border-t border-white/10 transition hover:bg-white/5"
                  >
                    <td className="px-3 py-3 text-white/80">{idx + 1}</td>
                    <td className="px-3 py-3 font-medium text-white">
                      {item.title || "-"}
                    </td>
                    <td className="px-3 py-3 font-mono text-white/80">{item.code || "-"}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.isActive
                            ? "border border-green-300/30 bg-green-400/15 text-green-200"
                            : "border border-white/20 bg-white/10 text-white/70"
                        }`}
                      >
                        {item.isActive ? <CiCircleCheck size={16} /> : <CiCircleRemove size={16} />}
                        {item.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white/70">{formatFaDate(item.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/60 bg-primary/10 px-3 py-1.5 text-white transition hover:bg-primary/20"
                        >
                          <CiEdit size={16} />
                          ویرایش
                        </button>
                        <button
                          onClick={() => deleteHandler(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-300/40 bg-red-400/10 px-3 py-1.5 text-red-100 transition hover:bg-red-400/20"
                        >
                          <CiTrash size={16} />
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/70 shadow-xl backdrop-blur-xl">
            در حال دریافت اطلاعات...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-xl backdrop-blur-xl">
            <p className="text-white/70">آیتمی برای نمایش پیدا نشد.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item._id}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                    <CiBoxes size={13} />
                    ردیف {idx + 1}
                  </div>
                  <p className="truncate text-base font-semibold text-white">{item.title || "-"}</p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.isActive
                      ? "border border-green-300/30 bg-green-400/15 text-green-200"
                      : "border border-white/20 bg-white/10 text-white/70"
                  }`}
                >
                  {item.isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="text-xs text-white/60">{codeLabel}</p>
                  <p className="mt-0.5 font-mono text-white/90">{item.code || "-"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="text-xs text-white/60">تاریخ ایجاد</p>
                  <p className="mt-0.5 text-white/90">{formatFaDate(item.createdAt)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 rounded-xl border border-primary/60 bg-primary/10 px-3 py-2 text-sm text-white transition hover:bg-primary/20"
                >
                  ویرایش
                </button>
                <button
                  onClick={() => deleteHandler(item)}
                  className="flex-1 rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-2 text-sm text-red-100 transition hover:bg-red-400/20"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Glass Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div
              className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
              style={{ maxHeight: "calc(100dvh - 16px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="sticky top-0 z-10 border-b border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white md:text-lg">{modalTitle}</h2>
                    <p className="mt-1 text-xs text-white/60">
                      اطلاعات را وارد کرده و ذخیره کنید.
                    </p>
                  </div>

                  <button
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    بستن
                  </button>
                </div>
              </div>

              {/* body scrollable */}
              <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <InputField
                    label={titleLabel}
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder={`${titleLabel} را وارد کنید`}
                  />

                  <InputField
                    label={codeLabel}
                    value={form.code}
                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder={`${codeLabel} را وارد کنید`}
                    dir="ltr"
                  />

                  <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, isActive: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-white/30 bg-transparent text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-white/90">فعال باشد</span>
                    </label>
                  </div>
                </div>

                {/* footer actions */}
                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 sm:w-auto"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl border border-primary/40 bg-primary/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}