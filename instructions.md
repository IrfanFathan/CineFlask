# ⚙️ CineLocal — Setup & Deployment Instructions
> Run your private streaming platform on any old PC or laptop

---

## Prerequisites

You need one thing installed on the hosting PC before you begin:

**Node.js 20 LTS** — download from [https://nodejs.org](https://nodejs.org) and install with all defaults.

Verify it worked by opening a terminal and running:
```bash
node --version   # should print v20.x.x
npm --version    # should print 10.x.x
```

No other software is required.

---

## Step 1 — Get Your LAN IP Address

This is the address other devices will use to reach your server.

### Windows
1. Press `Win + R`, type `cmd`, press Enter
2. Run: `ipconfig`
3. Look for **"IPv4 Address"** under your Wi-Fi adapter
4. It will look like: `192.168.1.45`

### macOS
1. Open Terminal
2. Run: `ipconfig getifaddr en0`
3. The output is your LAN IP (e.g. `192.168.1.45`)

### Linux
1. Open Terminal
2. Run: `ip addr show` or `hostname -I`
3. Look for an address starting with `192.168.` or `10.0.`

> ⚠️ Write this IP down. You will use it in `.env` and when connecting other devices.

---

## Step 2 — Project Setup

1. Download or clone the project folder to your PC

2. Open a terminal inside the project folder

3. Install all dependencies:
```bash
npm install
```

4. Create your configuration file:
```bash
cp .env.example .env
```

5. Open `.env` in any text editor and fill it in:
```env
PORT=3000
HOST_IP=192.168.1.45        # Replace with YOUR LAN IP from Step 1
JWT_SECRET=change_this_to_a_long_random_string_minimum_32_chars
OMDB_API_KEY=your_omdb_key  # Get free key at https://www.omdbapi.com/apikey
```

---

## Step 3 — Get Your Free OMDB API Key

1. Go to [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Select **"FREE (1,000 daily limit)"**
3. Enter your email and submit
4. Check your email for the activation link and click it
5. Copy the key (looks like `a1b2c3d4`) into your `.env` file

> The free tier gives 1,000 metadata lookups per day — more than enough for personal use.

---

## Step 4 — Initialise the Database

Run once to create all tables:
```bash
node database/init.js
```

You should see:
```
✓ Database initialised — all tables created.
```

This creates a file called `cinelocal.db` in your project folder. All your users, movies, and watch progress live here.

---

## Step 5 — Start the Server

```bash
node server.js
```

You should see:
```
✓ CineLocal running at http://192.168.1.45:3000
  → Open this URL on any device connected to your Wi-Fi
```

The server is now live on your local network.

---

## Step 6 — Connect from Other Devices

On any phone, tablet, or laptop connected to the **same Wi-Fi network**:

1. Open any browser (Chrome, Safari, Firefox — all work)
2. Type the address: `http://192.168.1.45:3000`
   (use your actual LAN IP from Step 1)
3. The CineLocal login page will appear
4. Register an account and start using it

> No app install needed. It works like any website.

---

## Step 7 — Uploading Movies

1. Log into CineLocal from any device on your network
2. Click the **Upload** button in the navigation
3. Either drag-and-drop a video file, or tap/click to browse
4. Enter the movie title if it differs from the filename
5. Click **Upload**
6. The server will save the file and automatically fetch the poster, cast, rating, and description from OMDB
7. The movie appears in the home grid immediately

**Supported formats:** MP4, MKV, AVI, MOV, WebM
**Recommended:** MP4 (H.264) for best compatibility across all browsers

> Large files (10GB+) are supported via chunked upload. Do not close the browser tab during upload.

---

## Step 8 — Auto-Start on Boot (Optional)

So CineLocal starts automatically whenever the PC turns on:

### Install PM2
```bash
npm install -g pm2
```

### Start with PM2
```bash
pm2 start server.js --name cinelocal
pm2 save
pm2 startup
```

Copy and run the command that `pm2 startup` outputs (it will be specific to your OS).

To stop CineLocal:
```bash
pm2 stop cinelocal
```

To view logs:
```bash
pm2 logs cinelocal
```

---

## Troubleshooting

### "I can't connect from my phone"
- Make sure both devices are on the **same Wi-Fi network** (not mobile data)
- Check you used the right LAN IP in the URL
- Make sure the server is running (`node server.js` should still be in your terminal)
- On Windows: check Windows Firewall is not blocking port 3000

  To allow port 3000 on Windows:
  1. Search "Windows Defender Firewall" → Advanced Settings
  2. Inbound Rules → New Rule → Port → TCP → 3000 → Allow

### "Video won't play / seek doesn't work"
- Make sure you're using an MP4 file (H.264 codec)
- MKV files may not play in Safari — convert to MP4 using HandBrake (free)
- The range request streaming is required for seek — do not disable it

### "Poster is not showing"
- Check your OMDB API key is correct in `.env`
- Make sure you activated the key via the email link
- Try searching the exact movie title as it appears on IMDb

### "Server crashes on large upload"
- This is a memory issue — increase Node's heap: `node --max-old-space-size=4096 server.js`

### "My LAN IP changed"
- Router DHCP can change your IP after a reboot
- Fix: assign a **static IP** to your PC in your router's settings (look for "DHCP reservation" or "Static DHCP")
- Update the `HOST_IP` in `.env` and restart the server

---

## Keeping Your Data Safe

- Back up `cinelocal.db` regularly — this file contains all users and metadata
- Back up the `/uploads/` folder — this is where your video files are stored
- Neither file is in any cloud; if the PC's drive fails, both are lost without a backup

---

## Updating CineLocal

```bash
# Stop the server first
pm2 stop cinelocal  # or Ctrl+C if running manually

# Pull the latest code
git pull

# Install any new dependencies
npm install

# Restart
pm2 start cinelocal  # or node server.js
```
