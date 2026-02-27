"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function extractItems(payload, fallbackKeys = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of fallbackKeys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  return [];
}

function optionLabel(item) {
  return item?.title || item?.name || item?.label || "بدون عنوان";
}

function buildVariantLabel(variant) {
  const parts = [
    variant?.pharmacopeia?.title || variant?.pharmacopeia?.name,
    variant?.grade?.title || variant?.grade?.name,
    variant?.form?.title || variant?.form?.name,
    variant?.manufacturer?.title || variant?.manufacturer?.name,
    variant?.originCountry?.title || variant?.originCountry?.name,
  ].filter(Boolean);
  return parts.length ? parts.join(" | ") : "واریانت بدون مشخصات";
}

function emptyLot() {
  return {
    lotNo: "",
    mfgDate: "",
    expDate: "",
    availableQty: "",
    qtyUnit: "KG",
    originCountryText: "",
    manufacturerText: "",
    coaFiles: [{ url: "", key: "", mime: "", size: 0 }],
    isActive: true,
  };
}

export default function ListingForm({ mode = "create", listingId = null }) {
  const isEdit = mode === "edit";

  // category tree
  const [categoryTree, setCategoryTree] = useState([]);
  const [level1Id, setLevel1Id] = useState("");
  const [level2Id, setLevel2Id] = useState("");
  const [level3Id, setLevel3Id] = useState("");

  // catalog product selection
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  // variants
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [allowedPackagingTypes, setAllowedPackagingTypes] = useState([]);

  // form fields
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("IRR");
  const [priceUnit, setPriceUnit] = useState("KG");
  const [minOrderQty, setMinOrderQty] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  // packaging
  const [packagingTypeId, setPackagingTypeId] = useState("");
  const [packagingAmount, setPackagingAmount] = useState("");
  const [packagingUnit, setPackagingUnit] = useState("KG");
  const [packagingDescription, setPackagingDescription] = useState("");

  // lots
  const [lots, setLots] = useState([emptyLot()]);

  const [status, setStatus] = useState("DRAFT");

  // ui
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingInitialListing, setLoadingInitialListing] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // برای جلوگیری از ریست بی‌موقع هنگام preload در edit
  const isHydratingRef = useRef(false);

  const level1Options = useMemo(() => categoryTree || [], [categoryTree]);

  const level2Options = useMemo(() => {
    const level1 = level1Options.find((c) => String(c._id) === String(level1Id));
    return level1?.children || [];
  }, [level1Options, level1Id]);

  const level3Options = useMemo(() => {
    const level2 = level2Options.find((c) => String(c._id) === String(level2Id));
    return level2?.children || [];
  }, [level2Options, level2Id]);

  const finalCategoryId = useMemo(() => level3Id || level2Id || level1Id || "", [level1Id, level2Id, level3Id]);

  const selectedVariant = useMemo(
    () => variants.find((v) => String(v._id) === String(selectedVariantId)) || null,
    [variants, selectedVariantId]
  );

  /* ----------------------------- data loads ----------------------------- */

  useEffect(() => {
    fetchCategoriesTree();
  }, []);

  async function fetchCategoriesTree() {
    try {
      setLoadingCategories(true);
      const res = await fetch("/api/catalog/categories/tree", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در دریافت دسته‌بندی‌ها");
      setCategoryTree(extractItems(data, ["categories"]));
    } catch (err) {
      setError(err.message || "خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoadingCategories(false);
    }
  }

  // load initial listing in edit mode
  useEffect(() => {
    if (!isEdit || !listingId) return;
    if (loadingCategories) return; // صبر کن دسته‌بندی‌ها لود شوند

    fetchInitialListingForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, listingId, loadingCategories]);

  async function fetchInitialListingForEdit() {
    try {
      setLoadingInitialListing(true);
      setError("");
      isHydratingRef.current = true;

      const res = await fetch(`/api/users/listings/${listingId}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در دریافت آگهی");

      const listing = data?.listing;
      if (!listing) throw new Error("داده آگهی نامعتبر است.");

      // فرم اصلی
      setSelectedProductId(String(listing?.product?._id || ""));
      setSelectedVariantId(String(listing?.variant?._id || ""));
      setPrice(String(listing?.price ?? ""));
      setCurrency(String(listing?.currency || "IRR"));
      setPriceUnit(String(listing?.priceUnit || "KG"));
      setMinOrderQty(String(listing?.minOrderQty ?? ""));
      setLeadTimeDays(String(listing?.leadTimeDays ?? ""));
      setDescription(String(listing?.description || ""));
      setNote(String(listing?.note || ""));
      setStatus(String(listing?.status || "DRAFT"));

      setPackagingTypeId(String(listing?.packaging?.type?._id || listing?.packaging?.type || ""));
      setPackagingAmount(String(listing?.packaging?.amountPerPack ?? ""));
      setPackagingUnit(String(listing?.packaging?.unit || "KG"));
      setPackagingDescription(String(listing?.packaging?.description || ""));

      // lots
      const incomingLots = Array.isArray(listing?.lots) && listing.lots.length > 0
        ? listing.lots.map((lot) => ({
            _id: lot?._id,
            lotNo: lot?.lotNo || "",
            mfgDate: lot?.mfgDate ? new Date(lot.mfgDate).toISOString().slice(0, 10) : "",
            expDate: lot?.expDate ? new Date(lot.expDate).toISOString().slice(0, 10) : "",
            availableQty: lot?.availableQty ?? "",
            qtyUnit: lot?.qtyUnit || "KG",
            originCountryText: lot?.originCountryText || "",
            manufacturerText: lot?.manufacturerText || "",
            coaFiles:
              Array.isArray(lot?.coaFiles) && lot.coaFiles.length > 0
                ? lot.coaFiles.map((f) => ({
                    url: f?.url || "",
                    key: f?.key || "",
                    mime: f?.mime || "",
                    size: f?.size || 0,
                  }))
                : [{ url: "", key: "", mime: "", size: 0 }],
            isActive: typeof lot?.isActive === "boolean" ? lot.isActive : true,
          }))
        : [emptyLot()];

      setLots(incomingLots);

      // set category cascade based on product.category
      const productCategoryId = String(listing?.product?.category || "");
      if (productCategoryId) {
        applyCategoryPathFromTree(productCategoryId);
      }

      // محصولات و واریانت‌ها را متناسب با داده فعلی می‌گیریم
      if (productCategoryId) {
        await fetchProductsByCategory(productCategoryId, String(listing?.product?._id || ""));
      }
      if (listing?.product?._id) {
        await fetchVariantsForProduct(String(listing.product._id), String(listing?.variant?._id || ""));
      }

      setSuccess("اطلاعات آگهی بارگذاری شد.");
    } catch (err) {
      setError(err.message || "خطا در دریافت آگهی");
    } finally {
      setLoadingInitialListing(false);
      setTimeout(() => {
        isHydratingRef.current = false;
      }, 0);
    }
  }

  function applyCategoryPathFromTree(categoryId) {
    // از tree مسیر را پیدا می‌کنیم (تا 3 لایه)
    let l1 = "";
    let l2 = "";
    let l3 = "";

    for (const root of categoryTree) {
      if (String(root._id) === String(categoryId)) {
        l1 = String(root._id);
        break;
      }
      for (const child of root.children || []) {
        if (String(child._id) === String(categoryId)) {
          l1 = String(root._id);
          l2 = String(child._id);
          break;
        }
        for (const sub of child.children || []) {
          if (String(sub._id) === String(categoryId)) {
            l1 = String(root._id);
            l2 = String(child._id);
            l3 = String(sub._id);
            break;
          }
        }
        if (l3) break;
      }
      if (l1 && (l2 || !l3)) {
        // continue checks handled
      }
      if (l1 && (String(categoryId) === l1 || l2 || l3)) break;
    }

    setLevel1Id(l1);
    setLevel2Id(l2);
    setLevel3Id(l3);
  }

  /* ----------------------------- catalog products ----------------------------- */

  async function fetchProductsByCategory(categoryIdOverride, keepSelectedProductId = "") {
    const categoryId = categoryIdOverride || finalCategoryId;

    if (!categoryId) {
      setProducts([]);
      if (!keepSelectedProductId) setSelectedProductId("");
      return;
    }

    try {
      setLoadingProducts(true);
      setError("");

      const params = new URLSearchParams();
      params.set("categoryId", categoryId);
      params.set("limit", "100");
      if (productSearch.trim()) params.set("q", productSearch.trim());

      const res = await fetch(`/api/catalog/products?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در دریافت محصولات");

      const items = extractItems(data, ["products"]);
      setProducts(items);

      const targetId = keepSelectedProductId || selectedProductId;
      if (targetId && !items.some((p) => String(p._id) === String(targetId))) {
        setSelectedProductId("");
        setVariants([]);
        setSelectedVariantId("");
        setAllowedPackagingTypes([]);
        setPackagingTypeId("");
      } else if (keepSelectedProductId) {
        setSelectedProductId(String(keepSelectedProductId));
      }
    } catch (err) {
      setError(err.message || "خطا در دریافت محصولات");
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    if (isHydratingRef.current) return;

    setProducts([]);
    setSelectedProductId("");
    setVariants([]);
    setSelectedVariantId("");
    setAllowedPackagingTypes([]);
    setPackagingTypeId("");

    if (finalCategoryId) {
      fetchProductsByCategory(finalCategoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalCategoryId]);

  /* ----------------------------- variants ----------------------------- */

  async function fetchVariantsForProduct(productId, keepVariantId = "") {
    if (!productId) {
      setVariants([]);
      if (!keepVariantId) setSelectedVariantId("");
      setAllowedPackagingTypes([]);
      setPackagingTypeId("");
      return;
    }

    try {
      setLoadingVariants(true);
      setError("");

      const res = await fetch(`/api/catalog/products/${productId}/variants`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در دریافت واریانت‌ها");

      const items = extractItems(data, ["variants"]);
      setVariants(items);

      const targetId = keepVariantId || selectedVariantId;
      if (targetId && !items.some((v) => String(v._id) === String(targetId))) {
        setSelectedVariantId("");
        setAllowedPackagingTypes([]);
        setPackagingTypeId("");
      } else if (keepVariantId) {
        setSelectedVariantId(String(keepVariantId));
      }
    } catch (err) {
      setError(err.message || "خطا در دریافت واریانت‌ها");
    } finally {
      setLoadingVariants(false);
    }
  }

  useEffect(() => {
    if (!selectedProductId || isHydratingRef.current) return;
    fetchVariantsForProduct(selectedProductId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  useEffect(() => {
    if (!selectedVariant) {
      setAllowedPackagingTypes([]);
      if (!isHydratingRef.current) setPackagingTypeId("");
      return;
    }

    const allowed = Array.isArray(selectedVariant.allowedPackagingTypes)
      ? selectedVariant.allowedPackagingTypes
      : [];
    setAllowedPackagingTypes(allowed);

    if (!allowed.some((p) => String(p._id) === String(packagingTypeId)) && !isHydratingRef.current) {
      setPackagingTypeId("");
    }
  }, [selectedVariant, packagingTypeId]);

  /* ----------------------------- lot handlers ----------------------------- */

  function addLot() {
    setLots((prev) => [...prev, emptyLot()]);
  }

  function removeLot(index) {
    setLots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLot(index, field, value) {
    setLots((prev) => prev.map((lot, i) => (i === index ? { ...lot, [field]: value } : lot)));
  }

  function updateLotCoaFile(lotIndex, fileIndex, field, value) {
    setLots((prev) =>
      prev.map((lot, i) => {
        if (i !== lotIndex) return lot;
        const coaFiles = Array.isArray(lot.coaFiles) ? [...lot.coaFiles] : [];
        coaFiles[fileIndex] = { ...(coaFiles[fileIndex] || {}), [field]: value };
        return { ...lot, coaFiles };
      })
    );
  }

  function addLotCoaFile(lotIndex) {
    setLots((prev) =>
      prev.map((lot, i) => {
        if (i !== lotIndex) return lot;
        return { ...lot, coaFiles: [...(lot.coaFiles || []), { url: "", key: "", mime: "", size: 0 }] };
      })
    );
  }

  function removeLotCoaFile(lotIndex, fileIndex) {
    setLots((prev) =>
      prev.map((lot, i) => {
        if (i !== lotIndex) return lot;
        return { ...lot, coaFiles: (lot.coaFiles || []).filter((_, idx) => idx !== fileIndex) };
      })
    );
  }

  async function handleUploadCoaFile(file, lotIndex, fileIndex) {
    if (!file) return;
    const key = `${lotIndex}-${fileIndex}`;

    try {
      setUploadingKey(key);
      setError("");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "coa");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "خطا در آپلود فایل");

      const uploaded = data?.file;
      updateLotCoaFile(lotIndex, fileIndex, "url", uploaded?.url || "");
      updateLotCoaFile(lotIndex, fileIndex, "key", uploaded?.key || "");
      updateLotCoaFile(lotIndex, fileIndex, "mime", uploaded?.mime || file.type || "");
      updateLotCoaFile(lotIndex, fileIndex, "size", uploaded?.size || file.size || 0);
    } catch (err) {
      setError(err.message || "خطا در آپلود COA");
    } finally {
      setUploadingKey("");
    }
  }

  /* ----------------------------- submit ----------------------------- */

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!finalCategoryId) return setError("لطفاً دسته‌بندی را انتخاب کنید.");
    if (!selectedProductId) return setError("لطفاً محصول را انتخاب کنید.");
    if (!selectedVariantId) return setError("لطفاً واریانت را انتخاب کنید.");
    if (!packagingTypeId) return setError("لطفاً نوع بسته‌بندی را انتخاب کنید.");
    if (price === "" || Number(price) < 0) return setError("قیمت معتبر وارد کنید.");
    if (packagingAmount === "" || Number(packagingAmount) <= 0) {
      return setError("مقدار هر بسته باید بیشتر از صفر باشد.");
    }

    try {
      setSubmitting(true);

      const payload = {
        // در PATCH هم product/variant را فعلاً نفرست تا API ساده بماند
        ...(isEdit
          ? {}
          : {
              product: selectedProductId,
              variant: selectedVariantId,
            }),

        price: Number(price),
        currency,
        priceUnit,
        minOrderQty: minOrderQty === "" ? 0 : Number(minOrderQty),
        leadTimeDays: leadTimeDays === "" ? 0 : Number(leadTimeDays),
        description,
        note,

        packaging: {
          type: packagingTypeId,
          amountPerPack: Number(packagingAmount),
          unit: packagingUnit,
          description: packagingDescription,
        },

        lots: lots.map((lot) => ({
          ...(lot?._id ? { _id: lot._id } : {}),
          lotNo: lot.lotNo,
          mfgDate: lot.mfgDate || null,
          expDate: lot.expDate || null,
          availableQty: lot.availableQty === "" ? 0 : Number(lot.availableQty),
          qtyUnit: lot.qtyUnit,
          originCountryText: lot.originCountryText,
          manufacturerText: lot.manufacturerText,
          coaFiles: (lot.coaFiles || [])
            .filter((f) => String(f?.url || "").trim())
            .map((f) => ({
              url: String(f.url || "").trim(),
              key: String(f.key || "").trim(),
              mime: String(f.mime || "").trim(),
              size: Number(f.size || 0),
            })),
          isActive: true,
        })),

        status,
      };

      const url = isEdit ? `/api/users/listings/${listingId}` : "/api/users/listings";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "خطا در ثبت/ویرایش آگهی");

      setSuccess(data?.message || (isEdit ? "آگهی ویرایش شد." : "آگهی ثبت شد."));

      if (!isEdit) {
        // reset only in create mode
        setSelectedProductId("");
        setProducts([]);
        setVariants([]);
        setSelectedVariantId("");
        setAllowedPackagingTypes([]);
        setPackagingTypeId("");
        setPrice("");
        setMinOrderQty("");
        setLeadTimeDays("");
        setDescription("");
        setNote("");
        setPackagingAmount("");
        setPackagingDescription("");
        setLots([emptyLot()]);
        setStatus("DRAFT");
      }
    } catch (err) {
      setError(err.message || "خطا در عملیات");
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && loadingInitialListing) {
    return (
      <div className="bg-white border rounded-2xl p-4 text-sm text-gray-500">
        در حال بارگذاری اطلاعات آگهی...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-4 space-y-5">
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

      {/* دسته‌بندی */}
      <section className="space-y-3">
        <h2 className="font-semibold">1) انتخاب دسته‌بندی</h2>
        {loadingCategories ? (
          <div className="text-sm text-gray-500">در حال دریافت دسته‌بندی‌ها...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm">دسته سطح 1</label>
              <select
                value={level1Id}
                onChange={(e) => {
                  setLevel1Id(e.target.value);
                  setLevel2Id("");
                  setLevel3Id("");
                }}
                className="w-full border rounded-xl px-3 py-2 bg-white"
                disabled={isEdit} // برای جلوگیری از تغییر product/variant در edit
              >
                <option value="">انتخاب کنید</option>
                {level1Options.map((item) => (
                  <option key={item._id} value={item._id}>{item.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">دسته سطح 2</label>
              <select
                value={level2Id}
                onChange={(e) => {
                  setLevel2Id(e.target.value);
                  setLevel3Id("");
                }}
                disabled={!level1Id || isEdit}
                className="w-full border rounded-xl px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">انتخاب کنید</option>
                {level2Options.map((item) => (
                  <option key={item._id} value={item._id}>{item.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">دسته سطح 3</label>
              <select
                value={level3Id}
                onChange={(e) => setLevel3Id(e.target.value)}
                disabled={!level2Id || isEdit}
                className="w-full border rounded-xl px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">انتخاب کنید</option>
                {level3Options.map((item) => (
                  <option key={item._id} value={item._id}>{item.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* محصول */}
      <section className="space-y-3">
        <h2 className="font-semibold">2) انتخاب محصول از کاتالوگ</h2>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="جستجو در عنوان / CAS / HS"
            className="flex-1 border rounded-xl px-3 py-2"
            disabled={isEdit}
          />
          <button
            type="button"
            onClick={() => fetchProductsByCategory()}
            disabled={!finalCategoryId || loadingProducts || isEdit}
            className="px-4 py-2 rounded-xl border disabled:opacity-50"
          >
            {loadingProducts ? "..." : "جستجو/بارگذاری"}
          </button>
        </div>

        <div>
          <label className="block mb-1 text-sm">محصول</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            disabled={!finalCategoryId || loadingProducts || isEdit}
            className="w-full border rounded-xl px-3 py-2 bg-white disabled:bg-gray-100"
          >
            <option value="">انتخاب محصول</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} {p.casNumber ? `| CAS: ${p.casNumber}` : ""}
              </option>
            ))}
          </select>
          {isEdit ? (
            <p className="text-xs text-gray-500 mt-1">
              در ویرایش، محصول و واریانت ثابت هستند و فقط اطلاعات فروش تغییر می‌کند.
            </p>
          ) : null}
        </div>
      </section>

      {/* واریانت */}
      <section className="space-y-3">
        <h2 className="font-semibold">3) انتخاب واریانت</h2>
        <div>
          <label className="block mb-1 text-sm">واریانت</label>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            disabled={!selectedProductId || loadingVariants || isEdit}
            className="w-full border rounded-xl px-3 py-2 bg-white disabled:bg-gray-100"
          >
            <option value="">انتخاب واریانت</option>
            {variants.map((v) => (
              <option key={v._id} value={v._id}>{buildVariantLabel(v)}</option>
            ))}
          </select>
        </div>
      </section>

      {/* فروش + بسته‌بندی */}
      <section className="space-y-3">
        <h2 className="font-semibold">4) اطلاعات فروش و بسته‌بندی</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-sm">قیمت *</label>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm">واحد قیمت</label>
            <select value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white">
              <option value="KG">KG</option>
              <option value="L">L</option>
              <option value="PCS">PCS</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm">ارز</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white">
              <option value="IRR">IRR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm">حداقل سفارش</label>
            <input type="number" min="0" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm">زمان آماده‌سازی (روز)</label>
            <input type="number" min="0" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
          </div>

          <div>
            <label className="block mb-1 text-sm">وضعیت</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white">
              <option value="DRAFT">پیش‌نویس</option>
              <option value="ACTIVE">فعال</option>
              <option value="PAUSED">متوقف</option>
              <option value="SOLD_OUT">اتمام موجودی</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
          </div>
        </div>

        <div className="border rounded-xl p-3 space-y-3">
          <div className="font-medium text-sm">بسته‌بندی</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block mb-1 text-sm">نوع بسته‌بندی *</label>
              <select
                value={packagingTypeId}
                onChange={(e) => setPackagingTypeId(e.target.value)}
                disabled={!selectedVariantId}
                className="w-full border rounded-xl px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">انتخاب کنید</option>
                {allowedPackagingTypes.map((pt) => (
                  <option key={pt._id} value={pt._id}>
                    {optionLabel(pt)} {pt.code ? `(${pt.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">مقدار هر بسته *</label>
              <input type="number" min="0" step="any" value={packagingAmount} onChange={(e) => setPackagingAmount(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
            </div>

            <div>
              <label className="block mb-1 text-sm">واحد بسته</label>
              <select value={packagingUnit} onChange={(e) => setPackagingUnit(e.target.value)} className="w-full border rounded-xl px-3 py-2 bg-white">
                <option value="KG">KG</option>
                <option value="L">L</option>
                <option value="PCS">PCS</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">توضیح بسته‌بندی</label>
              <input value={packagingDescription} onChange={(e) => setPackagingDescription(e.target.value)} className="w-full border rounded-xl px-3 py-2" />
            </div>
          </div>
        </div>
      </section>

      {/* lots + COA */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">5) اطلاعات Lot / Batch</h2>
          <button type="button" onClick={addLot} className="px-3 py-1.5 rounded-lg border text-sm">
            + افزودن لات
          </button>
        </div>

        {lots.map((lot, lotIndex) => (
          <div key={lot._id || lotIndex} className="border rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">لات #{lotIndex + 1}</div>
              {lots.length > 1 ? (
                <button type="button" onClick={() => removeLot(lotIndex)} className="text-red-600 text-sm">
                  حذف
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={lot.lotNo} onChange={(e) => updateLot(lotIndex, "lotNo", e.target.value)} className="border rounded-xl px-3 py-2" placeholder="شماره لات" />
              <input type="date" value={lot.mfgDate} onChange={(e) => updateLot(lotIndex, "mfgDate", e.target.value)} className="border rounded-xl px-3 py-2" />
              <input type="date" value={lot.expDate} onChange={(e) => updateLot(lotIndex, "expDate", e.target.value)} className="border rounded-xl px-3 py-2" />
              <input type="number" min="0" step="any" value={lot.availableQty} onChange={(e) => updateLot(lotIndex, "availableQty", e.target.value)} className="border rounded-xl px-3 py-2" placeholder="موجودی" />

              <select value={lot.qtyUnit} onChange={(e) => updateLot(lotIndex, "qtyUnit", e.target.value)} className="border rounded-xl px-3 py-2 bg-white">
                <option value="KG">KG</option><option value="L">L</option><option value="PCS">PCS</option>
              </select>
              <input value={lot.originCountryText} onChange={(e) => updateLot(lotIndex, "originCountryText", e.target.value)} className="border rounded-xl px-3 py-2" placeholder="کشور (متنی)" />
              <input value={lot.manufacturerText} onChange={(e) => updateLot(lotIndex, "manufacturerText", e.target.value)} className="border rounded-xl px-3 py-2" placeholder="سازنده (متنی)" />
            </div>

            <div className="border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">فایل‌های COA</div>
                <button type="button" onClick={() => addLotCoaFile(lotIndex)} className="px-2 py-1 border rounded-lg text-xs">
                  + فایل
                </button>
              </div>

              {(lot.coaFiles || []).map((f, fileIndex) => {
                const currentUploadKey = `${lotIndex}-${fileIndex}`;
                const isUploading = uploadingKey === currentUploadKey;

                return (
                  <div key={fileIndex} className="border rounded-lg p-2 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <div className="md:col-span-2">
                        <label className="block mb-1 text-xs text-gray-600">انتخاب فایل</label>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadCoaFile(file, lotIndex, fileIndex);
                          }}
                          className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block mb-1 text-xs text-gray-600">URL فایل</label>
                        <input
                          value={f.url || ""}
                          onChange={(e) => updateLotCoaFile(lotIndex, fileIndex, "url", e.target.value)}
                          className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeLotCoaFile(lotIndex, fileIndex)}
                          className="w-full border rounded-lg px-2 py-1.5 text-sm text-red-600"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input value={f.mime || ""} onChange={(e) => updateLotCoaFile(lotIndex, fileIndex, "mime", e.target.value)} placeholder="mime" className="border rounded-lg px-2 py-1.5 text-xs" />
                      <input type="number" min="0" value={f.size || 0} onChange={(e) => updateLotCoaFile(lotIndex, fileIndex, "size", e.target.value)} placeholder="size" className="border rounded-lg px-2 py-1.5 text-xs" />
                      <input value={f.key || ""} onChange={(e) => updateLotCoaFile(lotIndex, fileIndex, "key", e.target.value)} placeholder="key" className="border rounded-lg px-2 py-1.5 text-xs" />
                      <div className="text-xs text-gray-500 flex items-center">
                        {isUploading ? "در حال آپلود..." : f.url ? "آپلود شد ✅" : "منتظر فایل"}
                      </div>
                    </div>

                    {f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                        مشاهده فایل
                      </a>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* توضیحات */}
      <section className="space-y-3">
        <h2 className="font-semibold">6) توضیحات فروشنده</h2>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border rounded-xl px-3 py-2" placeholder="توضیحات آگهی..." />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full border rounded-xl px-3 py-2" placeholder="یادداشت فروشنده..." />
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-50">
          {submitting ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت آگهی"}
        </button>
      </div>
    </form>
  );
}