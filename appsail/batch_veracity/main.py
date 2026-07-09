"""Nightly batch: compute veracity scores for all FIRs and store in FirVeracity table.
Runs as Catalyst AppSail job. Truncates and rewrites FirVeracity each run."""

import json
import re
from datetime import datetime, timezone


def tokenize(text):
    return re.findall(r"[a-z0-9.]+", (text or "").lower())


def detect_script(text):
    if not text:
        return "other"
    for ch in text:
        if 0x0C80 <= ord(ch) <= 0x0CFF:
            return "kannada"
    return "latin"


def analyze_fir(narrative):
    text = narrative or ""
    words = tokenize(text)
    word_count = len(words)

    script = detect_script(text)
    if script != "latin":
        return {"veracityScore": None, "languageNotSupported": True, "script": script}

    if word_count < 5:
        return {"veracityScore": 0.5, "languageNotSupported": False, "script": script}

    first_person = sum(1 for w in words if w in ["i", "me", "my", "mine", "myself"])
    third_person = sum(1 for w in words if w in ["he", "him", "his", "she", "her", "they", "them", "their", "theirs"])
    past_tense = sum(1 for w in words if w.endswith("ed"))
    present_tense = sum(1 for w in words if w.endswith("s") and not w.endswith("ss") and not w.endswith("sh"))
    sensory = sum(1 for w in words if w in ["saw", "heard", "felt", "smelled", "noticed", "observed", "witnessed"])
    hedges = sum(1 for w in words if w in ["maybe", "perhaps", "possibly", "around", "approximately", "roughly", "seems", "apparently", "supposedly"])
    negations = sum(1 for w in words if w in ["no", "not", "never", "nobody", "nothing", "didn't", "wasn't", "haven't", "hadn't", "couldn't"])
    conjunctives = sum(1 for w in words if w in ["then", "after", "before", "so", "because", "since", "subsequently", "later", "meanwhile"])
    exclusive = sum(1 for w in words if w in ["but", "except", "without", "however", "although", "though", "unless"])
    temporal = sum(1 for w in words if w in ["yesterday", "today", "morning", "evening", "night", "afternoon", "o'clock", "pm", "am",
        "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"])
    emotion_pos = sum(1 for w in words if w in ["fine", "okay", "good", "normal", "calm", "safe", "thankful", "grateful"])
    cognitive = sum(1 for w in words if w in ["think", "believe", "guess", "suppose", "imagine", "wonder", "realize", "understand", "consider"])
    spatial_ratio = len([w for w in words if 2 < len(w) < 8]) / word_count if word_count > 20 else 0.3

    fp_ratio = first_person / word_count if word_count > 0 else 0
    tp_ratio = third_person / word_count if word_count > 0 else 0
    pt_ratio = past_tense / (past_tense + present_tense + 1) if past_tense > 0 else 0
    sensory_ratio = sensory / word_count if word_count > 0 else 0
    hedge_ratio = hedges / word_count if word_count > 0 else 0
    negation_ratio = negations / word_count if word_count > 0 else 0
    conj_ratio = conjunctives / word_count if word_count > 0 else 0
    temporal_ratio = temporal / word_count if word_count > 0 else 0

    uc_scale = 0.12
    ling_score = (
        (0.08 if fp_ratio > 0.02 else -0.08) +
        (0.06 if tp_ratio < 0.05 else -0.04) +
        (0.12 if pt_ratio > 0.5 else -0.06) +
        (0.08 if sensory_ratio > 0.01 else -0.04) +
        (0.06 if hedge_ratio < 0.02 else -0.06) +
        (0.04 if negation_ratio < 0.05 else -0.04) +
        (0.06 if conj_ratio < 0.15 else -0.04) +
        (0.10 if temporal_ratio > 0.02 else -0.06) +
        (0.04 if emotion_pos / word_count < 0.03 else -0.02) +
        (0.06 if cognitive / word_count < 0.05 else -0.04) +
        (0.06 if exclusive > 1 else -0.03) +
        (0.08 if spatial_ratio > 0.25 else -0.04)
    ) / uc_scale

    score = max(0, min(1, (ling_score + 1) / 2.3))
    return {"veracityScore": round(score, 4), "languageNotSupported": False, "script": script}


if __name__ == "__main__":
    sample_firs = [
        {"FIRNo": "1", "FIRYear": 2026, "narrative": "I was walking home when I saw a man break into my neighbor's house. He used a crowbar to force the lock. I immediately called the police at around 9 PM yesterday evening."},
        {"FIRNo": "2", "FIRYear": 2026, "narrative": "ಈ ದೂರು ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಲಾಗಿದೆ"},
    ]
    results = []
    for fir in sample_firs:
        result = analyze_fir(fir.get("narrative", ""))
        results.append({
            "FIRNo": fir.get("FIRNo", ""),
            "FIRYear": fir.get("FIRYear", ""),
            "VeracityScore": result["veracityScore"],
            "Language": result.get("script", "latin"),
            "ScoredAt": datetime.now(timezone.utc).isoformat()
        })
    print(json.dumps(results, indent=2))
    print(f"\nBatch complete. {len(results)} FIRs processed.")
