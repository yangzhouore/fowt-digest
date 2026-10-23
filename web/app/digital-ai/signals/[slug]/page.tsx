import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllDigitalAiSignals } from "../../../../data/digital-ai-adapter";
import { SiteHeader } from "../../../site-header";
import { SiteFooter } from "../../../site-footer";
import { SignalReader } from "../../signal-reader";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllDigitalAiSignals().map((signal) => ({ slug: signal.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const signal = getAllDigitalAiSignals().find((item) => item.slug === slug);
  return { title: signal?.title ?? "Signal not found", description: signal?.shortDescription };
}

export default async function SignalPage({ params }: Props) {
  const { slug } = await params;
  const signal = getAllDigitalAiSignals().find((item) => item.slug === slug);
  if (!signal) notFound();
  return (
    <main className="digital-ai-page">
      <SiteHeader />
      <SignalReader signal={signal} />
      <SiteFooter />
    </main>
  );
}
