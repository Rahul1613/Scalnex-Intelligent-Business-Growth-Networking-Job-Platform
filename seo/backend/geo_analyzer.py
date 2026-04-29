import time
import os
import random
import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
import folium
from folium.plugins import HeatMap
from sklearn.cluster import KMeans
import requests
import uuid

def _geocode_with_retry(geolocator, query, retries=3):
    for i in range(retries):
        try:
            return geolocator.geocode(query, timeout=5)
        except:
            time.sleep(1)
    return None

def _normalize_tokens(text: str):
    if not text:
        return []
    cleaned = "".join(ch.lower() if ch.isalnum() else " " for ch in text)
    return [tok for tok in cleaned.split() if len(tok) > 2]

def _business_type_profile(business_type: str):
    bt = (business_type or "").lower().strip()
    profiles = {
        "gym": {"amenity": ["gym"], "leisure": ["fitness_centre", "sports_centre"], "shop": []},
        "restaurant": {"amenity": ["restaurant", "fast_food", "cafe"], "leisure": [], "shop": []},
        "cafe": {"amenity": ["cafe"], "leisure": [], "shop": []},
        "pharmacy": {"amenity": ["pharmacy"], "leisure": [], "shop": ["chemist"]},
        "hospital": {"amenity": ["hospital", "clinic", "doctors"], "leisure": [], "shop": []},
        "salon": {"amenity": ["beauty_salon"], "leisure": [], "shop": ["hairdresser", "beauty"]},
        "grocery": {"amenity": [], "leisure": [], "shop": ["supermarket", "convenience", "grocery"]},
        "retail": {"amenity": [], "leisure": [], "shop": ["mall", "department_store", "clothes", "retail"]},
        "hotel": {"amenity": ["hotel"], "leisure": [], "shop": []},
    }
    for key, profile in profiles.items():
        if key in bt:
            return profile
    return {"amenity": [], "leisure": [], "shop": []}

def _match_relevance(tags, business_tokens, type_profile=None):
    name = tags.get("name", "").lower()
    amenity = tags.get("amenity", "").lower()
    shop = tags.get("shop", "").lower()
    leisure = tags.get("leisure", "").lower()
    office = tags.get("office", "").lower()

    haystack = " ".join([p for p in [name, amenity, shop, leisure, office] if p])
    score = 0

    # Match explicit business tokens in any tag or name
    for token in business_tokens:
        if token and token in haystack:
            score += 2

    # If a type profile was provided, give positive score when tags match profile values
    if type_profile:
        for field, vals in (type_profile.items() if isinstance(type_profile, dict) else []):
            field_val = tags.get(field, "").lower()
            for v in vals:
                if not v:
                    continue
                if v == field_val or v in field_val or field_val in v:
                    score += 3

    # Fallback: if no tokens provided but we have a name, consider relevant
    if not business_tokens and name:
        score = max(score, 1)

    return score

def analyze_competitors(center_loc_str: str, radius_km: float, business_type: str, uploads_dir: str):
    geolocator = Nominatim(user_agent="scalnex_geo_analyzer_app_1_1")

    center_location = _geocode_with_retry(geolocator, center_loc_str, retries=5)
    if not center_location:
        raise ValueError(f"Could not find coordinates for location: {center_loc_str}")

    center_lat, center_lon = center_location.latitude, center_location.longitude
    
    radius_m = int(radius_km * 1000)
    overpass_url = "https://overpass-api.de/api/interpreter"
    business_tokens = _normalize_tokens(business_type)
    type_profile = _business_type_profile(business_type)

    clauses = []
    for field, values in type_profile.items():
        for value in values:
            clauses.extend([
                f'node["{field}"="{value}"]["name"](around:{radius_m},{center_lat},{center_lon});',
                f'way["{field}"="{value}"]["name"](around:{radius_m},{center_lat},{center_lon});',
                f'relation["{field}"="{value}"]["name"](around:{radius_m},{center_lat},{center_lon});',
            ])

    if not clauses:
        # Broad fallback: look for any amenity/shop/leisure elements (with or without explicit "name")
        clauses = [
            f'node(around:{radius_m},{center_lat},{center_lon})["amenity"];',
            f'node(around:{radius_m},{center_lat},{center_lon})["shop"];',
            f'node(around:{radius_m},{center_lat},{center_lon})["leisure"];',
            f'way(around:{radius_m},{center_lat},{center_lon})["amenity"];',
            f'way(around:{radius_m},{center_lat},{center_lon})["shop"];',
            f'way(around:{radius_m},{center_lat},{center_lon})["leisure"];',
            f'relation(around:{radius_m},{center_lat},{center_lon})["amenity"];',
            f'relation(around:{radius_m},{center_lat},{center_lon})["shop"];',
            f'relation(around:{radius_m},{center_lat},{center_lon})["leisure"];',
        ]

    overpass_query = "[out:json][timeout:20];(" + "".join(clauses) + ");out center tags;"
    competitors = []
    seen = set()
    try:
        # Retry the Overpass API call a few times in case of transient failures
        data = None
        for attempt in range(3):
            try:
                response = requests.get(overpass_url, params={'data': overpass_query}, timeout=15)
                response.raise_for_status()
                data = response.json()
                break
            except Exception:
                time.sleep(1 + attempt * 2)

        if data is None:
            raise RuntimeError("Failed to fetch data from Overpass API after retries")
        if 'elements' in data:
            for element in data['elements']:
                tags = element.get('tags', {})
                lat = element.get('lat') or element.get('center', {}).get('lat')
                lon = element.get('lon') or element.get('center', {}).get('lon')
                if lat is None or lon is None:
                    continue

                dist = geodesic((center_lat, center_lon), (lat, lon)).km
                if dist > radius_km:
                    continue

                relevance = _match_relevance(tags, business_tokens, type_profile)
                if business_tokens and relevance == 0:
                    continue

                name = tags.get('name', 'Competitor')
                key = (name.lower().strip(), round(float(lat), 5), round(float(lon), 5))
                if key in seen:
                    continue
                seen.add(key)

                category = tags.get('shop') or tags.get('amenity') or tags.get('leisure') or "business"
                address = ", ".join(
                    [str(v) for v in [tags.get('addr:street'), tags.get('addr:city'), tags.get('addr:state')] if v]
                )
                competitors.append({
                    "name": name,
                    "lat": float(lat),
                    "lon": float(lon),
                    "distance_km": round(float(dist), 2),
                    "category": category,
                    "address": address,
                    "relevance": relevance,
                })
    except Exception as e:
        print(f"Overpass API error: {e}")

    competitors.sort(key=lambda x: (-x["relevance"], x["distance_km"], x["name"].lower()))
    competitors = competitors[:150]

    area_sq_km = np.pi * (radius_km ** 2)
    competitors_count = len(competitors)
    density = competitors_count / max(1, area_sq_km)
    
    if density > 0.5:
        level = "High Competition"
    elif density > 0.1:
        level = "Medium Competition"
    else:
        level = "Low Competition"
        
    m = folium.Map(location=[center_lat, center_lon], zoom_start=13, tiles='CartoDB dark_matter')
    
    folium.Circle(
        radius=radius_km * 1000,
        location=[center_lat, center_lon],
        color="#f87171",
        fill=True,
        fill_color="#f87171",
        opacity=0.2,
        tooltip=f"{radius_km}km Radius"
    ).add_to(m)
    
    for c in competitors:
        folium.Marker(
            location=[c["lat"], c["lon"]],
            icon=folium.Icon(color="red", icon="info-sign"),
            tooltip=f'{c["name"]} ({c["distance_km"]} km)',
            popup=(
                f'<b>{c["name"]}</b><br>'
                f'Category: {c["category"]}<br>'
                f'Distance: {c["distance_km"]} km<br>'
                f'Address: {c["address"] or "N/A"}'
            )
        ).add_to(m)

    map_filename = f"geo_map_comp_{uuid.uuid4().hex}.html"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    map_filepath = os.path.join(uploads_dir, map_filename)
    m.save(map_filepath)
    
    return {
        "competitors_count": competitors_count,
        "density_per_sq_km": round(density, 2),
        "competition_level": level,
        "competitors": competitors[:20],
        "map_filename": map_filename
    }

def analyze_customers(file_path: str, center_loc_str: str, radius_km: float, filters: dict, uploads_dir: str):
    geolocator = Nominatim(user_agent="scalnex_geo_analyzer_app_1_1")
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise ValueError(f"Failed to read CSV: {str(e)}")
        
    # Text-based filtering first
    cols = [c.lower() for c in df.columns]
    df.columns = cols
    
    for key in ['country', 'state', 'city', 'area']:
        val = filters.get(key)
        if val and key in df.columns:
            df = df[df[key].astype(str).str.contains(val, case=False, na=False)]
    
    center_lat, center_lon = None, None
    if center_loc_str and center_loc_str.strip():
        loc = _geocode_with_retry(geolocator, center_loc_str)
        if loc:
            center_lat, center_lon = loc.latitude, loc.longitude
    
    address_col = next((c for c in ['address', 'area', 'city'] if c in cols), None)
    
    customer_coords = []
    area_distribution = {}

    if address_col:
        unique_addresses = df[address_col].dropna().unique()
        unique_addresses = unique_addresses[:30] 
        
        addr_to_coords = {}
        for addr in unique_addresses:
            search_str = f"{addr}"
            if center_loc_str:
                search_str += f", {center_loc_str}"
            elif filters.get('city'):
                search_str += f", {filters.get('city')}"
            elif filters.get('state'):
                search_str += f", {filters.get('state')}"
                
            loc = _geocode_with_retry(geolocator, search_str)
            if loc:
                addr_to_coords[addr] = (loc.latitude, loc.longitude)
                
        for idx, row in df.iterrows():
            addr = row.get(address_col)
            if addr in addr_to_coords:
                base_lat, base_lon = addr_to_coords[addr]
                jitter_lat = base_lat + random.uniform(-0.001, 0.001)
                jitter_lon = base_lon + random.uniform(-0.001, 0.001)
                
                # Check radius if center exists
                if center_lat is not None and center_lon is not None and radius_km:
                    dist = geodesic((center_lat, center_lon), (jitter_lat, jitter_lon)).km
                    if dist > radius_km:
                        continue
                
                customer_coords.append([jitter_lat, jitter_lon])
                area_distribution[addr] = area_distribution.get(addr, 0) + 1
                
                if len(customer_coords) > 200:
                    break

    # If no center provided, compute from customers
    if center_lat is None or center_lon is None:
        if customer_coords:
            center_lat = sum([c[0] for c in customer_coords]) / len(customer_coords)
            center_lon = sum([c[1] for c in customer_coords]) / len(customer_coords)
            radius_km = 10.0 # default visual radius
        else:
            loc = _geocode_with_retry(geolocator, "USA")
            if loc:
                center_lat, center_lon = loc.latitude, loc.longitude
            else:
                center_lat, center_lon = 0.0, 0.0
            radius_km = 10.0

    best_area = "Data insufficient"
    if len(customer_coords) >= 3:
        kmeans = KMeans(n_clusters=min(3, len(customer_coords)), random_state=42, n_init=10)
        kmeans.fit(customer_coords)
        cluster_centers = kmeans.cluster_centers_
        labels = kmeans.labels_
        counts = np.bincount(labels)
        best_cluster_idx = np.argmax(counts)
        best_center = cluster_centers[best_cluster_idx]
        
        try:
            best_loc = _geocode_with_retry(geolocator, f"{best_center[0]}, {best_center[1]}")
            if best_loc and best_loc.address:
                parts = best_loc.address.split(',')
                best_area = parts[0] + (", " + parts[1] if len(parts) > 1 else "")
        except:
            pass

    customers_count = len(customer_coords)
    area_sq_km = np.pi * (radius_km ** 2) if radius_km else 100
    density = customers_count / max(1, area_sq_km)
    
    m = folium.Map(location=[center_lat, center_lon], zoom_start=12 if customer_coords else 4, tiles='CartoDB dark_matter')
    
    if center_loc_str and radius_km and (customers_count == 0 or (len(customer_coords) > 0)):
        folium.Circle(
            radius=radius_km * 1000,
            location=[center_lat, center_lon],
            color="#3b82f6",
            fill=True,
            fill_color="#3b82f6",
            opacity=0.2,
            tooltip=f"{radius_km}km Radius"
        ).add_to(m)

    if customer_coords:
        HeatMap(customer_coords, radius=15, blur=10, gradient={0.4: 'blue', 0.65: 'lime', 1: 'green'}).add_to(m)
        for coord in customer_coords:
            folium.CircleMarker(
                location=coord,
                radius=3,
                color="green",
                fill=True,
                fill_color="green",
                tooltip="Customer"
            ).add_to(m)
            
    map_filename = f"geo_map_cust_{uuid.uuid4().hex}.html"
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    map_filepath = os.path.join(uploads_dir, map_filename)
    m.save(map_filepath)
    
    # Sort area distribution
    top_areas = [{"name": str(k), "count": int(v)} for k, v in sorted(area_distribution.items(), key=lambda item: item[1], reverse=True)[:5]]
    
    return {
        "customers_count": customers_count,
        "density_per_sq_km": round(density, 2),
        "best_area": best_area,
        "top_areas": top_areas,
        "map_filename": map_filename
    }

def analyze_geo_opportunity(file_path: str, center_loc_str: str, radius_km: float, business_type: str, uploads_dir: str):
    # Backward compatibility
    return analyze_competitors(center_loc_str, radius_km, business_type, uploads_dir)

if __name__ == "__main__":
    pass
