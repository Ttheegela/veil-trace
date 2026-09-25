"""Address normaliser for the sibling finder (TRC-25).

Turns an address into a street-and-building key, dropping the office / room /
floor / litera parts, so "Per. Dmitrovskii D. 13, Office 7, Saint Petersburg"
and "Per. Dmitrovskii D. 13, Lit. A, Pomeshch. 10-N, Saint Petersburg" get the
same key. Cyrillic is transliterated lightly; a few city spellings are merged.
Light by design: it will miss some matches and should be read as a lead tool.
"""
from __future__ import annotations

import re
import unicodedata

_CYR = dict(zip(
    "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    ["a", "b", "v", "g", "d", "e", "e", "zh", "z", "i", "i", "k", "l", "m", "n", "o", "p", "r", "s", "t",
     "u", "f", "kh", "ts", "ch", "sh", "shch", "", "y", "", "e", "yu", "ya"],
))

# Parts of an address that name a unit inside a building: the whole comma part is dropped.
_UNIT = re.compile(
    r"^(office|ofis|of|ofc|room|rm|kom|komn|komnata|pomeshch|pomeshchenie|pom|floor|fl|et|etazh|"
    r"lit|litera|liter|unit|suite|ste|apt|kv|kvartira|ic kapi|ic|kapi|daire|kat|m floor|mezzanine|"
    r"cherdak|flat|block office|p|n)\b"
)
_UNIT_ANY = re.compile(r"\b(\d+(st|nd|rd|th)\s+floor|floor\s+\d+|ic kapi( no)?:?\s*\S+|ofis\s*\S+|office\s*\S+|"
                       r"pomeshch\S*\s*\S+|pom\.?\s*\S+|\d+\s*(etazh|floor|et|kom|ofis)\b|etazh\s*\S+|ofis\s*\S+|kab\S*\s*\S+|kvartira\s*\S+|kv\.?\s*\d+\S*|lit\S*\s+[a-z]\b|kom\S*\s*\S+|et\s*\d+|room\s*\S+|unit\s*\S+|suite\s*\S+)")

# Words that only say "this is a street / house" and carry no identity.
_STOP = set("""
ul ulitsa ulica ulitsy per pereulok pr prospekt pr-kt prkt pl ploshchad nab naberezhnaya shosse sh bulvar
d dom zd zdanie str stroenie k korp korpus vl vladenie g gorod goroda r-n rayon raion oblast obl respublika
mo municipalnyi okrug vn ter
st street avenue ave av road rd blvd boulevard lane building bldg no num number house
cad caddesi cd mah mahallesi sok sokak sk
the of and
russia russian federation rossiiskaya rossiyskaya federatsiya rf kazakhstan kyrgyzstan turkey turkiye
united arab emirates uae ae ru kz kg tr cn china hong kong hk
""".split())

_CITY = {
    "sankt peterburg": "spb", "saint petersburg": "spb", "st petersburg": "spb", "sankt-peterburg": "spb",
    "st. petersburg": "spb", "moskva": "moscow", "g moskva": "moscow", "almaty": "almaty", "bishkek": "bishkek",
    "kaliningrad": "kaliningrad", "istanbul": "istanbul", "dubai": "dubai", "dubai": "dubai",
}


_CITIES = set(_CITY.values()) | {"minsk", "kazan", "novosibirsk", "yekaterinburg", "ekaterinburg", "tashkent",
                                  "yerevan", "tbilisi", "baku", "beijing", "shanghai", "shenzhen", "city"}


def _ascii(s: str) -> str:
    s = s.lower()
    s = "".join(_CYR.get(ch, ch) for ch in s)
    s = unicodedata.normalize("NFKD", s)
    return "".join(ch for ch in s if not unicodedata.combining(ch))


def _stem(tok: str) -> str:
    # dmitrovskii / dmitrovskiy / dmitrovsky -> dmitrovski ; teatralnaya / teatralnaia -> teatralna
    tok = re.sub(r"(iy|ii|yy|yi|ij|y)$", "i", tok)
    tok = re.sub(r"(aya|aia|ya)$", "a", tok)
    return tok


def parts(addr: str) -> list[str]:
    """Comma parts that survive unit-dropping, ascii-folded."""
    a = _ascii(addr or "")
    for k, v in _CITY.items():
        a = a.replace(k, v)
    out = []
    for p in re.split(r"[,;]", a):
        p = re.sub(r"[\"'«»()]", " ", p).strip(" .")
        p = re.sub(r"\s+", " ", p)
        if not p:
            continue
        if _UNIT.match(p.replace(".", " ").strip()):
            continue
        p = _UNIT_ANY.sub(" ", p)
        out.append(p)
    return out


def tokens(addr: str) -> set[str]:
    toks: set[str] = set()
    for p in parts(addr):
        for t in re.split(r"[\s./#:\-]+", p):
            t = t.strip()
            if not t or t in _STOP:
                continue
            if re.fullmatch(r"\d{5,6}", t):  # postcode
                continue
            if re.fullmatch(r"[a-z]", t):     # stray letter (litera, block)
                continue
            toks.add(_stem(t) if t.isalpha() and len(t) >= 5 else t)
    return toks


def key(addr: str) -> str:
    """Canonical street+building key: sorted tokens. Empty string if too little to go on."""
    t = tokens(addr)
    nums = {x for x in t if re.search(r"\d", x)}
    words = {x for x in t if not re.search(r"\d", x) and len(x) >= 3}
    if not nums or not (words - _CITIES):
        return ""  # a city alone, or a number alone, is not a building
    return " ".join(sorted(nums | words))


def house_numbers(addr: str) -> set[str]:
    return {x for x in tokens(addr) if re.search(r"\d", x)}


def street_words(addr: str) -> set[str]:
    return {x for x in tokens(addr) if not re.search(r"\d", x) and len(x) >= 4}


def same_building(a: str, b: str) -> bool:
    """Looser match used on Sayari text: share a house number AND a street/city word of 4+ letters,
    and at least two words overall (street + city) when both sides have two."""
    na, nb = house_numbers(a), house_numbers(b)
    if not (na & nb):
        return False
    wa, wb = street_words(a), street_words(b)
    shared = wa & wb
    if not (shared - _CITIES):
        return False
    return len(shared) >= 2 or min(len(wa), len(wb)) <= 1


if __name__ == "__main__":
    for s in [
        "Per. Dmitrovskii D. 13, Office 7, Saint Petersburg, 191025",
        "Per. Dmitrovskii D. 13, Lit. A, Pomeshch. 10-N, Saint Petersburg, 191025",
        "191025, Санкт-Петербург, Дмитровский переулок, дом 13, литер А, помещение 10-Н",
        "Sultan Selim Mah. Eski Buyukdere Cad No: 61 Ic Kapi No: 2 Kagithane, Istanbul, Turkey",
        "34415, KAGITHANE, ISTANBUL, SULTAN SELIM MAH ESKI BUYUKDERE CAD, NO.61,IC KAPI N",
        "Ul. Teatralnaya D. 35, K. LIII, Office 312, Kaliningrad, 236006",
    ]:
        print(repr(key(s)), "<-", s)
