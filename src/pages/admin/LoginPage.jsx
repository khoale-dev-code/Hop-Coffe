import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Coffee, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/admin/dashboard";

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F5EDE4]">
        <div className="flex items-center gap-3 text-sm font-medium text-[#6B4B3E]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C8A98A] border-t-[#6B4B3E]" />
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  if (user) return <Navigate to="/admin/dashboard" replace />;

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
    <main className="grid min-h-screen place-items-center bg-[#F5EDE4] px-4 py-10">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#E8D8CC] bg-white shadow-sm sm:grid sm:grid-cols-2">

        {/* Left panel */}
        <div className="flex flex-col justify-between bg-[#2F221C] p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Coffee size={22} className="text-[#C8A98A]" />
          </div>

          <div className="mt-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-1.5 text-xs font-medium text-[#C8A98A]">
              <ShieldCheck size={13} />
              Khu vực quản trị
            </div>

            <h1 className="text-2xl font-black leading-snug text-[#F5EDE4]">
              Quản lý menu quán<br />trong vài giây.
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Thêm món, cập nhật giá, bật khuyến mãi — không cần chỉnh code.
            </p>

            <div className="mt-6 flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#C8A98A]" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-center p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            F&B Menu Admin
          </p>
          <h2 className="mt-1.5 text-xl font-black text-neutral-900">Đăng nhập</h2>
          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            Nhập tài khoản admin để tiếp tục quản lý quán.
          </p>

          <div className="my-5 border-t border-neutral-100" />

          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <span className="text-base">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-600">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@quancafe.vn"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#6B4B3E] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-600">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-[#6B4B3E] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F221C] py-3 text-sm font-bold text-[#F5EDE4] transition hover:bg-[#3f2e25] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn size={16} />
              )}
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
            Chỉ tài khoản admin mới có quyền truy cập.<br />
            Liên hệ quản trị viên nếu quên mật khẩu.
          </p>
        </div>
      </div>
    </main>
  );
}