"""
Client Xtream Codes — implémenté selon la spec player_api.php documentée publiquement.
Référence : https://github.com/tellytv/go.xtream-codes (spec non officielle mais stable)
"""
import logging
import requests
from typing import Optional, List, Dict, Any
from django.conf import settings

logger = logging.getLogger(__name__)

STREAM_TYPES = {"live": "live", "movie": "movie", "series": "series"}
XTREAM_HEADERS = {"User-Agent": "krxplayer"}


class XtreamClient:
    def __init__(self, server_url: str = None, username: str = None, password: str = None):
        self.server_url = (server_url or settings.XTREAM_SERVER_URL).rstrip("/")
        self.username = username or settings.XTREAM_USERNAME
        self.password = password or settings.XTREAM_PASSWORD
        self.session = requests.Session()
        self.session.headers.update(XTREAM_HEADERS)

    @property
    def _base_params(self) -> Dict[str, str]:
        return {"username": self.username, "password": self.password}

    def _get(self, action: str, extra_params: dict = None) -> Any:
        params = {**self._base_params, "action": action}
        if extra_params:
            params.update(extra_params)
        url = f"{self.server_url}/player_api.php"
        resp = self.session.get(url, params=params, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def get_account_info(self) -> Dict:
        return self._get("get_account_info")

    def get_live_categories(self) -> List[Dict]:
        return self._get("get_live_categories") or []

    def get_live_streams(self, category_id: Optional[int] = None) -> List[Dict]:
        params = {}
        if category_id:
            params["category_id"] = category_id
        return self._get("get_live_streams", params) or []

    def get_vod_categories(self) -> List[Dict]:
        return self._get("get_vod_categories") or []

    def get_vod_streams(self, category_id: Optional[int] = None) -> List[Dict]:
        params = {}
        if category_id:
            params["category_id"] = category_id
        return self._get("get_vod_streams", params) or []

    def get_series_categories(self) -> List[Dict]:
        return self._get("get_series_categories") or []

    def get_series(self, category_id: Optional[int] = None) -> List[Dict]:
        params = {}
        if category_id:
            params["category_id"] = category_id
        return self._get("get_series", params) or []

    def get_series_info(self, series_id: int) -> Dict:
        return self._get("get_series_info", {"series_id": series_id})

    def get_vod_info(self, vod_id: int) -> Dict:
        return self._get("get_vod_info", {"vod_id": vod_id})

    def get_epg(self, stream_id: int, limit: int = 10) -> Dict:
        return self._get("get_short_epg", {"stream_id": stream_id, "limit": limit})

    def get_stream_url(self, stream_id: int, stream_type: str, ext: str = "m3u8") -> str:
        """Construit l'URL de stream HLS depuis les credentials Xtream."""
        if stream_type not in STREAM_TYPES:
            raise ValueError(f"stream_type invalide: {stream_type}")
        if stream_type == "live":
            return f"{self.server_url}/live/{self.username}/{self.password}/{stream_id}.{ext}"
        elif stream_type == "movie":
            return f"{self.server_url}/movie/{self.username}/{self.password}/{stream_id}.{ext}"
        else:
            return f"{self.server_url}/series/{self.username}/{self.password}/{stream_id}.{ext}"
