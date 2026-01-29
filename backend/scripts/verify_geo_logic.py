import math

def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine formula (copied from provided logic)
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')

    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

def test_logic():
    print("--- GEOLOCATION ALERT TEST ---\n")
    
    # 1. Device: Bangalore (Indiranagar)
    device = {"name": "Bangalore_Sensor", "lat": 12.9716, "lon": 77.5946}
    print(f"Device Location: {device['name']} ({device['lat']}, {device['lon']})")
    
    # 2. Users
    users = [
        {"name": "User_Near", "email": "near@test.com", "lat": 12.9279, "lon": 77.6271}, # Koramangala (~5-6km)
        {"name": "User_Far", "email": "far@test.com", "lat": 28.7041, "lon": 77.1025},   # Delhi (~1700km)
        {"name": "User_Edge", "email": "edge@test.com", "lat": 13.3, "lon": 77.5},       # outskirts (~40km)
    ]
    
    ALERT_RADIUS_KM = 50.0
    print(f"Alert Radius: {ALERT_RADIUS_KM} km\n")
    
    print("-" * 60)
    print(f"{'User':<15} | {'Location':<15} | {'Distance':<10} | {'Action'}")
    print("-" * 60)
    
    for u in users:
        dist = calculate_distance(device['lat'], device['lon'], u['lat'], u['lon'])
        action = "✅ SEND ALERT" if dist <= ALERT_RADIUS_KM else "❌ SKIP"
        print(f"{u['name']:<15} | {u['lat']},{u['lon']:<7} | {dist:.1f} km   | {action}")

if __name__ == "__main__":
    test_logic()
