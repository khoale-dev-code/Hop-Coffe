import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Coffee } from "lucide-react";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/admin/dashboard";

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50">
        <p className="text-neutral-500">Đang kiểm tra đăng nhập...</p>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await signInWithEmailAndPassword(auth, email, password);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Email hoặc mật khẩu không đúng.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-sm"
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-neutral-950 text-white">
          <Coffee size={28} />
        </div>

        <h1 className="mt-5 text-3xl font-black">Đăng nhập admin</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Quản lý menu, danh mục, món ăn và thông tin quán.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@gmail.com"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
              required
            />
          </div>
        </div>

        <button
          disabled={submitting}
          className="mt-6 w-full rounded-2xl bg-neutral-950 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}