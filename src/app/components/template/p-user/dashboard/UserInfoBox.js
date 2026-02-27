"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CiUser,
  CiPhone,
  CiMail,
  CiCreditCard1,
  CiLock,
  CiSettings,
  CiCircleInfo,
  CiVault,
  CiMoneyCheck1  
} from "react-icons/ci";
import { showSwal } from "@/utils/helpers";
import { validatePassword } from "@/utils/auth-client";

const fields = [
  { icon: CiUser, label: "نام و نام خانوادگی", key: ["firstName", "lastName"] },
  { icon: CiPhone, label: "شماره تماس", key: "phone" },
  { icon: CiMoneyCheck1, label: "کد ملی", key: "nationalCode" },
  { icon: CiCreditCard1, label: "شماره شبا", key: "iban", fallback: "-" },
  { icon: CiVault, label: "کما کد (کد یکتا)", key: "chemaiCode" },
  { icon: CiMail, label: "آدرس ایمیل", key: "email" },
];

function getFieldValue(user, key, fallback = "-") {
  if (!user) return fallback;
  if (key == null) return fallback;
  if (key === "-" || key === "") return fallback;

  if (Array.isArray(key)) {
    const combined = key
      .map((k) => user?.[k])
      .filter((v) => v != null && String(v).trim() !== "")
      .join(" ");
    return combined || fallback;
  }

  const value = user?.[key];
  if (value == null) return fallback;

  const str = String(value).trim();
  return str !== "" ? str : fallback;
}

function ReadOnlyRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className="break-words text-sm font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  dir = "rtl",
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-gray-500">{label}</p>
      <input
        dir={dir}
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-2 text-primary">
          <Icon size={20} />
          <p className="font-semibold">{title}</p>
        </div>
        {subtitle ? <p className="mt-1 text-xs text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function UserInfoBox({ user }) {
  const computedFields = useMemo(() => fields, []);
  const [open, setOpen] = useState(false);
  const modalCardRef = useRef(null);

  const [localUser, setLocalUser] = useState(user);

  // ---- modal states (profile) ----
  const [accountType, setAccountType] = useState("REAL");
  const [nationalCode, setNationalCode] = useState("");
  const [iban, setIban] = useState("");
  const [avatar, setAvatar] = useState("");
  const [legalInfo, setLegalInfo] = useState({
    companyName: "",
    companyNationalId: "",
    registrationNo: "",
    economicCode: "",
  });

  // ---- modal states (security) ----
  const [hasPassword, setHasPassword] = useState(false);
  const [newPasswordSet, setNewPasswordSet] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordChange, setNewPasswordChange] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  // وقتی مودال باز می‌شود، فرم‌ها از user پر شوند
  useEffect(() => {
    if (!open) return;

    setAccountType(localUser?.accountType || "REAL");
    setNationalCode(localUser?.nationalCode || "");
    setIban(localUser?.iban || "");
    setAvatar(localUser?.avatar || "");

    setLegalInfo({
      companyName: localUser?.legalInfo?.companyName || "",
      companyNationalId: localUser?.legalInfo?.companyNationalId || "",
      registrationNo: localUser?.legalInfo?.registrationNo || "",
      economicCode: localUser?.legalInfo?.economicCode || "",
    });

    setNewPasswordSet("");
    setCurrentPassword("");
    setNewPasswordChange("");

    const loadHasPassword = async () => {
      try {
        if (localUser?.hasPassword !== undefined) {
          setHasPassword(!!localUser.hasPassword);
          return;
        }
        const res = await fetch("/api/auth/session/me");
        const data = await res.json().catch(() => ({}));
        if (data?.success) setHasPassword(!!data?.data?.hasPassword);
      } catch {
        // silent
      }
    };

    loadHasPassword();
  }, [open, localUser]);

  // ESC + قفل اسکرول صفحه
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const normalizePasswordValidation = (result) => {
    // خروجی validatePassword ممکنه boolean یا string یا object باشه
    if (typeof result === "boolean") {
      return { valid: result, message: result ? "" : "رمز عبور معتبر نیست" };
    }

    if (typeof result === "string") {
      return { valid: false, message: result };
    }

    if (result && typeof result === "object") {
      const valid =
        result.valid ??
        result.isValid ??
        result.ok ??
        false;

      const message =
        result.message ||
        result.error ||
        result.reason ||
        (valid ? "" : "رمز عبور معتبر نیست");

      return { valid: !!valid, message };
    }

    return { valid: false, message: "خطا در بررسی رمز عبور" };
  };

  const validatePasswordInput = (password) => {
    if (!password) {
      return { valid: false, message: "رمز عبور را وارد کنید" };
    }

    const result = validatePassword(password);
    const normalized = normalizePasswordValidation(result);

    // اگر helper شما فقط طول را چک نکند، این fallback کمک می‌کند
    if (normalized.valid && password.length < 8) {
      return { valid: false, message: "رمز عبور باید حداقل ۸ کاراکتر باشد" };
    }

    return normalized;
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        accountType,
        nationalCode: nationalCode || undefined,
        iban: iban || undefined,
        avatar: avatar || undefined,
        legalInfo: accountType === "LEGAL" ? legalInfo : undefined,
      };

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showSwal(data?.message || "خطا در ذخیره اطلاعات", "error", "باشه");
        return;
      }

      setLocalUser((prev) => ({ ...prev, ...data.data }));
      showSwal("اطلاعات با موفقیت ذخیره شد", "success", "باشه");
      setOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const setPassword = async () => {
    const check = validatePasswordInput(newPasswordSet);
    if (!check.valid) {
      return showSwal(check.message || "رمز عبور معتبر نیست", "error", "باشه");
    }

    setSavingPass(true);
    try {
      const res = await fetch("/api/auth/password/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPasswordSet }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return showSwal(data?.message || "خطا در تنظیم رمز", "error", "باشه");

      showSwal("رمز عبور با موفقیت تنظیم شد", "success", "باشه");
      setHasPassword(true);
      setNewPasswordSet("");
    } finally {
      setSavingPass(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword) {
      return showSwal("رمز فعلی را وارد کنید", "error", "باشه");
    }

    const check = validatePasswordInput(newPasswordChange);
    if (!check.valid) {
      return showSwal(check.message || "رمز جدید معتبر نیست", "error", "باشه");
    }

    setSavingPass(true);
    try {
      const res = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: newPasswordChange }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return showSwal(data?.message || "خطا در تغییر رمز", "error", "باشه");

      showSwal("رمز عبور با موفقیت تغییر کرد", "success", "باشه");
      setCurrentPassword("");
      setNewPasswordChange("");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white">
      {/* هدر */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-primary md:text-xl">
          مشخصات و اطلاعات تماس
        </h2>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 md:px-5 md:py-2"
        >
          ویرایش اطلاعات
        </button>
      </div>

      {/* محتوا */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {computedFields.map((item) => {
          const Icon = item.icon;
          const value = getFieldValue(localUser, item.key, item.fallback ?? "-");

          return (
            <div
              key={item.label}
              className="flex w-full flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-1 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>

              <span className="break-words text-base font-semibold text-black md:text-lg">
                {value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[1000]">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* wrapper */}
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            <div
              ref={modalCardRef}
              className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/40 bg-white shadow-2xl"
              style={{ maxHeight: "calc(100dvh - 16px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 p-4 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-primary md:text-lg">
                      ویرایش اطلاعات کاربری
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <CiCircleInfo size={16} />
                      <span>شماره، ایمیل، نام و کمای‌کد قابل تغییر نیستند.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50"
                  >
                    بستن
                  </button>
                </div>
              </div>

              {/* body scrollable */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                <div className="space-y-4">
                  {/* Read-only account */}
                  <SectionCard
                    icon={CiSettings}
                    title="حساب (فقط خواندنی)"
                    subtitle="این اطلاعات از سمت سیستم ثبت شده و قابل ویرایش نیست."
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <ReadOnlyRow
                        label="نام و نام خانوادگی"
                        value={`${localUser?.firstName || ""} ${localUser?.lastName || ""}`.trim()}
                      />
                      <ReadOnlyRow label="شماره تماس" value={localUser?.phone} />
                      <ReadOnlyRow label="ایمیل" value={localUser?.email} />
                      <ReadOnlyRow label="کمای‌کد" value={localUser?.chemaiCode} />
                    </div>
                  </SectionCard>

                  {/* Editable profile */}
                  <SectionCard
                    icon={CiSettings}
                    title="پروفایل (قابل ویرایش)"
                    subtitle="اطلاعات حساب حقیقی/حقوقی، شبا و آواتار را اینجا بروزرسانی کنید."
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="text-sm text-gray-600">نوع حساب:</span>
                        <select
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-auto"
                        >
                          <option value="REAL">حقیقی</option>
                          <option value="LEGAL">حقوقی</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field
                          label="شماره شبا"
                          value={iban}
                          onChange={setIban}
                          placeholder="IR..."
                          dir="ltr"
                          hint="مثال: IR1234567890..."
                        />
                        <Field
                          label="آواتار (URL)"
                          value={avatar}
                          onChange={setAvatar}
                          placeholder="https://..."
                          dir="ltr"
                        />
                      </div>

                      {accountType === "REAL" ? (
                        <Field
                          label="کد ملی"
                          value={nationalCode}
                          onChange={setNationalCode}
                          placeholder="کد ملی"
                          dir="ltr"
                        />
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field
                            label="نام شرکت (اجباری)"
                            value={legalInfo.companyName}
                            onChange={(v) => setLegalInfo((p) => ({ ...p, companyName: v }))}
                            placeholder="نام شرکت"
                          />
                          <Field
                            label="شناسه ملی"
                            value={legalInfo.companyNationalId}
                            onChange={(v) =>
                              setLegalInfo((p) => ({ ...p, companyNationalId: v }))
                            }
                            placeholder="شناسه ملی"
                            dir="ltr"
                          />
                          <Field
                            label="شماره ثبت"
                            value={legalInfo.registrationNo}
                            onChange={(v) => setLegalInfo((p) => ({ ...p, registrationNo: v }))}
                            placeholder="شماره ثبت"
                            dir="ltr"
                          />
                          <Field
                            label="کد اقتصادی"
                            value={legalInfo.economicCode}
                            onChange={(v) => setLegalInfo((p) => ({ ...p, economicCode: v }))}
                            placeholder="کد اقتصادی"
                            dir="ltr"
                          />
                        </div>
                      )}

                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 sm:w-auto"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={savingProfile}
                          className="w-full rounded-xl bg-primary px-4 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                          {savingProfile ? "در حال ذخیره..." : "ذخیره اطلاعات"}
                        </button>
                      </div>
                    </div>
                  </SectionCard>

                  {/* Security */}
                  <SectionCard
                    icon={CiLock}
                    title="امنیت"
                    subtitle="رمز عبور را تنظیم یا تغییر دهید."
                  >
                    {!hasPassword ? (
                      <div className="space-y-3">
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          شما هنوز رمز عبور تنظیم نکرده‌اید. برای ورود با رمز، همینجا تنظیم کنید.
                        </div>

                        <Field
                          label="رمز جدید"
                          type="password"
                          value={newPasswordSet}
                          onChange={setNewPasswordSet}
                          placeholder="حداقل ۸ کاراکتر"
                          hint="رمز عبور با validatePassword بررسی می‌شود."
                          dir="ltr"
                        />

                        <button
                          type="button"
                          onClick={setPassword}
                          disabled={savingPass}
                          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingPass ? "در حال ثبت..." : "تنظیم رمز عبور"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Field
                          label="رمز فعلی"
                          type="password"
                          value={currentPassword}
                          onChange={setCurrentPassword}
                          placeholder="رمز فعلی"
                          dir="ltr"
                        />
                        <Field
                          label="رمز جدید"
                          type="password"
                          value={newPasswordChange}
                          onChange={setNewPasswordChange}
                          placeholder="حداقل ۸ کاراکتر"
                          hint="رمز جدید با validatePassword بررسی می‌شود."
                          dir="ltr"
                        />

                        <button
                          type="button"
                          onClick={changePassword}
                          disabled={savingPass}
                          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingPass ? "در حال تغییر..." : "تغییر رمز عبور"}
                        </button>
                      </div>
                    )}
                  </SectionCard>
                </div>
              </div>

              {/* footer */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur md:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    تغییر شماره/ایمیل از طریق پشتیبانی انجام می‌شود.
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}