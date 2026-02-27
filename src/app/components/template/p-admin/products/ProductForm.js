"use client";

import { useEffect, useMemo, useState } from "react";

const initialForm = {
  title: "",
  slug: "",
  category: "",

  shortDescription: "",
  description: "",

  featuredImage: "",
  images: [],

  pharmacopeia: "",
  grade: "",
  form: "",
  manufacturer: "",
  originCountry: "",
  packagingType:"",

  casNumber: "",
  hsCode: "",

  isActive: true,

  specs: [{ label: "", value: "" }],
};

export default function ProductForm({
  mode = "create", // "create" | "edit"
  initialData = null,
  productId = null,
  onSuccess, // optional callback
}) {
  const [form, setForm] = useState(initialForm);

  const [categories, setCategories] = useState([]);
  const [pharmacopeias, setPharmacopeias] = useState([]);
  const [grades, setGrades] = useState([]);
  const [forms, setForms] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [packagingType, setPackagingType] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedFeaturedFile, setSelectedFeaturedFile] = useState(null);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* --------------------------- init (edit mode) --------------------------- */
  useEffect(() => {
    if (!initialData || mode !== "edit") return;

    setForm({
      title: initialData.title || "",
      slug: initialData.slug || "",
      category: initialData.category?._id || initialData.category || "",

      shortDescription: initialData.shortDescription || "",
      description: initialData.description || "",

      featuredImage: initialData.featuredImage || "",
      images: Array.isArray(initialData.images) ? initialData.images : [],

      pharmacopeia: initialData.pharmacopeia?._id || initialData.pharmacopeia || "",
      grade: initialData.grade?._id || initialData.grade || "",
      form: initialData.form?._id || initialData.form || "",
      manufacturer: initialData.manufacturer?._id || initialData.manufacturer || "",
      originCountry: initialData.originCountry?._id || initialData.originCountry || "",
      packagingType: initialData.packagingType?._id || initialData.packagingType || "",

      casNumber: initialData.casNumber || "",
      hsCode: initialData.hsCode || "",

      isActive:
        typeof initialData.isActive === "boolean" ? initialData.isActive : true,

      specs:
        Array.isArray(initialData.specs) && initialData.specs.length
          ? initialData.specs.map((s) => ({
            label: s?.label || "",
            value: s?.value || "",
          }))
          : [{ label: "", value: "" }],
    });
  }, [initialData, mode]);

  /* ---------------------------- fetch all options ---------------------------- */
  useEffect(() => {
    fetchAllOptions();
  }, []);

  async function fetchAllOptions() {
    try {
      setLoadingOptions(true);
      setError("");

      const endpoints = [
        "/api/admin/categories?limit=500",
        "/api/admin/pharmacopeias?limit=500",
        "/api/admin/grades?limit=500",
        "/api/admin/forms?limit=500",
        "/api/admin/manufacturer?limit=500",
        "/api/admin/countries?limit=500",
        "/api/admin/packaging-types?limit=500",
      ];

      const responses = await Promise.all(
        endpoints.map((url) => fetch(url, { method: "GET", cache: "no-store" }))
      );

      const data = await Promise.all(responses.map((r) => r.json()));

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          throw new Error(data[i]?.message || "خطا در دریافت اطلاعات فرم");
        }
      }
      setCategories(extractItems(data[0], ["categories"]));
      setPharmacopeias(extractItems(data[1], ["pharmacopeias"]));
      setGrades(extractItems(data[2], ["grades"]));
      setForms(extractItems(data[3], ["forms"]));
      setManufacturers(extractItems(data[4], ["manufacturers"]));
      setCountries(extractItems(data[5], ["countries"]));
      setPackagingType(extractItems(data[6], ["packagingType"]));
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات فرم");
    } finally {
      setLoadingOptions(false);
    }
  }
  function extractItems(payload, fallbackKeys = []) {
    // 1) اگر خود payload آرایه بود
    if (Array.isArray(payload)) return payload;

    // 2) ساختارهای رایج
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    if (Array.isArray(payload?.data)) return payload.data;

    // 3) کلیدهای سفارشی مثل categories / grades / ...
    for (const key of fallbackKeys) {
      if (Array.isArray(payload?.[key])) return payload[key];
      if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    }

    // 4) بعضی APIها list / results برمی‌گردونن
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data?.results)) return payload.data.results;
    if (Array.isArray(payload?.list)) return payload.list;
    if (Array.isArray(payload?.data?.list)) return payload.data.list;

    return [];
  }

  /* ------------------------------- category tree ------------------------------ */
  function flattenCategoryTree(nodes = [], depth = 0, result = []) {
    for (const node of nodes) {
      const children = Array.isArray(node.children) ? node.children : [];
      const isLeaf = children.length === 0;

      result.push({
        _id: node._id,
        title: node.title || node.name || "بدون عنوان",
        depth,
        isLeaf,
      });

      if (children.length) {
        flattenCategoryTree(children, depth + 1, result);
      }
    }
    return result;
  }

  // اگر API دسته‌بندی فلت بود (parent-based)، این تابع تبدیلش می‌کنه به درخت
  function buildTreeFromFlat(items = []) {
    const map = new Map();
    const roots = [];

    // normalize
    for (const item of items) {
      const id = String(item._id);
      map.set(id, { ...item, children: [] });
    }

    for (const item of items) {
      const id = String(item._id);
      const parentId = item.parent ? String(item.parent?._id || item.parent) : null;

      if (parentId && map.has(parentId)) {
        map.get(parentId).children.push(map.get(id));
      } else {
        roots.push(map.get(id));
      }
    }

    return roots;
  }

  const normalizedCategoryTree = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    if (!categories.length) return [];

    // اگر ساختار درختی بود
    if (Array.isArray(categories[0]?.children)) {
      return categories;
    }

    // اگر فلت بود
    return buildTreeFromFlat(categories);
  }, [categories]);

  const categoryOptions = useMemo(() => {
    return flattenCategoryTree(normalizedCategoryTree);
  }, [normalizedCategoryTree]);

  /* -------------------------------- handlers -------------------------------- */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSpecChange(index, field, value) {
    setForm((prev) => {
      const next = [...prev.specs];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, specs: next };
    });
  }

  function addSpecRow() {
    setForm((prev) => ({
      ...prev,
      specs: [...prev.specs, { label: "", value: "" }],
    }));
  }

  function removeSpecRow(index) {
    setForm((prev) => {
      const next = prev.specs.filter((_, i) => i !== index);
      return {
        ...prev,
        specs: next.length ? next : [{ label: "", value: "" }],
      };
    });
  }

  /* -------------------------------- uploads -------------------------------- */
  function onFeaturedFileSelect(e) {
    const file = e.target.files?.[0] || null;
    setSelectedFeaturedFile(file);
  }

  function onGalleryFilesSelect(e) {
    const files = Array.from(e.target.files || []);
    setSelectedGalleryFiles(files);
  }

  async function uploadFeaturedImage() {
    if (!selectedFeaturedFile) return;

    try {
      setUploadingFeatured(true);
      setError("");
      setSuccess("");

      const fd = new FormData();
      fd.append("folder", "products");
      fd.append("files", selectedFeaturedFile);

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "خطا در آپلود تصویر شاخص");
      }

      const uploadedUrl = data?.files?.[0]?.url;
      if (!uploadedUrl) {
        throw new Error("آدرس تصویر شاخص دریافت نشد.");
      }

      setForm((prev) => ({ ...prev, featuredImage: uploadedUrl }));
      setSelectedFeaturedFile(null);
      setSuccess("تصویر شاخص با موفقیت آپلود شد.");
    } catch (err) {
      setError(err.message || "خطا در آپلود تصویر شاخص");
    } finally {
      setUploadingFeatured(false);
    }
  }

  async function uploadGalleryImages() {
    if (!selectedGalleryFiles.length) return;

    try {
      setUploadingGallery(true);
      setError("");
      setSuccess("");

      const fd = new FormData();
      fd.append("folder", "products");
      for (const file of selectedGalleryFiles) {
        fd.append("files", file);
      }

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "خطا در آپلود تصاویر گالری");
      }

      const uploadedUrls = (data?.files || []).map((f) => f.url).filter(Boolean);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      setSelectedGalleryFiles([]);
      setSuccess("تصاویر گالری با موفقیت آپلود شدند.");
    } catch (err) {
      setError(err.message || "خطا در آپلود تصاویر گالری");
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeFeaturedImage() {
    setForm((prev) => ({ ...prev, featuredImage: "" }));
  }

  function removeGalleryImage(url) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
  }

  /* -------------------------------- payload -------------------------------- */
  const payload = useMemo(() => {
    return {
      title: String(form.title || "").trim(),
      slug: String(form.slug || "").trim() || undefined,
      category: String(form.category || "").trim(),

      shortDescription: String(form.shortDescription || "").trim(),
      description: String(form.description || "").trim(),

      featuredImage: String(form.featuredImage || "").trim(),
      images: Array.isArray(form.images) ? form.images : [],

      pharmacopeia: form.pharmacopeia || null,
      grade: form.grade || null,
      form: form.form || null,
      manufacturer: form.manufacturer || null,
      originCountry: form.originCountry || null,
      packagingType: form.packagingType || null,

      casNumber: String(form.casNumber || "").trim(),
      hsCode: String(form.hsCode || "").trim(),

      isActive: !!form.isActive,

      specs: (form.specs || [])
        .map((s) => ({
          label: String(s?.label || "").trim(),
          value: String(s?.value || "").trim(),
        }))
        .filter((s) => s.label && s.value),
    };
  }, [form]);

  /* -------------------------------- submit -------------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (!payload.title) {
        throw new Error("عنوان محصول الزامی است.");
      }

      if (!payload.category) {
        throw new Error("دسته‌بندی را انتخاب کنید.");
      }

      const url =
        mode === "edit" && productId
          ? `/api/admin/products/${productId}`
          : "/api/admin/products";

      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "خطا در ثبت/ویرایش محصول");
      }

      setSuccess(
        mode === "edit"
          ? "محصول با موفقیت ویرایش شد."
          : "محصول با موفقیت ایجاد شد."
      );

      if (typeof onSuccess === "function") {
        onSuccess(data);
      }

      if (mode === "create") {
        setForm(initialForm);
        setSelectedFeaturedFile(null);
        setSelectedGalleryFiles([]);
      }
    } catch (err) {
      setError(err.message || "خطا در ثبت/ویرایش محصول");
    } finally {
      setSubmitting(false);
    }
  }

  /* -------------------------------- helpers ui -------------------------------- */
  function optionLabel(item) {
    return item?.title || item?.name || item?.label || "بدون عنوان";
  }

  const isBusy = loadingOptions || submitting || uploadingFeatured || uploadingGallery;

  return (

    <form
  onSubmit={handleSubmit}
  className="rounded-2xl border border-white/20 bg-white/10 p-4 md:p-6 space-y-6 shadow-2xl backdrop-blur-2xl"
>
  {/* Alerts */}
  {error ? (
    <div className="rounded-xl border border-red-300/30 bg-red-400/10 text-red-100 px-3 py-2 text-sm">
      {error}
    </div>
  ) : null}

  {success ? (
    <div className="rounded-xl border border-green-300/30 bg-green-400/10 text-green-100 px-3 py-2 text-sm">
      {success}
    </div>
  ) : null}

  {/* Base Info */}
  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h2 className="font-semibold text-white">اطلاعات پایه محصول</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 text-sm text-white/85">عنوان محصول *</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
          placeholder="مثلاً Acetone HPLC Grade"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">اسلاگ (اختیاری)</label>
        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
          placeholder="acetone-hplc-grade"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">دسته‌بندی *</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">
            {loadingOptions ? "در حال دریافت..." : "انتخاب دسته‌بندی"}
          </option>

          {categoryOptions.map((cat) => (
            <option key={cat._id} value={cat._id} disabled={!cat.isLeaf} className="text-black">
              {`${"— ".repeat(cat.depth)}${cat.title}${cat.isLeaf ? "" : " (گروه)"}`}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/55 mt-1">فقط زیر‌دسته نهایی قابل انتخاب است.</p>
      </div>

      <div className="flex items-center gap-2 pt-7">
        <input
          id="isActive"
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
          className="w-4 h-4 rounded border-white/30 bg-transparent text-primary focus:ring-primary"
        />
        <label htmlFor="isActive" className="text-sm text-white/85">
          فعال باشد
        </label>
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">CAS Number</label>
        <input
          name="casNumber"
          value={form.casNumber}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
          placeholder="67-64-1"
          dir="ltr"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">HS Code</label>
        <input
          name="hsCode"
          value={form.hsCode}
          onChange={handleChange}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
          placeholder="29141100"
          dir="ltr"
        />
      </div>
    </div>

    <div>
      <label className="block mb-1 text-sm text-white/85">توضیح کوتاه</label>
      <textarea
        name="shortDescription"
        value={form.shortDescription}
        onChange={handleChange}
        rows={2}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
        placeholder="یک توضیح کوتاه برای نمایش در کارت یا لیست محصول..."
      />
    </div>

    <div>
      <label className="block mb-1 text-sm text-white/85">توضیحات کامل</label>
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        rows={5}
        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
        placeholder="توضیحات کامل محصول..."
      />
    </div>
  </section>

  {/* Standard Filters */}
  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h2 className="font-semibold text-white">فیلترها و اطلاعات استاندارد</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 text-sm text-white/85">فارماکوپه</label>
        <select
          name="pharmacopeia"
          value={form.pharmacopeia}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">انتخاب فارماکوپه</option>
          {pharmacopeias.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">گرید</label>
        <select
          name="grade"
          value={form.grade}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">انتخاب گرید</option>
          {grades.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">فرم</label>
        <select
          name="form"
          value={form.form}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">انتخاب فرم</option>
          {forms.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">سازنده</label>
        <select
          name="manufacturer"
          value={form.manufacturer}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">انتخاب سازنده</option>
          {manufacturers.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-sm text-white/85">کشور سازنده</label>
        <select
          name="originCountry"
          value={form.originCountry}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black">انتخاب کشور</option>
          {countries.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-sm text-white/85">بسته بندی </label>
        <select
          name="packagingType"
          value={form.packagingType}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70 disabled:opacity-60"
        >
          <option value="" className="text-black"> بسته بندی</option>
          {packagingType.map((item) => (
            <option key={item._id} value={item._id} className="text-black">
              {optionLabel(item)}
            </option>
          ))}
        </select>
      </div>
    </div>
  </section>

  {/* Featured Image */}
  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h2 className="font-semibold text-white">تصویر شاخص</h2>

    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-3">
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFeaturedFileSelect}
        className="block w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-primary/90 file:px-3 file:py-1.5 file:text-white hover:file:opacity-90"
      />

      {selectedFeaturedFile ? (
        <p className="text-sm text-white/70">فایل انتخاب‌شده: {selectedFeaturedFile.name}</p>
      ) : null}

      <button
        type="button"
        onClick={uploadFeaturedImage}
        disabled={uploadingFeatured || !selectedFeaturedFile}
        className="px-4 py-2 rounded-xl border border-primary/40 bg-primary/90 text-white disabled:opacity-50"
      >
        {uploadingFeatured ? "در حال آپلود..." : "آپلود تصویر شاخص"}
      </button>
    </div>

    {form.featuredImage ? (
      <div className="relative w-40 h-40 border border-white/20 rounded-xl overflow-hidden bg-white/5">
        <img
          src={form.featuredImage}
          alt="featured"
          className="w-full h-full object-cover"
        />

        <button
          type="button"
          onClick={removeFeaturedImage}
          className="absolute top-1 left-1 w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-white/20 text-red-200 font-bold leading-none"
          title="حذف تصویر شاخص"
        >
          ×
        </button>
      </div>
    ) : (
      <p className="text-xs text-white/55">هنوز تصویر شاخص انتخاب نشده است.</p>
    )}
  </section>

  {/* Gallery */}
  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
    <h2 className="font-semibold text-white">گالری تصاویر</h2>

    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 space-y-3">
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={onGalleryFilesSelect}
        className="block w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-primary/90 file:px-3 file:py-1.5 file:text-white hover:file:opacity-90"
      />

      {selectedGalleryFiles.length ? (
        <p className="text-sm text-white/70">{selectedGalleryFiles.length} فایل انتخاب شده</p>
      ) : null}

      <button
        type="button"
        onClick={uploadGalleryImages}
        disabled={uploadingGallery || !selectedGalleryFiles.length}
        className="px-4 py-2 rounded-xl border border-primary/40 bg-primary/90 text-white disabled:opacity-50"
      >
        {uploadingGallery ? "در حال آپلود..." : "آپلود تصاویر گالری"}
      </button>
    </div>

    {form.images.length > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {form.images.map((imgUrl, idx) => (
          <div
            key={`${imgUrl}-${idx}`}
            className="relative border border-white/20 rounded-xl overflow-hidden bg-white/5"
          >
            <div className="aspect-square">
              <img
                src={imgUrl}
                alt={`gallery-${idx}`}
                className="w-full h-full object-cover"
              />
            </div>

            <button
              type="button"
              onClick={() => removeGalleryImage(imgUrl)}
              className="absolute top-1 left-1 w-7 h-7 rounded-full bg-black/40 backdrop-blur border border-white/20 text-red-200 font-bold leading-none"
              title="حذف از گالری"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-xs text-white/55">گالری هنوز خالی است.</p>
    )}
  </section>

  {/* Specs Table */}
  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="font-semibold text-white">جدول مشخصات</h2>
      <button
        type="button"
        onClick={addSpecRow}
        className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-sm text-white hover:bg-white/10"
      >
        + افزودن ردیف
      </button>
    </div>

    <div className="space-y-2">
      {form.specs.map((spec, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center"
        >
          <input
            value={spec.label}
            onChange={(e) => handleSpecChange(index, "label", e.target.value)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
            placeholder="عنوان مشخصه (مثلاً Purity)"
          />

          <input
            value={spec.value}
            onChange={(e) => handleSpecChange(index, "value", e.target.value)}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/70"
            placeholder="مقدار (مثلاً 99.9%)"
          />

          <button
            type="button"
            onClick={() => removeSpecRow(index)}
            className="px-3 py-2 rounded-xl border border-red-300/30 bg-red-400/10 text-red-100 hover:bg-red-400/20"
          >
            حذف
          </button>
        </div>
      ))}
    </div>
  </section>

  {/* Actions */}
  <section className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
    <button
      type="submit"
      disabled={isBusy}
      className="px-5 py-2.5 rounded-xl border border-primary/40 bg-primary/90 text-white shadow-lg shadow-primary/20 disabled:opacity-50"
    >
      {submitting
        ? mode === "edit"
          ? "در حال ذخیره..."
          : "در حال ثبت..."
        : mode === "edit"
        ? "ذخیره تغییرات"
        : "ثبت محصول"}
    </button>

    <button
      type="button"
      disabled={isBusy}
      onClick={() => {
        setForm(initialForm);
        setSelectedFeaturedFile(null);
        setSelectedGalleryFiles([]);
        setError("");
        setSuccess("");
      }}
      className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-50"
    >
      پاک کردن فرم
    </button>
  </section>
</form>

  );
}