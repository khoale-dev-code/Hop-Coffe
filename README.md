# ☕ F&B Coffee Menu

> **Website menu online cho quán cafe & F&B** — Khách mở bằng QR Code hoặc link, admin quản lý không cần code.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth%20%2B%20Storage-FFCA28?style=flat-square&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)

---

## ✨ Tổng quan

**F&B Coffee Menu** là ứng dụng web fullstack giúp chủ quán tạo menu online chuyên nghiệp. Khách truy cập qua QR Code hoặc link trực tiếp, admin quản lý toàn bộ qua dashboard mà không cần chỉnh code.

```
Menu khách:   https://your-domain.vercel.app/{shopSlug}
Admin panel:  https://your-domain.vercel.app/admin
```

---

## 🚀 Tính năng chính

### 👤 Phía khách hàng
- Xem danh mục, tìm kiếm và lọc món theo category
- Xem trạng thái còn bán / tạm hết realtime
- Xem khu vực món nổi bật (Best Seller)
- Xem banner khuyến mãi với popup chi tiết (ảnh + video)
- Gọi quán, chỉ đường Google Maps, nhắn Zalo chỉ 1 chạm
- Giao diện mobile-first, tối ưu UX điện thoại

### 🛠️ Phía Admin
- Đăng nhập bảo mật qua Firebase Auth
- Quản lý danh mục: tạo, sửa, ẩn/hiện, xóa
- Quản lý món: CRUD đầy đủ + upload ảnh lên Firebase Storage hoặc dán URL
- **Kéo thả** (DnD Kit) để sắp xếp thứ tự hiển thị
- Bật/tắt trạng thái món, đánh dấu món nổi bật
- Quản lý khuyến mãi: upload nhiều ảnh/video, thêm bằng URL, kéo thả sắp xếp media
- Thiết lập ngày bắt đầu/kết thúc cho từng chương trình khuyến mãi
- Cài đặt thông tin quán: logo, ảnh bìa, SĐT, Zalo, Google Maps, slug
- Bật/tắt public menu

---

## 🏗️ Kiến trúc & Tech Stack

```
src/
├── app/router.jsx          # React Router v7
├── pages/
│   ├── admin/              # Dashboard, Menu, Promotions, Settings, Login
│   └── public/             # MenuPage (trang khách)
├── services/               # Firestore CRUD (shop, category, item, promotion)
├── hooks/                  # useAuth, useShopMenu
├── layouts/                # AdminLayout (protected), PublicLayout
└── lib/firebase.js         # Firebase init
```

| Layer | Công nghệ |
|---|---|
| UI Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| File Storage | Firebase Storage |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Icons | Lucide React |
| Deploy | Vercel |

---

## 🗄️ Data Model (Firestore)

```
shops/{shopId}
  ├── categories/{categoryId}   # name, order, isActive
  ├── items/{itemId}            # name, price, oldPrice, imageUrl, isAvailable, isFeatured, order, tags
  └── promotions/{promotionId}  # title, media[], startAt, endAt, isActive, order
```

Mỗi `promotion` hỗ trợ mảng `media[]` gồm nhiều ảnh/video với đầy đủ metadata (url, type, name, mimeType, size).

---

## ⚡ Quick Start

```bash
git clone https://github.com/khoale-dev-code/F-and-B-Coffe.git
cd F-and-B-Coffe
npm install
```

Tạo file `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_DEFAULT_SHOP_ID=demo-shop
```

```bash
npm run dev      # Development
npm run build    # Production build
```

---

## 🔐 Firebase Security Rules

**Firestore** — Public chỉ đọc được khi shop `isPublished = true`, write yêu cầu đăng nhập.  
**Storage** — Public read (ảnh/video hiển thị tự do), write yêu cầu đăng nhập.

---

## 📦 Deploy

Project deploy trên **Vercel** với `vercel.json` cấu hình rewrite toàn bộ route về `index.html` để React Router hoạt động đúng khi refresh.

---

## 📌 Roadmap

- [ ] Multi-shop support với phân quyền theo từng shop
- [ ] Dashboard thống kê lượt xem menu
- [ ] Tạo QR Code trực tiếp trong admin
- [ ] Tùy chỉnh theme màu theo thương hiệu
- [ ] Hỗ trợ size / topping cho từng món
- [ ] Đặt món online

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/khoale-dev-code">khoale-dev-code</a></sub>
</div>