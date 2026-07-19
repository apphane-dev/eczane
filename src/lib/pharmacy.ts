import type { Pharmacy } from "./types";

/** Districts pinned to the top of the list, in this order. */
const PINNED_DISTRICTS = ["Konyaaltı", "Muratpaşa", "Kepez"];

/** Strip everything but digits from a phone string. */
export function cleanPhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

/**
 * Turkish mobile numbers start with 5 (after an optional 90/0 prefix).
 * Mirrors the prior-art regex: ^(90|0)?5\d{9}$
 */
export function isMobilePhone(phone: string): boolean {
  return /^(90|0)?5\d{9}$/.test(cleanPhone(phone));
}

/** Human-friendly phone formatting, e.g. 0242 237 21 88. */
export function formatPhone(phone: string): string {
  const d = cleanPhone(phone);
  // Landline/mobile with leading 0 and 11 digits: 0XXX XXX XX XX
  if (d.length === 11 && d.startsWith("0")) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
  }
  // 10 digits without leading 0
  if (d.length === 10) {
    return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
  }
  return phone;
}

/** tel: href (E.164-ish, keeps digits). */
export function telHref(phone: string): string {
  return `tel:${cleanPhone(phone)}`;
}

/** WhatsApp deep link; prefixes 90 (Turkey) if missing. */
export function whatsappHref(phone: string): string {
  let d = cleanPhone(phone);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("90")) d = `90${d}`;
  return `https://wa.me/${d}`;
}

export function googleMapsHref(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function yandexMapsHref(lat: number, lng: number): string {
  return `https://yandex.com/maps/?pt=${lng},${lat}&z=16&l=map`;
}

export function googleSearchHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export interface DistrictGroup {
  district: string;
  pharmacies: Pharmacy[];
}

/**
 * Group pharmacies by district. Pinned districts come first (in fixed order),
 * the rest are sorted alphabetically using Turkish locale collation.
 */
export function groupByDistrict(pharmacies: Pharmacy[]): DistrictGroup[] {
  const map = new Map<string, Pharmacy[]>();
  for (const p of pharmacies) {
    const list = map.get(p.district) ?? [];
    list.push(p);
    map.set(p.district, list);
  }

  const collator = new Intl.Collator("tr");
  const districts = [...map.keys()].sort((a, b) => {
    const ia = PINNED_DISTRICTS.indexOf(a);
    const ib = PINNED_DISTRICTS.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    }
    return collator.compare(a, b);
  });

  return districts.map((district) => ({
    district,
    pharmacies: (map.get(district) ?? []).sort((a, b) =>
      collator.compare(a.name, b.name),
    ),
  }));
}

/** Format an ISO timestamp for display in Europe/Istanbul, Turkish locale. */
export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}
