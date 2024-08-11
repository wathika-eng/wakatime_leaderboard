# wakatime_flask_api

Ensure you have python3, pip and virtualenv installed in your OS, then:

Fork/clone to your PC:

```
git clone https://github.com/wathika-eng/wakatime_flask_api.git --depth 1
cd wakatime_flask_api
```

Create and activate a virtual environment

```
virtualenv .venv
```

Linux:

```
source .venv/bin/activate
```

Windows:

```
source .venv/scripts/activate
```

Install all requirements needed:

```
pip install -r requirements.txt
```

Copy the `.env.example` file to `.env` and fill in the required fields.

```
cp .env.example .env
```

Run main app:

```
flask run
```

or

```
python ip_app.py
```
