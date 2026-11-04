import json
import logging
from typing import Any, Dict, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("gemini_client")


class GeminiClient:
    """Production client for Google Gemini LLM using REST API with structured JSON output."""

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
    MODEL = "gemini-1.5-flash"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("your_"))

    async def generate_structured_json(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends a prompt to Gemini 1.5 Flash enforcing responseMimeType="application/json".
        Returns parsed JSON dictionary.
        """
        if not self.is_configured:
            logger.warning("Gemini API key is not configured. Returning empty fallback response.")
            return {}

        endpoint = f"{self.BASE_URL}/models/{self.MODEL}:generateContent?key={self.api_key}"

        contents = [{"parts": [{"text": prompt}]}]
        body: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
                "topP": 0.8,
            },
        }

        if system_instruction:
            body["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=body)
                if response.status_code != 200:
                    logger.error(
                        f"Gemini API returned status {response.status_code}: {response.text}"
                    )
                    return {}

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    logger.warning("Gemini API returned no candidates.")
                    return {}

                text_content = (
                    candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                )
                if not text_content:
                    return {}

                # Strip potential markdown backticks ```json ... ```
                cleaned = text_content.strip()
                if cleaned.startswith("```json"):
                    cleaned = cleaned[7:]
                if cleaned.startswith("```"):
                    cleaned = cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]

                return json.loads(cleaned.strip())

        except Exception as e:
            logger.error(f"Error during Gemini API structured JSON call: {e}")
            return {}

    async def generate_text(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> str:
        """Generates qualitative prose or technical recommendations."""
        if not self.is_configured:
            return "AI service is running in local offline evaluation mode."

        endpoint = f"{self.BASE_URL}/models/{self.MODEL}:generateContent?key={self.api_key}"

        contents = [{"parts": [{"text": prompt}]}]
        body: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
            },
        }

        if system_instruction:
            body["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=body)
                if response.status_code != 200:
                    logger.error(f"Gemini API error: {response.text}")
                    return "Unable to generate evaluation narrative at this time."

                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    return (
                        candidates[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "")
                    )
                return ""
        except Exception as e:
            logger.error(f"Error calling Gemini generate_text: {e}")
            return "Evaluation generated via deterministic heuristic engine."


gemini_client = GeminiClient()
