"""Indic script normalization and transliteration utilities for Hindi STT."""
from __future__ import annotations

import re

_URDU_CHAR_PATTERN = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")

_WORD_MAP: dict[str, str] = {
    "ابکہ": "आपका", "آپکا": "आपका", "آپ کا": "आपका", "آپ": "आप",
    "دنی": "दिन", "دن": "दिन", "کسا": "कैसा", "کیسا": "कैसा",
    "ہے": "है", "ہیں": "हैं", "تھا": "था", "تھی": "थी", "تھے": "थे",
    "کیا": "क्या", "کیों": "क्यों", "کب": "कब", "کہاں": "कहाँ",
    "کون": "कौन", "کیسے": "कैसे", "کتنا": "कितना", "کتنی": "कितनी",
    "نہیں": "नहीं", "ہاں": "हाँ", "اچھا": "अच्छा", "بہت": "बहुत",
    "شکریہ": "शुक्रिया", "سلام": "नमस्ते", "نمسکار": "नमस्कार",
    "معیار": "मानक", "بی آئی ایس": "बीआईएस", "ہندوستان": "भारत",
}

_CHAR_MAP: dict[str, str] = {
    "آ": "आ", "ا": "आ", "ب": "ब", "پ": "प", "ت": "त", "ٹ": "ट", "ث": "स",
    "ج": "ज", "च": "च", "ح": "ह", "خ": "ख़", "د": "द", "ڈ": "ड", "ذ": "ज़",
    "ر": "र", "ڑ": "ड़", "ز": "ज़", "ژ": "झ़", "س": "स", "ش": "श", "ص": "स",
    "ض": "ज़", "ط": "त", "ظ": "ज़", "ع": "अ", "غ": "ग़", "ف": "फ़", "ق": "क़",
    "ک": "क", "گ": "ग", "ل": "ल", "م": "म", "ن": "न", "ں": "ं", "و": "ो",
    "ہ": "ह", "ھ": "ह", "ی": "ी", "ے": "े", "۰": "0", "۱": "1", "۲": "2",
    "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "۔": "।", "؟": "?",
}


def is_urdu_script(text: str) -> bool:
    """Return True if string contains Arabic or Urdu Perso-Arabic characters."""
    return bool(_URDU_CHAR_PATTERN.search(text)) if text else False


def urdu_to_devanagari(text: str) -> str:
    """Transliterate Urdu Perso-Arabic text to Hindi Devanagari script."""
    if not text or not is_urdu_script(text):
        return text

    words: list[str] = text.split()
    converted: list[str] = []
    for raw in words:
        clean = raw.strip(".,!?؟۔")
        trail = raw[len(clean):] if raw.startswith(clean) else ""
        trail = "।" if trail == "۔" else ("?" if trail == "؟" else trail)
        if clean in _WORD_MAP:
            converted.append(_WORD_MAP[clean] + trail)
        else:
            mapped = "".join(_CHAR_MAP.get(ch, ch) for ch in clean)
            converted.append(mapped + trail)
    return " ".join(converted)


def get_stt_prompt(language: str) -> str:
    """Return language-specific conditioning prompt for Faster-Whisper."""
    if language.lower().startswith("hi"):
        return "नमस्ते, यह भारतीय मानक ब्यूरो (BIS) की आवाज़ प्रणाली है। मानक और विनिर्देश।"
    return "BIS Bureau of Indian Standards voice conversation. Hello, Hi."
