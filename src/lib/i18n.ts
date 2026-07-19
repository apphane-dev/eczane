export const locales = ["tr", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

/** BCP-47 tags used for date/number formatting per locale. */
const intlLocale: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ru: "ru-RU",
};

export interface Strings {
  /** <html lang> value. */
  htmlLang: string;
  /** Native name for the language switcher. */
  nativeName: string;
  pageTitle: string;
  metaDescription: string;
  onDutyCount: (n: number) => string;
  lastUpdated: string;
  viewList: string;
  viewMap: string;
  viewGroupLabel: string;
  locate: string;
  locating: string;
  locateSorted: string;
  locateFailed: string;
  locateUnsupported: string;
  /** Suffix after a distance value, e.g. "3.2 km away". */
  distanceSuffix: string;
  call: string;
  whatsapp: string;
  directionsGoogle: string;
  directionsYandex: string;
  searchOnMap: string;
  directionsShort: string;
  listAriaLabel: string;
  mapAriaLabel: string;
  mapRegionLabel: string;
  footer: string;
  languageLabel: string;
}

export const translations: Record<Locale, Strings> = {
  tr: {
    htmlLang: "tr",
    nativeName: "Türkçe",
    pageTitle: "Antalya Nöbetçi Eczaneler",
    metaDescription:
      "Antalya nöbetçi eczaneler — adres, telefon ve yol tarifi.",
    onDutyCount: (n) => `Şu anda görevli ${n} eczane`,
    lastUpdated: "Son güncelleme",
    viewList: "Liste",
    viewMap: "Harita",
    viewGroupLabel: "Görünüm seçimi",
    locate: "Bana en yakını bul",
    locating: "Konum alınıyor…",
    locateSorted: "Mesafeye göre sıralandı",
    locateFailed: "Konum alınamadı, tekrar dene",
    locateUnsupported: "Konum desteklenmiyor",
    distanceSuffix: "uzaklıkta",
    call: "Ara",
    whatsapp: "WhatsApp",
    directionsGoogle: "Google Yol Tarifi",
    directionsYandex: "Yandex",
    searchOnMap: "Haritada Ara",
    directionsShort: "Yol Tarifi",
    listAriaLabel: "Eczane listesi",
    mapAriaLabel: "Harita görünümü",
    mapRegionLabel: "Nöbetçi eczaneler haritası",
    footer:
      "Veriler Antalya Eczacı Odası kaynaklıdır. Acil durumda eczaneyi arayarak teyit ediniz.",
    languageLabel: "Dil",
  },
  en: {
    htmlLang: "en",
    nativeName: "English",
    pageTitle: "Antalya On-Duty Pharmacies",
    metaDescription:
      "On-duty (night-time) pharmacies in Antalya — address, phone and directions.",
    onDutyCount: (n) => `${n} pharmacies on duty right now`,
    lastUpdated: "Last updated",
    viewList: "List",
    viewMap: "Map",
    viewGroupLabel: "View selection",
    locate: "Find the nearest to me",
    locating: "Getting your location…",
    locateSorted: "Sorted by distance",
    locateFailed: "Couldn't get location, try again",
    locateUnsupported: "Location not supported",
    distanceSuffix: "away",
    call: "Call",
    whatsapp: "WhatsApp",
    directionsGoogle: "Google Directions",
    directionsYandex: "Yandex",
    searchOnMap: "Search on Map",
    directionsShort: "Directions",
    listAriaLabel: "Pharmacy list",
    mapAriaLabel: "Map view",
    mapRegionLabel: "Map of on-duty pharmacies",
    footer:
      "Data sourced from the Antalya Chamber of Pharmacists. In an emergency, call the pharmacy to confirm.",
    languageLabel: "Language",
  },
  ru: {
    htmlLang: "ru",
    nativeName: "Русский",
    pageTitle: "Дежурные аптеки Антальи",
    metaDescription:
      "Дежурные (ночные) аптеки в Анталье — адрес, телефон и маршрут.",
    onDutyCount: (n) => `Сейчас дежурят ${n} аптек`,
    lastUpdated: "Обновлено",
    viewList: "Список",
    viewMap: "Карта",
    viewGroupLabel: "Выбор вида",
    locate: "Найти ближайшую",
    locating: "Определяем местоположение…",
    locateSorted: "Отсортировано по расстоянию",
    locateFailed: "Не удалось определить, попробуйте ещё раз",
    locateUnsupported: "Геолокация не поддерживается",
    distanceSuffix: "от вас",
    call: "Позвонить",
    whatsapp: "WhatsApp",
    directionsGoogle: "Маршрут в Google",
    directionsYandex: "Yandex",
    searchOnMap: "Найти на карте",
    directionsShort: "Маршрут",
    listAriaLabel: "Список аптек",
    mapAriaLabel: "Вид карты",
    mapRegionLabel: "Карта дежурных аптек",
    footer:
      "Данные предоставлены Палатой фармацевтов Антальи. В экстренном случае позвоните в аптеку для подтверждения.",
    languageLabel: "Язык",
  },
};

/** Path to the Antalya city page for a given locale. */
export function cityPath(locale: Locale): string {
  return locale === defaultLocale ? "/antalya" : `/${locale}/antalya`;
}

/** Root path for a given locale. */
export function rootPath(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}/`;
}

/** Format an ISO timestamp for display in Europe/Istanbul for the locale. */
export function formatUpdatedAt(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(iso));
}

/** Intl tag for use in client-side number/date formatting. */
export function getIntlLocale(locale: Locale): string {
  return intlLocale[locale];
}
