import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        AI 企业健身方案生成器
      </h1>

      <p className="text-lg text-gray-300 mb-10 text-center max-w-xl">
        输入企业规模与空间信息，几分钟内生成专属企业健身解决方案。
      </p>

      <Link
        href="/plan"
        className="bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition"
      >
        开始生成方案
      </Link>
    </main>
  );
}
