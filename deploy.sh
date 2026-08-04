#!/bin/bash
set -e

echo "=== Node.js ==="
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v

echo "=== app code ==="
rm -rf /opt/boujee-book
git clone https://github.com/zork-commits/boujee-book-live.git /opt/boujee-book
cd /opt/boujee-book
npm install --no-audit --no-fund
npx vite build

mkdir -p /opt/boujee-book-data

echo "=== systemd service ==="
cat > /etc/systemd/system/boujee-book.service <<'SVCEOF'
[Unit]
Description=Boujee Book
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/boujee-book
Environment=NODE_ENV=production
Environment=PORT=8080
Environment=HOST=0.0.0.0
Environment=DATABASE_URL=file:/opt/boujee-book-data/boujee.db
Environment=SEED_DEMO=1
Environment=COOKIE_SECURE=0
ExecStart=/usr/bin/node /opt/boujee-book/serve.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SVCEOF
systemctl daemon-reload
systemctl enable boujee-book
systemctl restart boujee-book

echo "=== nginx ==="
if ! command -v nginx >/dev/null; then
  # unattended-upgrades may briefly hold the dpkg lock right after boot — wait it out
  for i in $(seq 1 30); do
    if apt-get install -y nginx 2>/dev/null; then break; fi
    echo "waiting for apt lock ($i/30)..."; sleep 10
  done
fi
command -v nginx >/dev/null || { echo "nginx failed to install"; exit 1; }

cat > /etc/nginx/sites-available/boujeebook <<'NGINXEOF'
server {
  listen 80;
  server_name boujeebook.com www.boujeebook.com;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
server {
  listen 80;
  server_name app.boujeebook.com;
  location = / {
    return 302 /app;
  }
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINXEOF
ln -sf /etc/nginx/sites-available/boujeebook /etc/nginx/sites-enabled/boujeebook
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "=== auto-deploy timer ==="
cat > /opt/boujee-book-update.sh <<'UPDEOF'
#!/bin/bash
set -e
cd /opt/boujee-book
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD); REMOTE=$(git rev-parse origin/main)
[ "$LOCAL" = "$REMOTE" ] && exit 0
echo "updating $LOCAL -> $REMOTE"
git reset --hard origin/main --quiet
npm install --no-audit --no-fund
npx vite build
systemctl restart boujee-book
echo "deployed $REMOTE"
UPDEOF
chmod +x /opt/boujee-book-update.sh

cat > /etc/systemd/system/boujee-book-update.service <<'USVCEOF'
[Unit]
Description=Boujee Book auto-deploy check
[Service]
Type=oneshot
ExecStart=/opt/boujee-book-update.sh
USVCEOF

cat > /etc/systemd/system/boujee-book-update.timer <<'UTMREOF'
[Unit]
Description=Boujee Book auto-deploy every 2 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=2min
[Install]
WantedBy=timers.target
UTMREOF
systemctl daemon-reload
systemctl enable --now boujee-book-update.timer

sleep 2
echo ""
echo "=== status ==="
systemctl --no-pager status boujee-book | head -6
curl -s -o /dev/null -w "app (direct, port 8080): HTTP %{http_code}\n" http://localhost:8080/
curl -s -o /dev/null -w "nginx (port 80): HTTP %{http_code}\n" -H "Host: boujeebook.com" http://localhost/
echo ""
echo "Server IP: $(curl -s ifconfig.me)"
echo "Once DNS points here: http://boujeebook.com and http://app.boujeebook.com"
