import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Globe2,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Save,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "../../lib/firebase";

import {
  DEFAULT_SHOP_ID,
  getShopById,
  saveShopSettings,
} from "../../services/shopService";

import { useAuth } from "../../hooks/useAuth";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  address: "",
  phone: "",
  zaloUrl: "",
  facebookUrl: "",
  googleMapUrl: "",
  logoUrl: "",
  coverUrl: "",
  isPublished: false,
  theme: "light",
};

function createSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanFileName(name = "image") {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-.]/g, "");
}

async function uploadShopImage(shopId, file, type = "image") {
  if (!shopId || !file) return "";

  const fileName = `${Date.now()}-${cleanFileName(file.name)}`;

  const fileRef = ref(storage, `shops/${shopId}/settings/${type}/${fileName}`);

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
}

export default function SettingsPage() {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        setError("");

        const shop = await getShopById(DEFAULT_SHOP_ID);

        if (shop) {
          setForm({
            name: shop.name || "",
            slug: shop.slug || "",
            description: shop.description || "",
            address: shop.address || "",
            phone: shop.phone || "",
            zaloUrl: shop.zaloUrl || "",
            facebookUrl: shop.facebookUrl || "",
            googleMapUrl: shop.googleMapUrl || "",
            logoUrl: shop.logoUrl || "",
            coverUrl: shop.coverUrl || "",
            isPublished: Boolean(shop.isPublished),
            theme: shop.theme || "light",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin quán.");
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, []);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNameChange(value) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || createSlug(value),
    }));
  }

  async function handleUploadImage(event, fieldName) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn đúng file hình ảnh.");
      return;
    }

    const isLogo = fieldName === "logoUrl";

    try {
      setMessage("");
      setError("");

      if (isLogo) {
        setUploadingLogo(true);
      } else {
        setUploadingCover(true);
      }

      const url = await uploadShopImage(
        DEFAULT_SHOP_ID,
        file,
        isLogo ? "logo" : "cover"
      );

      updateField(fieldName, url);

      setMessage(
        isLogo
          ? "Đã tải logo lên thành công. Nhớ bấm Lưu cài đặt."
          : "Đã tải ảnh bìa lên thành công. Nhớ bấm Lưu cài đặt."
      );
    } catch (err) {
      console.error(err);
      setError("Không thể tải hình lên. Vui lòng kiểm tra Firebase Storage.");
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await saveShopSettings(DEFAULT_SHOP_ID, {
        ...form,
        ownerUid: user?.uid,
      });

      setMessage("Đã lưu thông tin quán thành công.");
    } catch (err) {
      console.error(err);
      setError("Không thể lưu thông tin quán.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSettings />;

  const publicUrl =
    form.slug && typeof window !== "undefined"
      ? `${window.location.origin}/${form.slug}`
      : "";

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader publicUrl={publicUrl} isPublished={form.isPublished} />

      <NoticeBox message={message} error={error} />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]"
      >
        <div className="space-y-4">
          <FormSection title="Thông tin quán" icon={Store}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Tên quán"
                value={form.name}
                onChange={handleNameChange}
                placeholder="Ví dụ: Hớp Coffee"
                required
              />

              <Input
                label="Slug đường dẫn"
                value={form.slug}
                onChange={(value) => updateField("slug", createSlug(value))}
                placeholder="hop-coffee"
                required
              />

              <Input
                label="Số điện thoại"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="090..."
              />

              <Input
                label="Địa chỉ"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                placeholder="Địa chỉ quán"
              />
            </div>

            <TextArea
              label="Mô tả quán"
              value={form.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Mô tả ngắn về quán..."
              rows={4}
            />
          </FormSection>

          <FormSection title="Liên kết và mạng xã hội" icon={Globe2}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Link Google Maps"
                value={form.googleMapUrl}
                onChange={(value) => updateField("googleMapUrl", value)}
                placeholder="https://maps.google.com/..."
              />

              <Input
                label="Link Zalo"
                value={form.zaloUrl}
                onChange={(value) => updateField("zaloUrl", value)}
                placeholder="https://zalo.me/..."
              />

              <Input
                label="Link Facebook"
                value={form.facebookUrl}
                onChange={(value) => updateField("facebookUrl", value)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </FormSection>

          <FormSection title="Hình ảnh thương hiệu" icon={ImagePlus}>
            <div className="grid gap-4 md:grid-cols-2">
              <ImageUrlInput
                label="Logo URL"
                value={form.logoUrl}
                onChange={(value) => updateField("logoUrl", value)}
                onClear={() => updateField("logoUrl", "")}
                onUpload={(event) => handleUploadImage(event, "logoUrl")}
                uploading={uploadingLogo}
                placeholder="Dán link ảnh logo hoặc tải từ máy"
              />

              <ImageUrlInput
                label="Cover URL"
                value={form.coverUrl}
                onChange={(value) => updateField("coverUrl", value)}
                onClear={() => updateField("coverUrl", "")}
                onUpload={(event) => handleUploadImage(event, "coverUrl")}
                uploading={uploadingCover}
                placeholder="Dán link ảnh bìa hoặc tải từ máy"
              />
            </div>

            <div className="rounded-[10px] border border-dashed border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-800">
                Gợi ý kích thước ảnh
              </p>

              <div className="mt-2 grid gap-2 text-sm font-medium leading-6 text-neutral-500 sm:grid-cols-2">
                <p>Logo: ảnh vuông, nền trong hoặc nền trắng.</p>
                <p>Cover: ảnh ngang tỷ lệ 16:9, rõ nét trên điện thoại.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[150px_1fr]">
              <PreviewBox
                label="Logo"
                imageUrl={form.logoUrl}
                className="aspect-square"
              />

              <PreviewBox
                label="Cover"
                imageUrl={form.coverUrl}
                className="aspect-[16/9]"
              />
            </div>
          </FormSection>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <FormSection title="Trạng thái public" icon={CheckCircle2}>
            <ToggleCard
              checked={form.isPublished}
              onChange={(checked) => updateField("isPublished", checked)}
              title="Public menu"
              description="Bật mục này thì khách mới xem được menu theo slug."
            />

            <PublicLinkBox publicUrl={publicUrl} />

            <div className="rounded-[10px] border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-black text-neutral-950">
                Thông tin hiển thị nhanh
              </p>

              <div className="mt-3 space-y-3">
                <InfoLine icon={Store} label={form.name || "Chưa có tên quán"} />
                <InfoLine
                  icon={Phone}
                  label={form.phone || "Chưa có số điện thoại"}
                />
                <InfoLine
                  icon={MapPin}
                  label={form.address || "Chưa có địa chỉ"}
                />
              </div>
            </div>
          </FormSection>

          <div className="sticky bottom-3 z-20 rounded-[12px] bg-white/95 pt-2 backdrop-blur lg:static lg:bg-transparent lg:pt-0">
            <button
              disabled={saving || uploadingLogo || uploadingCover}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 lg:py-3 lg:shadow-none"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function PageHeader({ publicUrl, isPublished }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-black text-neutral-950 sm:text-3xl">
            Cài đặt thông tin quán
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Thông tin này sẽ hiển thị ở trang menu public cho khách hàng.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span
            className={[
              "inline-flex w-fit items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-black",
              isPublished
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500",
            ].join(" ")}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {isPublished ? "Đang public" : "Chưa public"}
          </span>

          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-900 transition hover:bg-neutral-50"
            >
              <ExternalLink size={17} />
              Xem menu
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
        {Icon && <Icon size={18} className="text-neutral-500" />}

        <h2 className="text-base font-black text-neutral-950">{title}</h2>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ImageUrlInput({
  label,
  value,
  onChange,
  onClear,
  onUpload,
  uploading,
  placeholder,
}) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <div className="mt-2 overflow-hidden rounded-[10px] border border-neutral-200 bg-white">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full border-b border-neutral-100 px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:bg-neutral-50"
        />

        <div className="grid grid-cols-2 gap-2 p-2">
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-3 text-xs font-black uppercase tracking-[0.06em] text-white transition hover:bg-neutral-800">
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}

            {uploading ? "Đang tải..." : "Chọn ảnh"}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={onUpload}
            />
          </label>

          <button
            type="button"
            onClick={onClear}
            disabled={!value || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-3 text-xs font-black uppercase tracking-[0.06em] text-neutral-600 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            Xóa ảnh
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicLinkBox({ publicUrl }) {
  if (!publicUrl) {
    return (
      <div className="rounded-[10px] border border-dashed border-neutral-300 bg-neutral-50 p-4">
        <p className="text-sm font-bold text-neutral-500">
          Nhập slug để tạo link menu.
        </p>
      </div>
    );
  }

  return (
    <a
      href={publicUrl}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[10px] border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-neutral-950 text-white">
          <ExternalLink size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-neutral-950">
            Link menu khách hàng
          </p>

          <p className="mt-1 break-all text-sm leading-6 text-neutral-500">
            {publicUrl}
          </p>
        </div>
      </div>
    </a>
  );
}

function ToggleCard({ checked, onChange, title, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-neutral-200 bg-white p-4 transition hover:border-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0"
      />

      <span>
        <span className="block text-sm font-black text-neutral-950">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-neutral-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function PreviewBox({ label, imageUrl, className = "" }) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-neutral-800">{label}</p>

      <div
        className={[
          "overflow-hidden rounded-[10px] border border-neutral-200 bg-neutral-50",
          className,
        ].join(" ")}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="grid h-full min-h-[130px] place-items-center text-neutral-400">
            <div className="text-center">
              <ImagePlus size={30} className="mx-auto" />
              <p className="mt-2 text-xs font-bold">Chưa có ảnh</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoLine({ icon: Icon, label }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-neutral-600">
      <Icon size={16} className="shrink-0 text-neutral-400" />

      <span className="line-clamp-1 font-bold">{label}</span>
    </div>
  );
}

function NoticeBox({ message, error }) {
  if (!message && !error) return null;

  return (
    <div className="space-y-3">
      {message && (
        <div className="rounded-[8px] border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function LoadingSettings() {
  return (
    <div className="space-y-4">
      <div className="rounded-[12px] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-neutral-100" />
        <div className="mt-3 h-8 w-72 max-w-full animate-pulse rounded bg-neutral-100" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-[12px] bg-neutral-100" />
          <div className="h-56 animate-pulse rounded-[12px] bg-neutral-100" />
        </div>

        <div className="h-72 animate-pulse rounded-[12px] bg-neutral-100" />
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full resize-none rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}

function Input({ label, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}