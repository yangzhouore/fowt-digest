export type EditorialImage = {
  src: `/editorial/${string}`;
  width: number;
  height: number;
  alt: { en: string; zh: string };
  credit: string;
  sourceUrl: string;
  licenseNote: string;
  rightsReference: string;
  // Set only when the approved derivative allows cropping.
  focalPosition?: string;
};

type EditorialImageRegistry = Readonly<Partial<Record<string, Readonly<Partial<Record<string, EditorialImage>>>>>>;

// Reviewed local images only, keyed by edition slug, then briefing item ID.
export const editorialImages: EditorialImageRegistry = {};

export function getEditorialImage(editionSlug: string, itemId: string) {
  return editorialImages[editionSlug]?.[itemId];
}
