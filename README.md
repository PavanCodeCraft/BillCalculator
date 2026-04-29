# ⚡ Bijli Bill Calculator

Electricity bill calculator for 2 rooms with shared motor pump.

## Setup

### Server
```bash
cd server
cp .env.example .env
# .env mein apna MongoDB URI daalo
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

Client: http://localhost:5173  
Server: http://localhost:4000

## .env (server/)
```
MONGODB_URI=mongodb://localhost:27017/billcalculator
PORT=4000
```
