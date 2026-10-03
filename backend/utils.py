import math

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points on Earth in kilometers."""
    R = 6371.0  # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Coordinates lookup for key demo cities across Pakistan, India, and the US
CITY_COORDINATES = {
    # Pakistan
    "kohat": (33.5822, 71.4492),
    "islamabad": (33.6425, 72.9930),
    "peshawar": (34.0151, 71.5249),
    "lahore": (31.5204, 74.3587),
    "karachi": (24.8607, 67.0011),
    # India
    "delhi": (28.6139, 77.2090),
    "bengaluru": (12.9716, 77.5946),
    "mumbai": (19.0760, 72.8777),
    # United States
    "boston": (42.3601, -71.0589),
    "san francisco": (37.7749, -122.4194),
    "new york": (40.7128, -74.0060)
}