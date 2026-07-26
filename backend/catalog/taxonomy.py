import re
from django.utils.text import slugify as django_slugify

_SEP_RE = re.compile(r'^([A-Z]{2,5})\s*[✪❖★|\-]\s*(.+)$')
_SUFFIX_RE = re.compile(r"\s*[\[\(][^\]\)]*[\]\)]\s*$")
_QUALITY_RE = re.compile(r"\b(8K|4K|UHD|FHD|HD|SD)\b", re.IGNORECASE)
_ADULT_RE = re.compile(
    r"\bXXX\b|\b18\s*\+|\bADULT\b|\bEROTIC\b|\bPORN\b|\bHENTAI\b|\bNSFW\b|\bSEX\s*TV\b",
    re.IGNORECASE,
)
_RADIO_RE = re.compile(r"\bRADIO\b|\bFM\b|\U0001F4FB", re.IGNORECASE)
_HIGH_BR_RE = re.compile(r"\b(4K|8K|UHD|RAW)\b", re.IGNORECASE)

KNOWN_LANG_CODES = {
    "FR", "EN", "AR", "AF", "DE", "ES", "IT", "NL", "PT", "PL", "GR",
    "RU", "TR", "IN", "CN", "KR", "JP", "BR", "LAT", "CA", "AL", "RO",
    "BG", "SW", "DK", "EX", "KU", "PER", "PH", "MY", "TH", "ID", "AS",
    "MA", "VIP",
}

LANG_LABELS = {
    "FR":  {"fr": "Français",    "en": "French",      "mo": "Fãrẽnse",  "di": "Tubabukan"},
    "EN":  {"fr": "Anglais",     "en": "English",     "mo": "Ãngele",         "di": "Angilɛkan"},
    "AR":  {"fr": "Arabe",       "en": "Arabic",      "mo": "Arab",                "di": "Larabu"},
    "AF":  {"fr": "Afrique",     "en": "Africa",      "mo": "Afirik",              "di": "Afiriki"},
    "DE":  {"fr": "Allemand",    "en": "German",      "mo": "Almaŋ",          "di": "Alimankan"},
    "ES":  {"fr": "Espagnol",    "en": "Spanish",     "mo": "Espagne",             "di": "Esipaɲikan"},
    "IT":  {"fr": "Italien",     "en": "Italian",     "mo": "Italĩ",          "di": "Italikan"},
    "NL":  {"fr": "Néerlandais", "en": "Dutch",  "mo": "Olanɛ",          "di": "Olandɛkan"},
    "PT":  {"fr": "Portugais",   "en": "Portuguese",  "mo": "Portuge",             "di": "Porutugalikan"},
    "PL":  {"fr": "Polonais",    "en": "Polish",      "mo": "Poloŋ",          "di": "Polonɛkan"},
    "GR":  {"fr": "Grec",        "en": "Greek",       "mo": "Grɛk",           "di": "Grɛsikan"},
    "RU":  {"fr": "Russe",       "en": "Russian",     "mo": "Ris",                 "di": "Risikan"},
    "TR":  {"fr": "Turc",        "en": "Turkish",     "mo": "Tɯrk",           "di": "Turukikan"},
    "IN":  {"fr": "Indien",      "en": "Indian",      "mo": "Ĩnd",            "di": "ɛndukan"},
    "CN":  {"fr": "Chinois",     "en": "Chinese",     "mo": "Sinuwa",              "di": "Sinuwakan"},
    "KR":  {"fr": "Coréen", "en": "Korean",      "mo": "Kore",                "di": "Kɔrekan"},
    "JP":  {"fr": "Japonais",    "en": "Japanese",    "mo": "Zapɔne",         "di": "Zapɔnikan"},
    "BR":  {"fr": "Brésilien", "en": "Brazilian","mo": "Brezil",              "di": "Berezilikan"},
    "LAT": {"fr": "Latino",      "en": "Latino",      "mo": "Latino",              "di": "Latino"},
    "CA":  {"fr": "Canadien",    "en": "Canadian",    "mo": "Kanada",              "di": "Kanadakan"},
    "AL":  {"fr": "Albanais",    "en": "Albanian",    "mo": "Albani",              "di": "Albanikan"},
    "RO":  {"fr": "Roumain",     "en": "Romanian",    "mo": "Rumani",              "di": "Rumanikan"},
    "BG":  {"fr": "Bulgare",     "en": "Bulgarian",   "mo": "Bulgari",             "di": "Bulgarikan"},
    "SW":  {"fr": "Suédois","en": "Swedish",     "mo": "Swɛd",           "di": "Suwɛdkan"},
    "DK":  {"fr": "Danois",      "en": "Danish",      "mo": "Danemak",             "di": "Danɛmarkan"},
    "EX":  {"fr": "Extra",       "en": "Extra",       "mo": "Extra",               "di": "Extra"},
    "KU":  {"fr": "Kurde",       "en": "Kurdish",     "mo": "Kurd",                "di": "Kurdikan"},
    "PER": {"fr": "Persan",      "en": "Persian",     "mo": "Pɛrs",           "di": "Pɛrsikan"},
    "PH":  {"fr": "Philippin",   "en": "Filipino",    "mo": "Filipin",             "di": "Filipinikan"},
    "MY":  {"fr": "Malais",      "en": "Malay",       "mo": "Malezi",              "di": "Malɛzikan"},
    "TH":  {"fr": "Thaï",   "en": "Thai",        "mo": "Tayland",             "di": "Tayilandan"},
    "ID":  {"fr": "Indonésien", "en": "Indonesian", "mo": "Indonezi",         "di": "Indonezikan"},
    "AS":  {"fr": "Asie",        "en": "Asia",        "mo": "Azi",                 "di": "Aziri"},
    "MA":  {"fr": "Maghreb",     "en": "Maghreb",     "mo": "Magrɛb",         "di": "Magrɛbukan"},
    "VIP": {"fr": "VIP",         "en": "VIP",         "mo": "VIP",                 "di": "VIP"},
}


def _clean_suffix(text: str) -> str:
    return _SUFFIX_RE.sub("", text).strip()


def slugify_genre(text: str) -> str:
    return django_slugify(text)[:60]


def slug_to_label(slug: str) -> str:
    return slug.replace("-", " ").title()


def get_lang_label(code: str, lang: str = "fr") -> str:
    entry = LANG_LABELS.get(code.upper(), {})
    return entry.get(lang) or entry.get("fr") or code


def parse_category(raw_name: str) -> dict:
    """Parse a provider category name into taxonomy fields.

    Recognised separator pattern: r'^([A-Z]{2,5})\\s*[✪❖★|\\-]\\s*(.+)$'
    """
    result = {
        "lang_code": "",
        "genre_slug": "",
        "genre_label": "",
        "quality": "",
        "is_adult": False,
        "is_radio": False,
        "is_high_bitrate": False,
    }

    if not raw_name:
        return result

    result["is_adult"] = bool(_ADULT_RE.search(raw_name))
    result["is_radio"] = bool(_RADIO_RE.search(raw_name))

    q_match = _QUALITY_RE.search(raw_name)
    if q_match:
        result["quality"] = q_match.group(1).upper()
        result["is_high_bitrate"] = result["quality"] in ("4K", "8K", "UHD")

    if not result["is_high_bitrate"]:
        result["is_high_bitrate"] = bool(_HIGH_BR_RE.search(raw_name))

    lang_code = ""
    genre_raw = raw_name

    m = _SEP_RE.match(raw_name)
    if m:
        candidate = m.group(1).upper()
        if candidate in KNOWN_LANG_CODES:
            lang_code = candidate
            genre_raw = m.group(2).strip()

    genre_clean = _clean_suffix(genre_raw)
    result["lang_code"] = lang_code
    result["genre_label"] = genre_clean
    result["genre_slug"] = slugify_genre(genre_clean)
    return result
