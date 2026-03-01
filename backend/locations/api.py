import logging
import os
import requests
from .models import Location


def logger():
    return logging.getLogger(__name__)

def get_google_maps_api_key():
    """Get Google Maps API key from environment variables"""
    api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
    if not api_key:
        logger().warning("GOOGLE_MAPS_API_KEY not set in environment variables")
    return api_key

def get_distance_matrix(origin_lat, origin_lon, destination_locations):
    """
    Get distances and travel times from origin to destinations using Google Maps Distance Matrix API.
    
    Args:
        origin_lat (float): User's latitude
        origin_lon (float): User's longitude
        destination_locations (list): List of Location objects or tuples (lat, lon)
    
    Returns:
        list: List of dicts with 'location', 'distance_km', 'travel_time_min', 'travel_mode'
    """
    api_key = get_google_maps_api_key()
    if not api_key:
        return []
    
    results = []
    origin = f"{origin_lat},{origin_lon}"
    
    for dest in destination_locations:
        if isinstance(dest, Location):
            destination = f"{dest.latitude},{dest.longitude}"
            location_name = dest.name
            location_id = dest.id
        else:
            destination = f"{dest[0]},{dest[1]}"
            location_name = None
            location_id = None
        
        try:
            # Distance Matrix API call
            params = {
                'origins': origin,
                'destinations': destination,
                'key': api_key,
                'mode': 'driving'  # Change to 'transit', 'walking', 'bicycling' as needed
            }
            
            response = requests.get(
                'https://maps.googleapis.com/maps/api/distancematrix/json',
                params=params,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'OK':
                    element = data['rows'][0]['elements'][0]
                    if element['status'] == 'OK':
                        results.append({
                            'location_id': location_id,
                            'location_name': location_name,
                            'distance_km': element['distance']['value'] / 1000,
                            'distance_text': element['distance']['text'],
                            'travel_time_min': element['duration']['value'] / 60,
                            'travel_time_text': element['duration']['text'],
                            'travel_mode': 'driving'
                        })
                    else:
                        logger().warning(f"Distance Matrix error for destination: {element['status']}")
                else:
                    logger().error(f"Distance Matrix API error: {data['status']}")
        except Exception as e:
            logger().error(f"Error calling Distance Matrix API: {str(e)}")
    
    return results

def get_place_details(latitude, longitude):
    """
    Get place details including opening hours using Google Maps Place Details API.
    
    Args:
        latitude (float): Place latitude
        longitude (float): Place longitude
    
    Returns:
        dict: Place details including opening hours, rating, reviews
    """
    api_key = get_google_maps_api_key()
    if not api_key:
        return {}
    
    try:
        # First, find place ID using Nearby Search or Place API
        params = {
            'location': f"{latitude},{longitude}",
            'radius': 100,  # 100 meters
            'key': api_key
        }
        
        response = requests.get(
            'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            params=params,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK' and data['results']:
                place_id = data['results'][0]['place_id']
                
                # Get detailed information
                details_params = {
                    'place_id': place_id,
                    'fields': 'opening_hours,rating,review,formatted_address,photos',
                    'key': api_key
                }
                
                details_response = requests.get(
                    'https://maps.googleapis.com/maps/api/place/details/json',
                    params=details_params,
                    timeout=5
                )
                
                if details_response.status_code == 200:
                    details_data = details_response.json()
                    if details_data['status'] == 'OK':
                        result = details_data.get('result', {})
                        return {
                            'opening_hours': result.get('opening_hours'),
                            'is_open': result.get('opening_hours', {}).get('open_now'),
                            'rating': result.get('rating'),
                            'reviews': result.get('reviews'),
                            'formatted_address': result.get('formatted_address')
                        }
    except Exception as e:
        logger().error(f"Error calling Place Details API: {str(e)}")
    
    return {}

def get_best_commute_options(origin_lat, origin_lon, destination_lat, destination_lon):
    """
    Get best commute options between two locations using Google Maps Directions API.
    
    Args:
        origin_lat (float): Origin latitude
        origin_lon (float): Origin longitude
        destination_lat (float): Destination latitude
        destination_lon (float): Destination longitude
    
    Returns:
        dict: Best commute options with alternatives (driving, transit, walking, bicycling)
    """
    api_key = get_google_maps_api_key()
    if not api_key:
        return {}
    
    origin = f"{origin_lat},{origin_lon}"
    destination = f"{destination_lat},{destination_lon}"
    
    commute_modes = ['driving', 'transit', 'walking', 'bicycling']
    results = {}
    
    for mode in commute_modes:
        try:
            params = {
                'origin': origin,
                'destination': destination,
                'mode': mode,
                'key': api_key,
                'alternatives': 'true'  # Get alternative routes
            }
            
            response = requests.get(
                'https://maps.googleapis.com/maps/api/directions/json',
                params=params,
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'OK' and data['routes']:
                    # Get the best (first) route
                    route = data['routes'][0]
                    results[mode] = {
                        'distance_km': route['legs'][0]['distance']['value'] / 1000,
                        'distance_text': route['legs'][0]['distance']['text'],
                        'duration_min': route['legs'][0]['duration']['value'] / 60,
                        'duration_text': route['legs'][0]['duration']['text'],
                        'steps': len(route['legs'][0]['steps']),
                        'polyline': route['overview_polyline']['points']  # For map visualization
                    }
        except Exception as e:
            logger().error(f"Error calling Directions API for mode {mode}: {str(e)}")
    
    # Return best commute (lowest duration)
    if results:
        best_mode = min(results.keys(), key=lambda x: results[x]['duration_min'])
        return {
            'best_commute_mode': best_mode,
            'best_commute': results[best_mode],
            'all_options': results
        }
    
    return {}

def filter_location_pref(preferences):
    """
    Filter locations based on user preferences.
    
    Args:
        preferences (dict): User preferences containing:
            - categories (list): List of preferred categories (e.g., ['architecture', 'history'])
            - latitude (float, optional): User's latitude for distance filtering
            - longitude (float, optional): User's longitude for distance filtering
            - radius_km (float, optional): Search radius in kilometers (default: 5)
    
    Returns:
        QuerySet: Filtered Location objects matching user preferences
    """
    queryset = Location.objects.all()
    
    # Filter by categories if provided
    if 'categories' in preferences and preferences['categories']:
        queryset = queryset.filter(category__in=preferences['categories'])
    
    # Filter by distance if coordinates provided
    if 'latitude' in preferences and 'longitude' in preferences:
        from django.db.models import FloatField
        from django.db.models.functions import ACos, Cos, Radians, Sin
        
        user_lat = preferences['latitude']
        user_lon = preferences['longitude']
        radius = preferences.get('radius_km', 5)  # default 5km
        
        # Haversine formula for distance calculation
        # Distance = 6371 * ACOS(SIN(lat1) * SIN(lat2) + COS(lat1) * COS(lat2) * COS(lon2 - lon1))
        # For better performance, use this simplified distance filter
        queryset = queryset.filter(
            latitude__gte=user_lat - (radius / 111),  # Rough approximation: 1 degree ≈ 111km
            latitude__lte=user_lat + (radius / 111),
            longitude__gte=user_lon - (radius / (111 * 0.85)),  # Adjust for latitude
            longitude__lte=user_lon + (radius / (111 * 0.85))
        )
    
    logger().info(f"Filtered locations: {queryset.count()} results")
    return queryset

