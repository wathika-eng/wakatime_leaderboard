import unittest
from unittest.mock import patch, MagicMock
import app


class TestGetTopLeadersEndpoint(unittest.TestCase):
    @patch("get_leaders")
    def test_get_top_leaders(self, mock_requests):
        # Mock the response from api.myip.com
        mock_ip_response = MagicMock()
        mock_ip_response.status_code = 200
        mock_ip_response.json.return_value = {"country_code": "KE"}
        mock_requests.get.return_value = mock_ip_response

        # Mock the response from wakatime.com
        mock_wakatime_response = MagicMock()
        mock_wakatime_response.status_code = 200
        mock_wakatime_response.json.return_value = {
            "data": [{"user": {"username": "test_user"}}]
        }
        mock_requests.get.return_value = mock_wakatime_response

        # Make a request to the endpoint
        with app.test_client() as client:
            response = client.get("/api/leaders")

            # Check if the response is successful
            self.assertEqual(response.status_code, 200)

            # Check if the response contains the expected data
            data = response.get_json()
            self.assertEqual(len(data), 1)
            self.assertEqual(data[0]["username"], "test_user")


if __name__ == "__main__":
    unittest.main()
