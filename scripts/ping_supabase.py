import os
import sys
import time
from datetime import datetime, timezone
import requests
from dotenv import load_dotenv

# Load variables from .env or .env.local if running locally
load_dotenv()
load_dotenv(".env.local")

SUPABASE_URL = (
    os.getenv("NEXT_PUBLIC_SUPABASE_URL") 
    or os.getenv("SUPABASE_URL")
)
SUPABASE_KEY = (
    os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.", file=sys.stderr)
    sys.exit(1)

base_url = SUPABASE_URL.rstrip("/")
endpoint = f"{base_url}/rest/v1/owner_profile?select=id&limit=1"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
}

def ping(max_retries=3, delay_seconds=5):
    for attempt in range(1, max_retries + 1):
        timestamp = datetime.now(timezone.utc).isoformat()
        try:
            # 30s timeout handles mild cold starts
            response = requests.get(endpoint, headers=headers, timeout=30)
            
            if response.status_code == 200:
                print(f"[{timestamp}] SUCCESS: Supabase is active (Attempt {attempt}). Status: {response.status_code}")
                return
            else:
                print(
                    f"[{timestamp}] WARNING (Attempt {attempt}/{max_retries}): "
                    f"Status {response.status_code}: {response.text}",
                    file=sys.stderr
                )
        except requests.exceptions.RequestException as error:
            print(f"[{timestamp}] ERROR (Attempt {attempt}/{max_retries}): {error}", file=sys.stderr)
        
        if attempt < max_retries:
            time.sleep(delay_seconds)
            
    print("All ping attempts failed.", file=sys.stderr)
    sys.exit(1)

if __name__ == "__main__":
    ping()
