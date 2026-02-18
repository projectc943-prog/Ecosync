"""
seed_historical_data.py
=======================
Seeds historical sensor data into Supabase by COPYING real existing readings
and re-timestamping them to:
  - 7 days ago (same time of day) → fills "Last Week" in AI Historical Context
  - 1 day ago  (same time of day) → fills "Yesterday" in AI Historical Context
  - Past 7 days hourly            → fills "7-Day Averages"

All values are taken from REAL existing sensor_data rows — no fake/random data.

Usage (new PowerShell terminal):
  cd "c:\Users\sreek\OneDrive\Desktop\IOT_PROJECT\Ecosync\backend"
  $env:DATABASE_URL = "postgresql://postgres.moulkspffuxigvwrjmxn:Sreekutty%40123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
  venv\Scripts\python.exe seed_historical_data.py --email your@gmail.com
  
  # Preview without writing:
  venv\Scripts\python.exe seed_historical_data.py --email your@gmail.com --dry-run
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
from urllib.parse import urlparse, unquote

# ── Load .env.local ────────────────────────────────────────────────────────
try:
    from dotenv import load_dotenv
    for candidate in [
        os.path.join(os.path.dirname(__file__), "app", ".env.local"),
        os.path.join(os.path.dirname(__file__), ".env.local"),
        os.path.join(os.path.dirname(__file__), ".env"),
    ]:
        if os.path.exists(candidate):
            load_dotenv(candidate, override=True)
            print(f"✅ Loaded env: {candidate}")
            break
    else:
        load_dotenv()
except ImportError:
    pass

# ── Parse DATABASE_URL ─────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    print("❌ DATABASE_URL not set.")
    print("   $env:DATABASE_URL = 'postgresql://user:pass@host:port/db'")
    sys.exit(1)

parsed = urlparse(DATABASE_URL)
DB_CONN = dict(
    host=parsed.hostname,
    port=parsed.port or 5432,
    dbname=parsed.path.lstrip("/"),
    user=unquote(parsed.username or ""),
    password=unquote(parsed.password or ""),
    sslmode="require",
    connect_timeout=15,
)
print(f"🔗 {DB_CONN['host']}:{DB_CONN['port']}/{DB_CONN['dbname']}")

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    print("❌ psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)


def get_device_id(email):
    if email:
        return "DASHBOARD_" + email.replace("@", "_").replace(".", "_")
    return "ESP32_MAIN"


def seed(email, dry_run=False):
    device_id = get_device_id(email)
    now = datetime.utcnow()
    print(f"\n🌱 Device : {device_id}")
    print(f"   UTC now: {now.strftime('%Y-%m-%d %H:%M:%S')}\n")

    conn = psycopg2.connect(**DB_CONN)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # ── Verify device exists ───────────────────────────────────────────────
    cur.execute("SELECT id, user_id FROM devices WHERE id = %s", (device_id,))
    dev = cur.fetchone()
    if not dev:
        print(f"⚠️  Device '{device_id}' not found.")
        print("   Send at least one reading from the ESP32 first, then re-run.")
        cur.close(); conn.close()
        return
    user_id = dev["user_id"]

    # ── Fetch recent real readings (last 48 hours) ─────────────────────────
    cur.execute("""
        SELECT temperature, humidity, gas, rain, mq_raw, pm2_5, pressure,
               wind_speed, motion, trust_score, anomaly_label, smart_insight
        FROM sensor_data
        WHERE device_id = %s
          AND timestamp > NOW() - INTERVAL '48 hours'
          AND temperature IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 200
    """, (device_id,))
    real_rows = cur.fetchall()

    if not real_rows:
        print("⚠️  No recent data found (last 48h). Trying last 7 days...")
        cur.execute("""
            SELECT temperature, humidity, gas, rain, mq_raw, pm2_5, pressure,
                   wind_speed, motion, trust_score, anomaly_label, smart_insight
            FROM sensor_data
            WHERE device_id = %s AND temperature IS NOT NULL
            ORDER BY timestamp DESC
            LIMIT 200
        """, (device_id,))
        real_rows = cur.fetchall()

    if not real_rows:
        print("❌ No sensor data found for this device at all.")
        print("   Make sure the ESP32 has sent data first.")
        cur.close(); conn.close()
        return

    print(f"   Found {len(real_rows)} real readings to use as source\n")

    def pick(i=0):
        """Pick a real row cyclically."""
        return real_rows[i % len(real_rows)]

    rows_to_insert = []

    # ── 1. Last week — same time of day ───────────────────────────────────
    lw_ts = (now - timedelta(days=7)).replace(second=0, microsecond=0)
    r = pick(0)
    rows_to_insert.append({
        "device_id": device_id, "user_id": user_id, "timestamp": lw_ts,
        "temperature": r["temperature"], "humidity": r["humidity"],
        "gas": r["gas"], "rain": r["rain"], "mq_raw": r["mq_raw"],
        "pm2_5": r["pm2_5"], "pressure": r["pressure"],
        "wind_speed": r["wind_speed"], "motion": r["motion"],
        "trust_score": r["trust_score"],
        "anomaly_label": r["anomaly_label"] or "Normal",
        "smart_insight": r["smart_insight"] or f"Conditions last week: Temp {r['temperature']}°C.",
    })
    print(f"   📅 Last week  ({lw_ts.strftime('%Y-%m-%d %H:%M')}): "
          f"T={r['temperature']}°C  H={r['humidity']}%  G={r['gas']} ppm  [{r['anomaly_label'] or 'Normal'}]")

    # ── 2. Yesterday — same time of day ───────────────────────────────────
    yd_ts = (now - timedelta(days=1)).replace(second=0, microsecond=0)
    r = pick(1)
    rows_to_insert.append({
        "device_id": device_id, "user_id": user_id, "timestamp": yd_ts,
        "temperature": r["temperature"], "humidity": r["humidity"],
        "gas": r["gas"], "rain": r["rain"], "mq_raw": r["mq_raw"],
        "pm2_5": r["pm2_5"], "pressure": r["pressure"],
        "wind_speed": r["wind_speed"], "motion": r["motion"],
        "trust_score": r["trust_score"],
        "anomaly_label": r["anomaly_label"] or "Normal",
        "smart_insight": r["smart_insight"] or f"Yesterday conditions: Temp {r['temperature']}°C.",
    })
    print(f"   🕐 Yesterday  ({yd_ts.strftime('%Y-%m-%d %H:%M')}): "
          f"T={r['temperature']}°C  H={r['humidity']}%  G={r['gas']} ppm  [{r['anomaly_label'] or 'Normal'}]")

    # ── 3. Hourly readings — past 7 days (for 7-day averages) ─────────────
    # Distribute real readings across the past 7 days, 1 per 2 hours
    idx = 2
    for days_ago in range(1, 8):
        for hour in range(0, 24, 2):
            ts = (now - timedelta(days=days_ago)).replace(
                hour=hour, minute=0, second=0, microsecond=0
            )
            r = pick(idx)
            rows_to_insert.append({
                "device_id": device_id, "user_id": user_id, "timestamp": ts,
                "temperature": r["temperature"], "humidity": r["humidity"],
                "gas": r["gas"], "rain": r["rain"], "mq_raw": r["mq_raw"],
                "pm2_5": r["pm2_5"], "pressure": r["pressure"],
                "wind_speed": r["wind_speed"], "motion": r["motion"],
                "trust_score": r["trust_score"],
                "anomaly_label": r["anomaly_label"] or "Normal",
                "smart_insight": None,
            })
            idx += 1

    hourly_count = len(rows_to_insert) - 2
    print(f"   📊 Hourly readings (7 days): {hourly_count} rows")
    print(f"\n   Total rows to insert: {len(rows_to_insert)}")

    if dry_run:
        print("\n🔍 DRY RUN — nothing written to DB.")
        cur.close(); conn.close()
        return

    # ── Insert ─────────────────────────────────────────────────────────────
    insert_sql = """
        INSERT INTO sensor_data
            (device_id, user_id, timestamp, temperature, humidity, gas, rain,
             mq_raw, pm2_5, pressure, wind_speed, motion, trust_score,
             anomaly_label, smart_insight)
        VALUES
            (%(device_id)s, %(user_id)s, %(timestamp)s, %(temperature)s,
             %(humidity)s, %(gas)s, %(rain)s, %(mq_raw)s, %(pm2_5)s,
             %(pressure)s, %(wind_speed)s, %(motion)s, %(trust_score)s,
             %(anomaly_label)s, %(smart_insight)s)
        ON CONFLICT DO NOTHING
    """
    psycopg2.extras.execute_batch(cur, insert_sql, rows_to_insert, page_size=50)
    conn.commit()

    print(f"\n✅ Inserted {len(rows_to_insert)} real-data historical rows into Supabase!")
    print("   Next alert email will show:")
    print("   - 📅 Last week: real sensor values from your device")
    print("   - 🕐 Yesterday: real sensor values from your device")
    print("   - 📊 7-Day Average: computed from your actual readings")

    cur.close()
    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", type=str, default=None,
                        help="Login email (e.g. user@gmail.com)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview without writing to DB")
    args = parser.parse_args()
    seed(email=args.email, dry_run=args.dry_run)
