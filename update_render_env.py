import requests

api_key = "rnd_SHFNuVixpvhjiFuz52LQAfXsRzxZ"
service_id = "srv-d5qvttc9c44c73dv0lgg"
url = f"https://api.render.com/v1/services/{service_id}/env-vars"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# Env vars to update
env_vars = [
    {"key": "SUPABASE_URL", "value": "https://moulkspffuxigvwlflho.supabase.co"},
    {"key": "SUPABASE_KEY", "value": "sb_secret_LSVrXlYOSgzLGBdrb7metQ_OrVSBR6A"},
    {"key": "SECRET_KEY", "value": "sb_secret_LSVrXlYOSgzLGBdrb7metQ_OrVSBR6A"}, # Reusing strong secret
    {"key": "RENDER_API_KEY", "value": "rnd_SHFNuVixpvhjiFuz52LQAfXsRzxZ"}
]

print(f"Updating {len(env_vars)} environment variables for service {service_id}...")

for var in env_vars:
    payload = [var]
    # PUT /services/{serviceId}/env-vars overwrites ALL vars if sent as list, 
    # but strictly speaking strict PUT replaces collection. 
    # Render API allows POST to update/upsert.
    # Let's use PUT on specific key URL or POST to collection.
    # Actually Render API docs say PUT /services/{serviceId}/env-vars replaces all. 
    # That is DANGEROUS if we miss existing ones.
    # Safer: PUT /services/{serviceId}/env-vars/{envVarKey}
    
    key_url = f"{url}/{var['key']}"
    r = requests.put(key_url, headers=headers, json={"value": var['value']})
    
    if r.status_code == 200:
        print(f"✅ set {var['key']}")
    else:
        print(f"❌ failed {var['key']}: {r.status_code} {r.text}")

print("Done. Render should trigger a redeploy automatically if variables changed.")
