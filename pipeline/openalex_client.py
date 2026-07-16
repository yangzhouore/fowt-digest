"""Minimal OpenAlex HTTP client for fetching raw JSON responses."""

from __future__ import annotations

import json
import socket
import time
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import urlopen as urllib_urlopen

DEFAULT_TIMEOUT = 20
_RETRY_DELAYS = (2, 5, 10)
_RETRY_HTTP_STATUSES = {429}


class OpenAlexClientError(RuntimeError):
    """Base error for OpenAlex client failures."""


class OpenAlexHTTPError(OpenAlexClientError):
    """Raised when OpenAlex returns an unsuccessful HTTP response."""


class OpenAlexTimeoutError(OpenAlexClientError):
    """Raised when OpenAlex requests time out after retries."""


class OpenAlexJSONError(OpenAlexClientError):
    """Raised when OpenAlex returns invalid JSON."""


def fetch_openalex_json(
    query_url: str,
    *,
    timeout: int = DEFAULT_TIMEOUT,
    urlopen: Callable[..., Any] = urllib_urlopen,
    sleep: Callable[[float], None] = time.sleep,
) -> Any:
    """Fetch and decode raw JSON from an OpenAlex query URL."""
    if not query_url.strip():
        raise ValueError("query_url must not be empty")

    last_timeout: BaseException | None = None

    for attempt in range(len(_RETRY_DELAYS) + 1):
        try:
            with urlopen(query_url, timeout=timeout) as response:
                status = getattr(response, "status", 200)
                if status < 200 or status >= 300:
                    if _should_retry_http_status(status) and attempt < len(_RETRY_DELAYS):
                        sleep(_RETRY_DELAYS[attempt])
                        continue
                    raise OpenAlexHTTPError(f"OpenAlex returned HTTP {status}")

                body = response.read().decode("utf-8")
                return json.loads(body)
        except HTTPError as error:
            if not _should_retry_http_status(error.code) or attempt == len(_RETRY_DELAYS):
                raise OpenAlexHTTPError(f"OpenAlex returned HTTP {error.code}") from error
            sleep(_retry_delay(attempt, error))
        except (TimeoutError, socket.timeout) as error:
            last_timeout = error
            if attempt == len(_RETRY_DELAYS):
                raise OpenAlexTimeoutError("OpenAlex request timed out") from last_timeout
            sleep(_RETRY_DELAYS[attempt])
        except URLError as error:
            if _is_url_timeout(error):
                last_timeout = error
                if attempt == len(_RETRY_DELAYS):
                    raise OpenAlexTimeoutError("OpenAlex request timed out") from last_timeout
                sleep(_RETRY_DELAYS[attempt])
            else:
                raise OpenAlexClientError(f"OpenAlex request failed: {error.reason}") from error
        except json.JSONDecodeError as error:
            raise OpenAlexJSONError("OpenAlex returned invalid JSON") from error

    raise OpenAlexClientError("OpenAlex request failed")


def _should_retry_http_status(status: int) -> bool:
    return status in _RETRY_HTTP_STATUSES or 500 <= status <= 599


def _retry_delay(attempt: int, error: HTTPError) -> float:
    planned_delay = _RETRY_DELAYS[attempt]
    retry_after = _retry_after_seconds(error)
    if retry_after is None:
        return planned_delay
    return max(planned_delay, retry_after)


def _retry_after_seconds(error: HTTPError) -> float | None:
    value = error.headers.get("Retry-After") if error.headers else None
    if value is None:
        return None

    try:
        return float(value)
    except ValueError:
        return None


def _is_url_timeout(error: URLError) -> bool:
    return isinstance(error.reason, TimeoutError | socket.timeout)
