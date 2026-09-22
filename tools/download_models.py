import os
import sys
import json
import urllib.request
import urllib.parse
import zipfile

def get_token():
    # Check env
    token = os.environ.get("SKETCHFAB_API_TOKEN")
    if token:
        return token.strip()
    # Check local .env
    for env_path in [".env", os.path.expanduser("~/.env")]:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("SKETCHFAB_API_TOKEN="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None

def download_model(model_uid, output_dir, token):
    os.makedirs(output_dir, exist_ok=True)
    api_url = f"https://api.sketchfab.com/v3/models/{model_uid}/download"
    req = urllib.request.Request(
        api_url,
        headers={
            "Authorization": f"Token {token}",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        }
    )
    print(f"[DOWNLOAD] Requesting download URL for model {model_uid}...")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[DOWNLOAD ERROR] HTTP {e.code}: {e.read().decode('utf-8')}")
        return False

    # Check available archives: prefer gltf, glb, source
    archives = data.get("gltf") or data.get("glb") or data.get("source")
    if not archives or not archives.get("url"):
        print(f"[DOWNLOAD ERROR] No valid download archive URL found: {data}")
        return False

    download_url = archives["url"]
    file_size = archives.get("size", 0)
    out_zip = os.path.join(output_dir, f"{model_uid}.zip")
    print(f"[DOWNLOAD] Downloading archive (~{file_size // 1024} KB) -> {out_zip}")
    
    dl_req = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(dl_req) as dl_resp, open(out_zip, "wb") as f:
        while True:
            chunk = dl_resp.read(65536)
            if not chunk:
                break
            f.write(chunk)
            
    print(f"[DOWNLOAD SUCCESS] Saved {out_zip} ({os.path.getsize(out_zip)} bytes)")
    
    # Extract
    extract_folder = os.path.join(output_dir, f"{model_uid}_unpacked")
    os.makedirs(extract_folder, exist_ok=True)
    with zipfile.ZipFile(out_zip, "r") as z:
        z.extractall(extract_folder)
    print(f"[UNPACK] Extracted to {extract_folder}")
    return extract_folder

if __name__ == "__main__":
    token = get_token()
    if not token:
        print("ERROR: SKETCHFAB_API_TOKEN is not set in environment or .env file.")
        sys.exit(1)
        
    if len(sys.argv) > 1:
        model_id = sys.argv[1]
    else:
        # Primary pack
        model_id = "886732730f9048b990d4220ca01db24a"
    out_dir = "assets/source"
    res = download_model(model_id, out_dir, token)
    if res:
        print(f"Model ready at: {res}")
    else:
        print(f"Failed to download model {model_id}.")
        sys.exit(1)
