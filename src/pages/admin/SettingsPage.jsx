import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
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

export default function SettingsPage() {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);

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

  if (loading) {
    return <p className="text-neutral-500">Đang tải cài đặt quán...</p>;
  }

  const publicUrl = form.slug ? `${window.location.origin}/${form.slug}` : "";

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Settings
        </p>
        <h1 className="mt-1 text-3xl font-black">Cài đặt thông tin quán</h1>
        <p className="mt-2 text-neutral-500">
          Thông tin này sẽ hiển thị ở trang menu public.
        </p>
      </div>

      {message && (
        <div className="mt-5 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Tên quán"
            value={form.name}
            onChange={handleNameChange}
            placeholder="Ví dụ: Cafe Sữa Đá"
            required
          />

          <Input
            label="Slug đường dẫn"
            value={form.slug}
            onChange={(value) => updateField("slug", createSlug(value))}
            placeholder="cafe-sua-da"
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

          <Input
            label="Logo URL"
            value={form.logoUrl}
            onChange={(value) => updateField("logoUrl", value)}
            placeholder="Dán link ảnh logo"
          />

          <div className="md:col-span-2">
            <Input
              label="Cover URL"
              value={form.coverUrl}
              onChange={(value) => updateField("coverUrl", value)}
              placeholder="Dán link ảnh bìa"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold">Mô tả quán</label>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Mô tả ngắn về quán..."
              rows={4}
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) =>
              updateField("isPublished", event.target.checked)
            }
            className="h-5 w-5"
          />

          <div>
            <p className="font-semibold">Public menu</p>
            <p className="text-sm text-neutral-500">
              Bật mục này thì khách mới xem được menu theo slug.
            </p>
          </div>
        </label>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-950"
            >
              <ExternalLink size={16} />
              {publicUrl}
            </a>
          ) : (
            <p className="text-sm text-neutral-400">
              Nhập slug để tạo link menu.
            </p>
          )}

          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
      />
    </div>
  );
}