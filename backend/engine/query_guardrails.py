"""Query guardrails for intent classification and fast-path responses."""
from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Optional


@dataclass(frozen=True)
class GuardrailResult:
    """Immutable result of a query guardrail evaluation."""
    allowed: bool
    response: Optional[str] = None
    action: str = "allow"
    reason: Optional[str] = None


class QueryGuardrails:
    """Classifies queries to bypass heavy processing or reject out-of-context inputs."""

    GREETINGS = r"^\s*(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b"
    SENDOFFS = r"^\s*(bye|goodbye|see you|cya|thanks|thank you|ok|okay)\b"
    REJECTION_MESSAGE = "I am the BIS assistant. I only answer questions related to Indian Standards and procurement."

    OUT_OF_CONTEXT_KEYWORDS = {
        "poem", "song", "joke", "recipe", "cook", "weather in",
        "movie recommendation", "write code", "python script", "javascript",
        "story about", "tell me a story"
    }

    ADVERSARIAL_PATTERNS = [
        r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
        r"(what\s+is|tell\s+me|reveal|show|print|display)\s+(the\s+|your\s+)?system\s+prompt",
        r"you\s+are\s+now\s+(DAN|unrestricted|an\s+AI\s+without\s+rules)",
        r"bypass\s+all\s+(rules|guidelines|guardrails)",
    ]

    @classmethod
    def check_fast_path(cls, query: str) -> Optional[str]:
        """Check if query is a simple greeting or send-off to bypass LLM entirely."""
        query_lower = query.lower().strip()
        query_clean = re.sub(r'[^\w\s]', '', query_lower)

        if re.match(cls.GREETINGS, query_clean) and len(query_clean.split()) <= 4:
            return "Hi, I am the BIS assistant. How can I help you with Indian Standards or procurement today?"

        if re.match(cls.SENDOFFS, query_clean) and len(query_clean.split()) <= 4:
            return "Goodbye! Feel free to ask if you need further assistance with BIS standards."

        return None

    @classmethod
    def check_out_of_context(cls, query: str) -> bool:
        """Check if query contains highly out-of-context requests."""
        query_lower = query.lower()
        return any(
            bool(re.search(r"\b" + re.escape(kw) + r"\b", query_lower))
            for kw in cls.OUT_OF_CONTEXT_KEYWORDS
        )

    @classmethod
    def check_adversarial(cls, query: str) -> bool:
        """Check if query contains prompt injection or jailbreak patterns."""
        return any(re.search(pat, query, re.IGNORECASE) for pat in cls.ADVERSARIAL_PATTERNS)

    @classmethod
    def evaluate(cls, query: str) -> GuardrailResult:
        """Evaluate query and return structured GuardrailResult."""
        if not query or not query.strip():
            return GuardrailResult(
                allowed=False,
                response="Please provide a query related to Indian Standards or procurement.",
                action="rejection",
                reason="empty_query",
            )

        fast_path = cls.check_fast_path(query)
        if fast_path:
            return GuardrailResult(allowed=False, response=fast_path, action="fast_path", reason="greeting_or_sendoff")

        if cls.check_out_of_context(query):
            return GuardrailResult(allowed=False, response=cls.REJECTION_MESSAGE, action="rejection", reason="out_of_context")

        if cls.check_adversarial(query):
            return GuardrailResult(allowed=False, response=cls.REJECTION_MESSAGE, action="rejection", reason="adversarial_prompt")

        return GuardrailResult(allowed=True, response=None, action="allow", reason=None)

