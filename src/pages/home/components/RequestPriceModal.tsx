import { useEffect, useRef, useState, type FormEvent } from "react";

interface RequestPriceModalProps {
  onClose: () => void;
}

const pistachioTypes = [
  "اکبری",
  "احمد آقایی",
  "فندقی",
  "کله قوچی",
  "بادامی",
  "مغز پسته",
];

const pistachioSizes = [
  "۲۶-۲۸",
  "۲۸-۳۰",
  "۳۰-۳۲",
  "۳۲-۳۴",
];

interface FormDataState {
  pistachio_type: string;
  pistachio_size: string;
  dahan_bast: string;
  kejo_nokhod: string;
  touchin: string;
  pistachio_image: File | null;
  full_name: string;
  loading_location: string;
  phone: string;
}

export default function RequestPriceModal({ onClose }: RequestPriceModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataState>({
    pistachio_type: "",
    pistachio_size: "",
    dahan_bast: "",
    kejo_nokhod: "",
    touchin: "",
    pistachio_image: null,
    full_name: "",
    loading_location: "",
    phone: "",
  });

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) handleClose();
  }

  function updateField(field: keyof FormDataState, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pistachio_image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function handleRemoveImage() {
    setFormData((prev) => ({ ...prev, pistachio_image: null }));
    setImagePreview(null);
  }

  function canGoNext(): boolean {
    return (
      formData.pistachio_type !== "" &&
      formData.pistachio_size !== "" &&
      formData.dahan_bast !== "" &&
      formData.kejo_nokhod !== "" &&
      formData.touchin !== ""
    );
  }

  function canSubmit(): boolean {
    return formData.full_name !== "" && formData.loading_location !== "" && formData.phone !== "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit()) return;

    const payload = new URLSearchParams();
    payload.append("pistachio_type", formData.pistachio_type);
    payload.append("pistachio_size", formData.pistachio_size);
    payload.append("dahan_bast", `${formData.dahan_bast}%`);
    payload.append("kejo_nokhod", `${formData.kejo_nokhod}%`);
    payload.append("touchin", `${formData.touchin}%`);
    payload.append("full_name", formData.full_name);
    payload.append("loading_location", formData.loading_location);
    payload.append("phone", formData.phone);
    if (formData.pistachio_image) {
      payload.append("has_image", "بله");
    }

    try {
      await fetch("https://readdy.ai/api/form/d8t42qob9jno5e72bh30", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString(),
      });
    } catch {
      // silently handle
    }
    setSubmitted(true);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div
        className={`w-full max-w-xl max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <i className="ri-price-tag-3-line w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-emerald-600"></i>
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-900">
                استعلام قیمت آنلاین
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line w-4 h-4 md:w-5 md:h-5 flex items-center justify-center"></i>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 px-4 pt-3 pb-1 flex-shrink-0">
          <div
            className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs font-bold transition-all ${
              step >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            ۱
          </div>
          <div
            className={`w-8 md:w-10 h-0.5 rounded transition-all ${
              step >= 2 ? "bg-emerald-500" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs font-bold transition-all ${
              step >= 2 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            ۲
          </div>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="px-4 md:px-6 py-8 md:py-10 text-center overflow-y-auto flex-1">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
              <i className="ri-check-line w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-emerald-600"></i>
            </div>
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
              درخواست شما با موفقیت ثبت شد!
            </h4>
            <p className="text-xs md:text-sm text-gray-500 mb-5 md:mb-6">
              اطلاعات پسته شما دریافت شد. کارشناسان ما به زودی با شما تماس می‌گیرند و قیمت دقیق رو اعلام می‌کنند.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              باشه، ممنون
            </button>
          </div>
        ) : step === 1 ? (
          /* ---- STEP 1: مشخصات پسته ---- */
          <div className="px-4 md:px-6 py-4 md:py-5 overflow-y-auto flex-1">
            <h4 className="text-base md:text-xl font-black text-gray-900 text-center mb-4 md:mb-5">
              مشخصات پسته
            </h4>

            <div className="space-y-3 md:space-y-4">
              {/* Row 1: رقم پسته + انس پسته */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                    رقم پسته <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.pistachio_type}
                    onChange={(e) => updateField("pistachio_type", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left 0.75rem center",
                      backgroundSize: "16px 12px",
                    }}
                  >
                    <option value="">انتخاب کنید</option>
                    {pistachioTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                    انس پسته <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.pistachio_size}
                    onChange={(e) => updateField("pistachio_size", e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left 0.75rem center",
                      backgroundSize: "16px 12px",
                    }}
                  >
                    <option value="">انتخاب کنید</option>
                    {pistachioSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: درصد دهن بست + درصد کجو و نخودو + درصد توچین */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                    درصد دهن بست <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.dahan_bast}
                      onChange={(e) => updateField("dahan_bast", e.target.value)}
                      required
                      placeholder="٪"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                    درصد کجو و نخودو <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.kejo_nokhod}
                      onChange={(e) => updateField("kejo_nokhod", e.target.value)}
                      required
                      placeholder="٪"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                    درصد توچین <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.touchin}
                      onChange={(e) => updateField("touchin", e.target.value)}
                      required
                      placeholder="٪"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                  عکس پسته
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-emerald-200 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="پیش‌نمایش عکس پسته"
                      className="w-full h-36 md:h-44 object-contain bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                    >
                      <i className="ri-close-line w-3.5 h-3.5 md:w-4 md:h-4 flex items-center justify-center"></i>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-28 md:h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center gap-1.5 md:gap-2">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-all">
                        <i className="ri-image-add-line w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-all"></i>
                      </div>
                      <span className="text-[11px] md:text-xs text-gray-400 group-hover:text-emerald-600 transition-all font-medium">
                        برای آپلود عکس کلیک کنید
                      </span>
                      <span className="text-[10px] text-gray-300">
                        PNG, JPG تا ۵ مگابایت
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="button"
                disabled={!canGoNext()}
                onClick={() => setStep(2)}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                  canGoNext()
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                ادامه
                <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center"></i>
              </button>
            </div>
          </div>
        ) : (
          /* ---- STEP 2: اطلاعات تماس ---- */
          <form
            data-readdy-form
            onSubmit={handleSubmit}
            className="px-4 md:px-6 py-4 md:py-5 space-y-3 md:space-y-4 overflow-y-auto flex-1"
          >
            <h4 className="text-sm md:text-base font-bold text-gray-900 text-center">
              اطلاعات تماس
            </h4>
            <p className="text-[11px] md:text-xs text-gray-400 text-center -mt-1.5 md:-mt-2">
              این اطلاعات برای ارسال قیمت دقیق به شما استفاده می‌شود
            </p>

            {/* Honeypot */}
            <input
              type="text"
              name="company_alt"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute opacity-0 pointer-events-none"
            />

            {/* Name */}
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                نام و نام خانوادگی <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                required
                placeholder="نام خود را وارد کنید"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
              />
            </div>

            {/* Loading Location */}
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                محل بار <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="loading_location"
                value={formData.loading_location}
                onChange={(e) => updateField("loading_location", e.target.value)}
                required
                placeholder="شهر / استان محل بارگیری"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] md:text-xs font-semibold text-gray-700 mb-1 md:mb-1.5">
                شماره همراه <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all text-left dir-ltr"
              />
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-shrink-0 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 md:gap-2"
              >
                <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center"></i>
                بازگشت
              </button>
              <button
                type="submit"
                disabled={!canSubmit()}
                className={`flex-1 py-2.5 md:py-3 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 md:gap-2 ${
                  canSubmit()
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <i className="ri-send-plane-line w-4 h-4 flex items-center justify-center"></i>
                ارسال درخواست
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              اطلاعات شما محفوظ می‌ماند و فقط برای اعلام قیمت استفاده می‌شود.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}