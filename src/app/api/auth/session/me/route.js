export async function PATCH(req) {
  await connectToDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyAccessToken(token);
  if (!payload?.sub) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // ✅ فقط این‌ها مجازند
  const updateData = {};

  if (body.accountType !== undefined) updateData.accountType = body.accountType;
  if (body.nationalCode !== undefined) updateData.nationalCode = String(body.nationalCode).trim();
  if (body.iban !== undefined) updateData.iban = String(body.iban).trim();
  if (body.avatar !== undefined) updateData.avatar = String(body.avatar).trim();

  if (body.legalInfo && typeof body.legalInfo === "object") {
    const li = body.legalInfo;
    if (li.companyName !== undefined) updateData["legalInfo.companyName"] = String(li.companyName).trim();
    if (li.companyNationalId !== undefined) updateData["legalInfo.companyNationalId"] = String(li.companyNationalId).trim();
    if (li.registrationNo !== undefined) updateData["legalInfo.registrationNo"] = String(li.registrationNo).trim();
    if (li.economicCode !== undefined) updateData["legalInfo.economicCode"] = String(li.economicCode).trim();
  }

  // ✅ validate accountType
  if (updateData.accountType && !["REAL", "LEGAL"].includes(updateData.accountType)) {
    return NextResponse.json({ success: false, message: "invalid accountType" }, { status: 400 });
  }

  // گرفتن user فعلی برای enforce قوانین
  const user = await UserModel.findById(payload.sub).select("_id accountType legalInfo");
  if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

  const effectiveAccountType = updateData.accountType || user.accountType;

  // اگر LEGAL شد، companyName اجباری
  if (effectiveAccountType === "LEGAL") {
    const companyName =
      (updateData["legalInfo.companyName"] ?? user.legalInfo?.companyName ?? "").toString().trim();
    if (!companyName) {
      return NextResponse.json(
        { success: false, message: "companyName is required for LEGAL accounts", field: "legalInfo.companyName" },
        { status: 400 }
      );
    }
  }

  // اگر REAL شد، legalInfo پاکسازی (اختیاری)
  if (updateData.accountType === "REAL") {
    updateData["legalInfo.companyName"] = "";
    updateData["legalInfo.companyNationalId"] = "";
    updateData["legalInfo.registrationNo"] = "";
    updateData["legalInfo.economicCode"] = "";
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    payload.sub,
    { $set: updateData },
    {
      new: true,
      select: "_id phone email role firstName lastName accountType iban nationalCode chemaiCode legalInfo avatar",
    }
  );

  return NextResponse.json({ success: true, message: "Updated", data: updatedUser }, { status: 200 });
}