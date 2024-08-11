## Rewrite of

To run the code, you need to have the following installed:

- Node == 18

To get started:

1. Clone the repository

```
git clone https://github.com/wathika-eng/wakatime_leaderboard --depth 1 && cd wakatime_leaderboard
```

2. Install the dependencies

```
npm install && npm install --prefix frontend
```

3. Build the frontend client

```
npm run build --prefix frontend
```

4. Run the code

```
npm run dev
```

Endpoints:
`http://localhost:5000/api`

Original endpoint:
`https://wakatime.com/api/v1/leaders?country_code={KE}`
