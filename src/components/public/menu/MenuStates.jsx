import { Coffee } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="min-h-screen bg-white px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="h-[360px] animate-pulse rounded-[18px] bg-white" />

        <div className="mt-6 grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="hidden h-96 animate-pulse rounded-[16px] bg-white lg:block" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[16px] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function StateBox({ title, description }) {
  return (
    <div className="max-w-md rounded-[16px] border border-[#EEE3D8] bg-white p-8 text-center shadow-xl">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[14px] bg-[#E7F2F4] text-[#4E8791]">
        <Coffee size={30} />
      </div>

      <h1 className="mt-5 text-3xl font-black text-[#2F221C]">{title}</h1>
      <p className="mt-2 font-medium text-[#73584D]">{description}</p>
    </div>
  );
}