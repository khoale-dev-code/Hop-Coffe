# F&B Coffee Menu

Website menu online dành cho quán cafe, tiệm nước, trà sữa hoặc đồ ăn vặt.  
Khách có thể mở menu bằng QR Code, Google Maps hoặc đường link public để xem sản phẩm, giá bán, khuyến mãi và liên hệ với quán nhanh chóng.

## Tổng quan dự án

Dự án được xây dựng bằng React, Vite, Tailwind CSS, Firebase và deploy trên Vercel.

Mục tiêu chính của dự án là giúp chủ quán có một trang menu online dễ quản lý, dễ cập nhật và thân thiện với khách hàng trên mọi thiết bị.

Khách hàng có thể:

- Xem thông tin quán
- Xem danh mục món
- Tìm kiếm sản phẩm
- Xem món nổi bật
- Xem trạng thái còn bán hoặc tạm hết
- Xem chương trình khuyến mãi
- Bấm gọi quán
- Mở Google Maps để chỉ đường
- Nhắn Zalo nếu quán có cấu hình

Admin có thể:

- Đăng nhập quản trị
- Thêm, sửa, xóa danh mục
- Thêm, sửa, xóa món
- Upload ảnh món
- Dán link ảnh món
- Kéo thả để sắp xếp thứ tự món
- Bật hoặc tắt trạng thái món
- Đánh dấu món nổi bật
- Quản lý banner khuyến mãi
- Upload ảnh/video khuyến mãi
- Thêm media khuyến mãi bằng URL
- Kéo thả để sắp xếp thứ tự media khuyến mãi
- Cập nhật thông tin quán
- Bật/tắt trạng thái public menu

## Demo / Repository

Repository:

```txt
https://github.com/khoale-dev-code/F-and-B-Coffe.git
```

Sau khi deploy lên Vercel, menu khách hàng sẽ có dạng:

```txt
https://your-domain.vercel.app/{shopSlug}
```

Ví dụ:

```txt
https://your-domain.vercel.app/hop
```

Trang admin:

```txt
https://your-domain.vercel.app/admin/login
```

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| React | Xây dựng giao diện người dùng |
| Vite | Công cụ build frontend nhanh |
| React Router | Điều hướng public page và admin page |
| Tailwind CSS | Thiết kế giao diện responsive |
| Firebase Auth | Đăng nhập admin |
| Cloud Firestore | Lưu thông tin quán, danh mục, món, khuyến mãi |
| Firebase Storage | Lưu ảnh món, ảnh/video khuyến mãi |
| Lucide React | Icon giao diện |
| DnD Kit | Kéo thả sắp xếp món và media |
| Vercel | Deploy frontend |

## Tính năng chính

### Trang khách hàng

Trang menu public được tối ưu để khách mở trên điện thoại.

Các thành phần chính:

- Header thương hiệu
- Hero giới thiệu quán
- Nút gọi quán, chỉ đường, nhắn Zalo
- Banner khuyến mãi
- Thanh tìm kiếm món
- Bộ lọc danh mục
- Món nổi bật
- Danh sách sản phẩm
- Thông tin cửa hàng
- Thanh hành động nhanh trên mobile

### Trang admin

Admin panel được chia thành các khu vực:

- Tổng quan
- Quản lý menu
- Quản lý khuyến mãi
- Cài đặt quán

Admin có thể thao tác mà không cần sửa code.

### Quản lý menu

Admin có thể:

- Tạo danh mục mới
- Sửa tên danh mục
- Ẩn/hiện danh mục
- Xóa danh mục
- Thêm món mới
- Sửa thông tin món
- Upload ảnh món
- Dán URL ảnh món
- Cập nhật giá và giá cũ
- Bật/tắt món còn bán
- Đánh dấu món nổi bật
- Kéo thả để đổi thứ tự hiển thị

### Quản lý khuyến mãi

Admin có thể:

- Tạo chương trình khuyến mãi
- Nhập tiêu đề, mô tả ngắn, nội dung chi tiết
- Upload nhiều ảnh/video
- Thêm media bằng URL
- Sắp xếp media bằng kéo thả
- Bật/tắt chương trình
- Thiết lập ngày bắt đầu và ngày kết thúc
- Nhập điều kiện áp dụng
- Xem chi tiết khuyến mãi ở client bằng popup

## Cấu trúc thư mục

```txt
src/
├── app/
│   └── router.jsx
│
├── components/
│   ├── admin/
│   └── public/
│
├── hooks/
│   ├── useAuth.js
│   └── useShopMenu.js
│
├── layouts/
│   ├── AdminLayout.jsx
│   └── PublicLayout.jsx
│
├── lib/
│   └── firebase.js
│
├── pages/
│   ├── admin/
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MenuItemsPage.jsx
│   │   ├── PromotionsPage.jsx
│   │   └── SettingsPage.jsx
│   │
│   └── public/
│       └── MenuPage.jsx
│
├── services/
│   ├── categoryService.js
│   ├── itemService.js
│   ├── promotionService.js
│   └── shopService.js
│
├── index.css
└── main.jsx
```

## Mô hình dữ liệu Firestore

```txt
shops/{shopId}
  name
  slug
  description
  address
  phone
  zaloUrl
  facebookUrl
  googleMapUrl
  logoUrl
  coverUrl
  isPublished
  ownerUid
  theme
  createdAt
  updatedAt

shops/{shopId}/categories/{categoryId}
  name
  order
  isActive

shops/{shopId}/items/{itemId}
  name
  description
  price
  oldPrice
  imageUrl
  categoryId
  isAvailable
  isFeatured
  order
  tags
  createdAt
  updatedAt

shops/{shopId}/promotions/{promotionId}
  title
  subtitle
  description
  media
  imageUrl
  buttonText
  terms
  startAt
  endAt
  isActive
  order
  createdAt
  updatedAt

admins/{uid}
  email
  role
  shopIds
```

### Cấu trúc media khuyến mãi

```js
media: [
  {
    url: "https://...",
    type: "image",
    name: "banner.jpg",
    mimeType: "image/jpeg",
    size: 123456
  },
  {
    url: "https://...",
    type: "video",
    name: "promo.mp4",
    mimeType: "video/mp4",
    size: 987654
  }
]
```

## Cài đặt project

### 1. Clone repository

```bash
git clone https://github.com/khoale-dev-code/F-and-B-Coffe.git
cd F-and-B-Coffe
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_DEFAULT_SHOP_ID=demo-shop
```

Ví dụ với project hiện tại:

```env
VITE_FIREBASE_API_KEY=AIzaSyCiMMgA6ec89wlmaO3Y-hQy7xHLOf51DT0
VITE_FIREBASE_AUTH_DOMAIN=website-fandb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=website-fandb
VITE_FIREBASE_STORAGE_BUCKET=website-fandb.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=133896773345
VITE_FIREBASE_APP_ID=1:133896773345:web:7a5807aa9a3f68ad1ee1a0
VITE_FIREBASE_MEASUREMENT_ID=G-BWDLWGT2HH
VITE_DEFAULT_SHOP_ID=demo-shop
```

### 4. Chạy local

```bash
npm run dev
```

Mặc định Vite sẽ chạy tại:

```txt
http://localhost:5173
```

### 5. Build production

```bash
npm run build
```

### 6. Preview production build

```bash
npm run preview
```

## Firebase Setup

### Authentication

Bật Firebase Authentication:

```txt
Firebase Console → Authentication → Sign-in method → Email/Password
```

Tạo tài khoản admin bằng email/password.

### Firestore Database

Tạo Cloud Firestore database và tạo document shop đầu tiên:

```txt
shops/demo-shop
```

Dữ liệu mẫu:

```js
{
  name: "Hớp",
  slug: "hop",
  description: "Menu đồ uống online",
  address: "Địa chỉ quán",
  phone: "0123456789",
  zaloUrl: "",
  facebookUrl: "",
  googleMapUrl: "",
  logoUrl: "",
  coverUrl: "",
  isPublished: true,
  ownerUid: "",
  theme: {
    primaryColor: "#6B4B3E",
    accentColor: "#7CAEB8"
  }
}
```

### Firebase Storage

Bật Firebase Storage để upload ảnh món và media khuyến mãi.

## Firebase Rules

### Firestore Rules

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function shopIsPublished(shopId) {
      return get(/databases/$(database)/documents/shops/$(shopId)).data.isPublished == true;
    }

    match /shops/{shopId} {
      allow read: if resource.data.isPublished == true || isSignedIn();
      allow create, update, delete: if isSignedIn();

      match /categories/{categoryId} {
        allow read: if shopIsPublished(shopId) || isSignedIn();
        allow create, update, delete: if isSignedIn();
      }

      match /items/{itemId} {
        allow read: if shopIsPublished(shopId) || isSignedIn();
        allow create, update, delete: if isSignedIn();
      }

      match /promotions/{promotionId} {
        allow read: if shopIsPublished(shopId) || isSignedIn();
        allow create, update, delete: if isSignedIn();
      }
    }

    match /admins/{uid} {
      allow read, write: if isSignedIn();
    }
  }
}
```

### Storage Rules

```js
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Deploy Vercel

### 1. Tạo file `vercel.json`

Tạo file ở thư mục gốc:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

File này giúp React Router hoạt động đúng khi refresh các route như:

```txt
/admin/login
/admin/dashboard
/admin/menu
/admin/promotions
/hop
```

### 2. Push code lên GitHub

```bash
git add .
git commit -m "Update F&B menu project"
git push
```

### 3. Import project trên Vercel

Trên Vercel:

```txt
Add New → Project → Import Git Repository
```

Chọn repository:

```txt
F-and-B-Coffe
```

Cấu hình:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Thêm Environment Variables trên Vercel

Vào:

```txt
Project Settings → Environment Variables
```

Thêm các biến giống `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_DEFAULT_SHOP_ID=demo-shop
```

Sau đó redeploy project.

## Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Một số route chính

| Route | Chức năng |
|---|---|
| `/` | Redirect hoặc trang mặc định |
| `/:shopSlug` | Trang menu public cho khách |
| `/admin/login` | Đăng nhập admin |
| `/admin/dashboard` | Tổng quan |
| `/admin/menu` | Quản lý món và danh mục |
| `/admin/promotions` | Quản lý khuyến mãi |
| `/admin/settings` | Cài đặt thông tin quán |

## Quy trình sử dụng cho chủ quán

1. Đăng nhập admin
2. Vào Cài đặt quán
3. Nhập tên quán, slug, số điện thoại, Zalo, Google Maps
4. Upload logo và ảnh bìa
5. Bật public menu
6. Vào Quản lý menu
7. Tạo danh mục
8. Thêm món
9. Sắp xếp thứ tự món
10. Vào Khuyến mãi nếu cần tạo ưu đãi
11. Mở link public hoặc tạo QR Code cho khách quét

## Gợi ý tạo QR Code

Sau khi có link public, ví dụ:

```txt
https://your-domain.vercel.app/hop
```

Có thể tạo QR Code bằng công cụ bất kỳ rồi dán lên:

- Bàn quán
- Menu giấy
- Standee
- Google Maps
- Fanpage
- Zalo OA

## Checklist trước khi deploy

- [ ] Project chạy được bằng `npm run dev`
- [ ] Build thành công bằng `npm run build`
- [ ] Đã tạo `.env.local`
- [ ] Đã thêm `.env.local` vào `.gitignore`
- [ ] Đã tạo `vercel.json`
- [ ] Firestore Rules đã có `promotions`
- [ ] Storage Rules cho phép read ảnh public
- [ ] Đã tạo document `shops/demo-shop`
- [ ] Shop có `slug`
- [ ] Shop có `isPublished: true`
- [ ] Admin đăng nhập được
- [ ] Menu public mở được bằng `/{shopSlug}`

## Lỗi thường gặp

### Refresh `/admin/dashboard` bị 404 trên Vercel

Kiểm tra file `vercel.json` đã được push chưa.

### Client không hiện khuyến mãi

Kiểm tra:

```txt
shops/{shopId}/promotions
```

Document khuyến mãi cần có:

```js
isActive: true
startAt: ""
endAt: ""
media: [
  {
    url: "https://...",
    type: "image"
  }
]
```

### Upload ảnh bị lỗi permission

Kiểm tra Firebase Storage Rules và đảm bảo admin đã đăng nhập.

### Trang public không đọc được dữ liệu

Kiểm tra:

```js
isPublished: true
```

trong document:

```txt
shops/{shopId}
```

### Nút xem menu trong admin mở sai trang

Kiểm tra field:

```txt
slug
```

trong document shop. Ví dụ:

```js
slug: "hop"
```

## Định hướng phát triển tiếp theo

- Hỗ trợ nhiều shop cho nhiều khách hàng
- Phân quyền admin theo từng shop
- Dashboard thống kê lượt xem menu
- Tạo QR Code trực tiếp trong admin
- Tùy chỉnh màu giao diện theo thương hiệu
- Hỗ trợ combo/set menu
- Hỗ trợ size/topping cho từng món
- Hỗ trợ đặt món online
- Hỗ trợ nhiều ngôn ngữ

## License

Dự án được phát triển cho mục đích học tập, triển khai thực tế và tùy biến theo nhu cầu quán F&B.
