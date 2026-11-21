import httpx


API_URL = "http://127.0.0.1:8000/api/v1/metrics"


def send_metrics(metrics):
    try:
        response = httpx.post(
            API_URL,
            json=metrics,
            timeout=5,
        )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPError as error:
        return {
            "status": "failed",
            "error": str(error),
        }
