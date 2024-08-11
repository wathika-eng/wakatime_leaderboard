from flask import Flask, jsonify, request, redirect, url_for
from flask_cors import CORS
from flask_caching import Cache
import requests
import time

app = Flask(__name__)
CORS(app)

# Configure Flask-Caching
cache = Cache(app, config={"CACHE_TYPE": "simple"})

MAX_REQUESTS_PER_HOUR = 60
request_count = 0
last_reset_time = time.time()


@app.route("/api/leaders", methods=["GET"])
@cache.cached(timeout=1200, query_string=True)  # Cache results for 20 minutes
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

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    q = request.args.get("q", "")

    offset = (page - 1) * per_page

    params = {"limit": per_page, "offset": offset}

    country_code = request.args.get("country_code")
    if country_code:
        params["country_code"] = country_code

    response = requests.get(url, params=params)
    print(response.url)
    if response.status_code == 200:
        data = response.json()["data"]
        stripped_data = []

        for leader in data:
            if "user" in leader:
                user = leader["user"]
                username = user.get("username", "")
                city = user.get("city")
                if city:
                    user_title = city.get("title", "")
                    country_code = city.get("country_code", "")
            else:
                username = ""
                user_title = ""
                country_code = ""

            if "running_total" in leader:
                running_total = leader["running_total"]
                running_daily = running_total["human_readable_daily_average"]
                running_total_human_readable = running_total["human_readable_total"]
                top_3_languages = [
                    {"name": lang["name"], "total_seconds": lang["total_seconds"]}
                    for lang in running_total["languages"][:3]
                ]
            else:
                running_daily = 0
                running_total_human_readable = ""
                top_3_languages = []

            stripped_leader = {
                "rank": leader["rank"],
                "username": username,
                "user_title": user_title,
                "country_code": country_code,
                "running_daily": running_daily,
                "running_total_human_readable": running_total_human_readable,
                "top_3_languages": top_3_languages,
            }
            stripped_data.append(stripped_leader)
        if q:
            stripped_data = [
                leader
                for leader in stripped_data
                if q.lower() in leader["username"].lower()
            ]
        else:
            stripped_data = stripped_data

        return jsonify({"page": page, "per_page": per_page, "data": stripped_data})

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
