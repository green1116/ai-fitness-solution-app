import { DemoExperienceForm } from "@/components/marketing/DemoExperienceForm";
import { LandingTracker } from "@/components/marketing/LandingTracker";
import Link from "next/link";

export default function DemoPage() {
  return (
    <>
      <LandingTracker path="/demo" />
      <div className="space-y-6">
        <div>
          <Link href="/" className="text-sm text-emerald-600 hover:underline">
            ← 返回首页
          </Link>
          <h1 className="mt-4 text-3xl font-bold">产品 Demo</h1>
          <p className="mt-2 text-zinc-600">
            输入最少企业信息，即时生成 Quote · Budget · Tender 预览
          </p>
        </div>
        <DemoExperienceForm />
      </div>
    </>
  );
}
