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
  CiFolderOn,
  CiGrid41,
} from "react-icons/ci";

const initialForm = {
  title: "",
  slug: "",
  parent: "",
  sortOrder: 0,
  isActive: true,
};

function slugifyFa(text = "") {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");
}

function buildTree(items = []) {
  const byId = new Map(items.map((i) => [String(i._id), { ...i, children: [] }]));
  const roots = [];

  for (const item of byId.values()) {
    const pid = item.parent ? String(item.parent?._id || item.parent) : null;
    if (pid && byId.has(pid)) {
      byId.get(pid).children.push(item);
    } else {
      roots.push(item);
    }
  }

  const sortFn = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0);
  const sortRecursive = (nodes) => {
    nodes.sort(sortFn);
    nodes.forEach((n) => sortRecursive(n.children));
  };

  sortRecursive(roots);
  return roots;
}

function flattenTree(nodes = [], depth = 0) {
  let out = [];
  for (const node of nodes) {
    out.push({ ...node, __depth: depth });
    if (node.children?.length) {
      out = out.concat(flattenTree(node.children, depth + 1));
    }
  }
  return out;
}

function countDescendants(node) {
  if (!node?.children?.length) return 0;
  let count = node.children.length;
  for (const child of node.children) count += countDescendants(child);
  return count;
}

function InputField({ label, value, onChange, placeholder, dir = "rtl", type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/90">{label}</label>
      <input
        dir={dir}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:border-primary/80 focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-white/90">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none backdrop-blur-md transition focus:border-primary/80 focus:ring-2 focus:ring-primary/30"
      >
        {children}
      </select>
    </div>
  );
}

export default function CategoriesCrudPage() {
  const endpoint = "/api/admin/categories";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const tree = useMemo(() => buildTree(items), [items]);
  const flatTree = useMemo(() => flattenTree(tree), [tree]);

  const filteredTreeFlat = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return flatTree;

    return flatTree.filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const slug = String(item?.slug || "").toLowerCase();
      return title.includes(q) || slug.includes(q);
    });
  }, [flatTree, search]);

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
      swal({ title: "خطا در دریافت دسته‌بندی‌ها", icon: "error", buttons: "باشه" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
      slug: item?.slug || "",
      parent: item?.parent?._id || item?.parent || "",
      sortOrder: item?.sortOrder ?? 0,
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
    e.preventDefault();

    if (!form.title.trim()) {
      return swal({ title: "عنوان دسته‌بندی الزامی است", icon: "error", buttons: "باشه" });
    }

    const payload = {
      title: form.title.trim(),
      slug: (form.slug || slugifyFa(form.title)).trim(),
      parent: form.parent || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: !!form.isActive,
    };

    setSaving(true);
    try {
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
        return swal({ title: data?.message || "خطا در ذخیره", icon: "error", buttons: "باشه" });
      }

      swal({
        title: isEdit ? "دسته‌بندی ویرایش شد" : "دسته‌بندی اضافه شد",
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
      text: "اگر زیرمجموعه داشته باشد بهتر است اول منتقل/حذف شوند.",
      icon: "warning",
      buttons: ["نه", "بله حذف شود"],
      dangerMode: true,
    });

    if (!ok) return;

    try {
      const res = await fetch(`${endpoint}/${item._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return swal({ title: data?.message || "خطا در حذف", icon: "error", buttons: "باشه" });
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 mb-2">
              <CiGrid41 size={16} />
              مدیریت ساختار
            </div>
            <h1 className="text-lg font-bold text-white md:text-xl">دسته‌بندی‌ها</h1>
            <p className="mt-1 text-sm text-white/70">
              مدیریت دسته‌بندی‌های چندسطحی (مادر / زیر دسته / ...)
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-primary/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
          >
            <CiCirclePlus size={20} />
            <span>افزودن دسته‌بندی</span>
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
              placeholder="جستجو در عنوان یا اسلاگ"
              className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pr-10 pl-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-md transition focus:border-primary/80 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="text-xs text-white/70">
            تعداد کل: <span className="font-semibold text-white">{items.length}</span>
            <span className="mx-1">|</span>
            نمایش: <span className="font-semibold text-white">{filteredTreeFlat.length}</span>
          </div>
        </div>
      </div>

      {/* Desktop Tree List */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-12 gap-2 border-b border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90">
          <div className="col-span-4">عنوان</div>
          <div className="col-span-3">اسلاگ</div>
          <div className="col-span-1 text-center">ترتیب</div>
          <div className="col-span-2">وضعیت</div>
          <div className="col-span-2 text-left">عملیات</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-white/70">در حال دریافت اطلاعات...</div>
        ) : filteredTreeFlat.length === 0 ? (
          <div className="p-8 text-center text-white/70">دسته‌بندی‌ای برای نمایش پیدا نشد.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredTreeFlat.map((item) => {
              const depth = item.__depth || 0;
              const descendants = countDescendants(item);

              return (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm transition hover:bg-white/5"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ marginRight: `${depth * 16}px` }} />
                      {depth > 0 ? (
                        <span className="text-white/40">└</span>
                      ) : (
                        <CiFolderOn className="text-primary/90" size={18} />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{item.title}</p>
                        {descendants > 0 ? (
                          <p className="text-xs text-white/50">{descendants} زیرمجموعه</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 truncate font-mono text-white/75">{item.slug}</div>

                  <div className="col-span-1 text-center text-white/80">{item.sortOrder ?? 0}</div>

                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.isActive
                          ? "border border-green-300/30 bg-green-400/15 text-green-200"
                          : "border border-white/20 bg-white/10 text-white/70"
                      }`}
                    >
                      {item.isActive ? <CiCircleCheck size={15} /> : <CiCircleRemove size={15} />}
                      {item.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary/60 bg-primary/10 px-2.5 py-1.5 text-xs text-primary-foreground text-white transition hover:bg-primary/20"
                      >
                        <CiEdit size={14} />
                        ویرایش
                      </button>
                      <button
                        onClick={() => deleteHandler(item)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-300/40 bg-red-400/10 px-2.5 py-1.5 text-xs text-red-200 transition hover:bg-red-400/20"
                      >
                        <CiTrash size={14} />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/70 shadow-xl backdrop-blur-xl">
            در حال دریافت اطلاعات...
          </div>
        ) : filteredTreeFlat.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-white/70 shadow-xl backdrop-blur-xl">
            دسته‌بندی‌ای برای نمایش پیدا نشد.
          </div>
        ) : (
          filteredTreeFlat.map((item) => {
            const depth = item.__depth || 0;
            const descendants = countDescendants(item);

            return (
              <div
                key={item._id}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ marginRight: `${depth * 12}px` }} />
                      {depth > 0 ? (
                        <span className="text-white/40">└</span>
                      ) : (
                        <CiFolderOn className="text-primary/90" size={18} />
                      )}
                      <p className="truncate text-base font-semibold text-white">{item.title}</p>
                    </div>

                    <div className="mt-1 pr-1">
                      <p className="truncate font-mono text-xs text-white/60">{item.slug}</p>
                      {descendants > 0 ? (
                        <p className="mt-0.5 text-xs text-white/50">{descendants} زیرمجموعه</p>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                      item.isActive
                        ? "border border-green-300/30 bg-green-400/15 text-green-200"
                        : "border border-white/20 bg-white/10 text-white/70"
                    }`}
                  >
                    {item.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </div>

                <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
                  <p className="text-xs text-white/60">ترتیب نمایش</p>
                  <p className="text-sm font-medium text-white">{item.sortOrder ?? 0}</p>
                </div>

                <div className="flex items-center gap-2">
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
            );
          })
        )}
      </div>

      {/* Glass Modal */}
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div
              className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl"
              style={{ maxHeight: "calc(100dvh - 16px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* modal header */}
              <div className="sticky top-0 z-10 border-b border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-white md:text-lg">
                      {editingItem ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
                    </h2>
                    <p className="mt-1 text-xs text-white/60">
                      عنوان، اسلاگ، والد و ترتیب نمایش را تنظیم کنید.
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

              {/* modal body */}
              <form onSubmit={submitHandler} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="عنوان"
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          title: e.target.value,
                          slug: p.slug ? p.slug : slugifyFa(e.target.value),
                        }))
                      }
                      placeholder="مثلاً مواد اولیه"
                    />

                    <InputField
                      label="اسلاگ"
                      dir="ltr"
                      value={form.slug}
                      onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="raw-materials"
                    />

                    <SelectField
                      label="دسته‌بندی والد"
                      value={form.parent}
                      onChange={(e) => setForm((p) => ({ ...p, parent: e.target.value }))}
                    >
                      <option value="" className="text-black">
                        بدون والد (دسته اصلی)
                      </option>
                      {flatTree
                        .filter((cat) => !editingItem || String(cat._id) !== String(editingItem._id))
                        .map((cat) => (
                          <option key={cat._id} value={cat._id} className="text-black">
                            {"— ".repeat(cat.__depth || 0)}
                            {cat.title}
                          </option>
                        ))}
                    </SelectField>

                    <InputField
                      label="ترتیب نمایش"
                      type="number"
                      dir="ltr"
                      value={String(form.sortOrder)}
                      onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="rounded-xl border border-white/15 bg-white/5 p-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        id="cat-is-active"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="h-4 w-4 rounded border-white/30 bg-transparent text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-white/90">فعال باشد</span>
                    </label>
                  </div>
                </div>

                {/* modal footer actions */}
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