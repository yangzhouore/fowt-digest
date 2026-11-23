// IDs are retained record identities, never article ranks or name matches.
export function engineeringItemAnchor(itemId: string) {
  return `item-${itemId}`;
}

export function engineeringItemHref(editionSlug: string, itemId: string) {
  return `/engineering/${editionSlug}#${engineeringItemAnchor(itemId)}`;
}

export function industryCompanyAnchor(companyId: string) {
  return `company-${companyId}`;
}

export function companyEventAnchor(eventId: string) {
  return `event-${eventId}`;
}

export function companyEventHref(companyId: string, eventId: string) {
  return `/companies/${companyId}#${companyEventAnchor(eventId)}`;
}
