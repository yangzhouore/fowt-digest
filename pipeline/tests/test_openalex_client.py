import json
import socket
from urllib.error import HTTPError, URLError

import pytest

from pipeline.openalex_client import (
    DEFAULT_TIMEOUT,
    OpenAlexClientError,
    OpenAlexHTTPError,
    OpenAlexJSONError,
    OpenAlexTimeoutError,
    fetch_openalex_json,
)


class FakeResponse:
    def __init__(self, payload, *, status=200):
        self.payload = payload
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def read(self):
        if isinstance(self.payload, bytes):
            return self.payload
        return json.dumps(self.payload).encode("utf-8")


def make_http_error(status, *, retry_after=None):
    headers = {}
    if retry_after is not None:
        headers["Retry-After"] = retry_after
    return HTTPError("https://example.test", status, "error", headers, None)


def test_successful_request_returns_decoded_json_and_uses_timeout():
    calls = []

    def fake_urlopen(url, *, timeout):
        calls.append((url, timeout))
        return FakeResponse({"results": [{"id": "https://openalex.org/W1"}]})

    result = fetch_openalex_json("https://api.openalex.org/works?search=floating", urlopen=fake_urlopen)

    assert result == {"results": [{"id": "https://openalex.org/W1"}]}
    assert calls == [("https://api.openalex.org/works?search=floating", DEFAULT_TIMEOUT)]


def test_identical_input_is_handled_deterministically():
    def fake_urlopen(url, *, timeout):
        return FakeResponse({"url": url, "timeout": timeout})

    first = fetch_openalex_json("https://api.openalex.org/works?search=floating", urlopen=fake_urlopen)
    second = fetch_openalex_json("https://api.openalex.org/works?search=floating", urlopen=fake_urlopen)

    assert first == second


def test_http_400_is_not_retried():
    calls = []

    def fake_urlopen(url, *, timeout):
        calls.append(url)
        raise make_http_error(400)

    with pytest.raises(OpenAlexHTTPError, match="HTTP 400"):
        fetch_openalex_json("https://api.openalex.org/works", urlopen=fake_urlopen)

    assert calls == ["https://api.openalex.org/works"]


def test_http_500_is_retried_then_succeeds():
    responses = [make_http_error(500), make_http_error(502), FakeResponse({"ok": True})]
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        response = responses.pop(0)
        if isinstance(response, HTTPError):
            raise response
        return response

    result = fetch_openalex_json(
        "https://api.openalex.org/works",
        urlopen=fake_urlopen,
        sleep=sleep_calls.append,
    )

    assert result == {"ok": True}
    assert sleep_calls == [2, 5]


def test_http_429_respects_retry_after_when_longer_than_planned_delay():
    responses = [make_http_error(429, retry_after="7"), FakeResponse({"ok": True})]
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        response = responses.pop(0)
        if isinstance(response, HTTPError):
            raise response
        return response

    result = fetch_openalex_json(
        "https://api.openalex.org/works",
        urlopen=fake_urlopen,
        sleep=sleep_calls.append,
    )

    assert result == {"ok": True}
    assert sleep_calls == [7.0]


def test_http_503_fails_after_three_retries():
    calls = []
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        calls.append(url)
        raise make_http_error(503)

    with pytest.raises(OpenAlexHTTPError, match="HTTP 503"):
        fetch_openalex_json(
            "https://api.openalex.org/works",
            urlopen=fake_urlopen,
            sleep=sleep_calls.append,
        )

    assert len(calls) == 4
    assert sleep_calls == [2, 5, 10]


def test_timeout_is_retried_then_raises_timeout_error():
    calls = []
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        calls.append(url)
        raise socket.timeout("timed out")

    with pytest.raises(OpenAlexTimeoutError, match="timed out"):
        fetch_openalex_json(
            "https://api.openalex.org/works",
            urlopen=fake_urlopen,
            sleep=sleep_calls.append,
        )

    assert len(calls) == 4
    assert sleep_calls == [2, 5, 10]


def test_url_error_timeout_is_retried():
    responses = [URLError(TimeoutError("timed out")), FakeResponse({"ok": True})]
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        response = responses.pop(0)
        if isinstance(response, URLError):
            raise response
        return response

    result = fetch_openalex_json(
        "https://api.openalex.org/works",
        urlopen=fake_urlopen,
        sleep=sleep_calls.append,
    )

    assert result == {"ok": True}
    assert sleep_calls == [2]


def test_non_timeout_url_error_is_not_retried():
    calls = []

    def fake_urlopen(url, *, timeout):
        calls.append(url)
        raise URLError("dns failed")

    with pytest.raises(OpenAlexClientError, match="dns failed"):
        fetch_openalex_json("https://api.openalex.org/works", urlopen=fake_urlopen)

    assert calls == ["https://api.openalex.org/works"]


def test_invalid_json_raises_clear_error():
    def fake_urlopen(url, *, timeout):
        return FakeResponse(b"not-json")

    with pytest.raises(OpenAlexJSONError, match="invalid JSON"):
        fetch_openalex_json("https://api.openalex.org/works", urlopen=fake_urlopen)


def test_non_success_response_status_retries_when_retryable():
    responses = [FakeResponse({"error": "bad"}, status=500), FakeResponse({"ok": True})]
    sleep_calls = []

    def fake_urlopen(url, *, timeout):
        return responses.pop(0)

    result = fetch_openalex_json(
        "https://api.openalex.org/works",
        urlopen=fake_urlopen,
        sleep=sleep_calls.append,
    )

    assert result == {"ok": True}
    assert sleep_calls == [2]


def test_non_retryable_response_status_raises_http_error():
    def fake_urlopen(url, *, timeout):
        return FakeResponse({"error": "bad"}, status=400)

    with pytest.raises(OpenAlexHTTPError, match="HTTP 400"):
        fetch_openalex_json("https://api.openalex.org/works", urlopen=fake_urlopen)


def test_empty_query_url_is_rejected():
    with pytest.raises(ValueError, match="query_url"):
        fetch_openalex_json(" ")
