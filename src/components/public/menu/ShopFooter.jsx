import { Coffee, ExternalLink, MapPin, Phone } from "lucide-react";

export default function ShopFooter({ shop }) {
  return (
    <footer
      id="about"
      className="border-t border-[#EEE3D8] bg-[#2F221C] px-4 pb-28 pt-10 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-[12px] bg-white">
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name || "Logo"}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <Coffee size={24} className="text-[#6B4B3E]" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black">{shop?.name || "Hớp"}</h2>
              <p className="text-sm font-bold text-white/45">
                Coffee · Tea · Drinks
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
            {shop?.description ||
              "Menu online giúp khách xem sản phẩm nhanh hơn, rõ giá hơn và dễ liên hệ với quán."}
          </p>
        </div>

        <div>
          <p className="font-black">Liên hệ</p>

          <div className="mt-4 space-y-3 text-sm text-white/65">
            {shop?.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="flex items-center gap-2 hover:text-white"
              >
                <Phone size={16} />
                {shop.phone}
              </a>
            )}

            {shop?.address && (
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                {shop.address}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="font-black">Liên kết</p>

          <div className="mt-4 grid gap-2 text-sm font-bold text-white/65">
            <a href="#menu" className="hover:text-white">
              Sản phẩm
            </a>

            <a href="#promotions" className="hover:text-white">
              Khuyến mãi
            </a>

            {shop?.facebookUrl && (
              <a
                href={shop.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <ExternalLink size={16} />
                Facebook
              </a>
            )}

            {shop?.zaloUrl && (
              <a
                href={shop.zaloUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <ExternalLink size={16} />
                Zalo
              </a>
            )}

            {shop?.googleMapUrl && (
              <a
                href={shop.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-white"
              >
                <ExternalLink size={16} />
                Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}