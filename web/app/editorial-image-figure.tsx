"use client";

import Image from "next/image";
import type { EditorialImage } from "./editorial-images";
import { useLanguage } from "./i18n/language-context";
import { LocalizedCopy } from "./i18n/localized-copy";

export function EditorialImageFigure({ image }: { image: EditorialImage }) {
  const { language } = useLanguage();

  return (
    <figure className="briefing-lead-figure">
      <div className="briefing-lead-media">
        <Image src={image.src} width={image.width} height={image.height} alt={image.alt[language]}
          sizes="(max-width: 959px) calc(100vw - 64px), (max-width: 1199px) calc(100vw - 280px), 928px"
          style={image.focalPosition ? { objectFit: "cover", objectPosition: image.focalPosition } : undefined} />
      </div>
      <figcaption className="briefing-meta">
        <LocalizedCopy en="Image credit" zh="图片来源" />{" "}
        <a href={image.sourceUrl} translate="no">{image.credit}</a>{" · "}
        <a href={image.rightsReference}><LocalizedCopy en="Reuse terms" zh="使用条款" /></a>
        {" · "}<span translate="no">{image.licenseNote}</span>
      </figcaption>
    </figure>
  );
}
