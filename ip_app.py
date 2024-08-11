from flask import Flask, jsonify, request, redirect, url_for
from flask_cors import CORS
from flask_caching import Cache
import requests
import json
import time

app = Flask(__name__)
CORS(app)


app.config["CACHE_TYPE"] = "SimpleCache"  #
app.config["CACHE_DEFAULT_TIMEOUT"] = 1200

cache = Cache(app)


MAX_REQUESTS_PER_HOUR = 50
request_count = 0
last_reset_time = time.time()


@app.route("/api/leaders", methods=["GET"])
@cache.cached(timeout=1200, query_string=True)
def get_top_leaders():
    global request_count, last_reset_time
    current_time = time.time()

    if current_time - last_reset_time > 3600:
        request_count = 0
        last_reset_time = current_time

    if request_count >= MAX_REQUESTS_PER_HOUR:
        return (
            jsonify(
                {
                    "error": "Maximum number of requests reached. Please sign in or create an account to continue."
                }
            ),
            429,
        )
    else:
        request_count += 1

    url = "https://wakatime.com/api/v1/leaders"
    params = {"limit": 10}

    ip_info_response = requests.get("https://api.myip.com")
    if ip_info_response.status_code == 200:
        ip_info = ip_info_response.json()
        print(ip_info)
        country_code = ip_info.get("cc")

        if country_code:
            params["country_code"] = country_code

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()["data"]
        stripped_data = []

        for leader in data[:15]:  # Get the top 15 leaders
            if "user" in leader:
                user = leader["user"]
                city = user.get("city")
                if city:
                    user_title = city.get("title", "")
                    country_code = city.get("country_code", "")
                else:
                    user_title = ""
                    country_code = ""
            else:
                user_title = ""
                country_code = ""

            if "running_total" in leader:
                running_total = leader["running_total"]
                running_total_seconds = running_total["total_seconds"]
                running_total_human_readable = running_total["human_readable_total"]
                top_3_languages = [
                    {"name": lang["name"], "total_seconds": lang["total_seconds"]}
                    for lang in running_total["languages"][:3]
                ]
            else:
                running_total_seconds = 0
                running_total_human_readable = ""
                top_3_languages = []

            stripped_leader = {
                "rank": leader["rank"],
                "username": user["username"],
                "city": user_title,
                "country_code": country_code,
                "running_total_seconds": running_total_seconds,
                "running_total_human_readable": running_total_human_readable,
                "top_3_languages": top_3_languages,
            }
            stripped_data.append(stripped_leader)

        return jsonify(stripped_data)
    else:
        return (
            jsonify(
                {
                    "error": f"Failed to fetch data: {response.status_code}, {response.text}"
                }
            ),
            response.status_code,
        )


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def catch_all(path):
    return redirect(url_for("get_top_leaders"))


if __name__ == "__main__":
    app.run(debug=True, port=5000, load_dotenv=True)
