import os
import sys
from datetime import datetime, timezone
import requests
from dotenv import load_dotenv

# Load variables from .env or .env.local if running locally
load_dotenv()
load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.", file=sys.stderr)
    sys.exit(1)

# Clean trailing slash if present
base_url = SUPABASE_URL.rstrip("/")

# Target PostgREST endpoint for a 1-row query (extremely fast & low overhead)
endpoint = f"{base_url}/rest/v1/owner_profile?select=id&limit=1"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def ping():
    timestamp = datetime.now(timezone.utc).isoformat()
    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"[{timestamp}] SUCCESS: Supabase is active. Status {response.status_code}")
        else:
            print(f"[{timestamp}] WARNING: Ping returned status {response.status_code}: {response.text}", file=sys.stderr)
            sys.exit(1)
            
    except requests.exceptions.RequestException as error:
        print(f"[{timestamp}] ERROR: Request failed: {error}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    ping()