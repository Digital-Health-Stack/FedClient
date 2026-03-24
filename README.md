# [Bodh.AI](http://Bodh.AI)

FastAPI backend and Vite/React frontend for the federated client.

## Prerequisites

- Python 3 with `venv`
- Node.js and npm
- `concurrently` (e.g. `npm install -g concurrently`) — used by `start_local.sh`
- Redis on `localhost:6380` (optional but expected by the app defaults)

## Replicate & install

```bash
git clone <repo-url> client
cd client
cp .env.example .env
cp .env.example frontend/.env   
chmod +x install_local.sh start_local.sh
./install_local.sh
```

Edit `backend/.env` and `frontend/.env` if your API URLs or storage paths differ from the examples.

## Run

From the repo root:

```bash
./start_local.sh
```

- Backend: `http://0.0.0.0:9090` (reload)
- Frontend dev server: port **5174** (see `frontend/vite.config.js`)

