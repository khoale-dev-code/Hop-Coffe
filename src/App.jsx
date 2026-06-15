import "./App.css";

function App() {
  return (
    <main className="app">
      <section className="hero-section">
        <div className="logo-card">
          <img
            src="/hoplogo.svg"
            alt="Hớp Coffee Logo"
            className="main-logo"
          />
        </div>

        <div className="content">
          <p className="eyebrow">F&B Coffee Menu</p>

          <h1>
            Hớp Coffee
            <span>Menu Online</span>
          </h1>

          <p className="description">
            Website menu online dành cho quán cafe, tiệm nước và đồ ăn vặt.
            Khách có thể xem menu, khuyến mãi, gọi quán và mở Google Maps nhanh
            chóng.
          </p>

          <div className="actions">
            <a href="/hop" className="primary-btn">
              Xem menu khách hàng
            </a>

            <a href="/admin/login" className="secondary-btn">
              Vào trang admin
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;