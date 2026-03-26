# 🚀 QUICKSTART GUIDE

Get CineLocal running in **5 minutes**!

---

## Prerequisites

Install [Node.js 20 LTS](https://nodejs.org)

---

## Setup (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Create config file
cp .env.example .env

# 3. Edit .env file with your details:
#    - JWT_SECRET: any long random string (min 32 chars)
#    - HOST_IP: your computer's LAN IP address
#    - OMDB_API_KEY: get free key at https://www.omdbapi.com/apikey.aspx

# 4. Initialize database
npm run setup

# 5. Start server
npm start
```

---

## Find Your LAN IP

### Windows
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.45`)

### Mac
```bash
ipconfig getifaddr en0
```

### Linux
```bash
hostname -I
```

---

## Access from Other Devices

1. Connect phone/tablet to **same Wi-Fi** as your PC
2. Open browser (Chrome, Safari, Firefox)
3. Navigate to: `http://YOUR_LAN_IP:3000`
4. Register account and start streaming!

---

## Troubleshooting

### Can't connect from phone?
- Both devices must be on same Wi-Fi
- Check firewall settings (allow port 3000)
- Verify server is running

### Video won't play?
- Use MP4 format (H.264 codec)
- Convert with [HandBrake](https://handbrake.fr/) if needed

### No metadata/posters?
- Get OMDB API key (free)
- Add to `.env` file
- Restart server

---

## What's Next?

- Upload movies via the Upload button
- Search, create profiles, build watchlists
- Stream to any device on your network!

Full documentation: [README.md](./README.md)

---

**Enjoy your private cinema! 🎬**
