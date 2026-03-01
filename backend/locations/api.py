import logging
import os
import requests
from .models import Architecture, Films, History, Music


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
        # Check if dest is one of our model instances
        if isinstance(dest, (Architecture, Films, History, Music)):
            destination = f"{dest.latitude},{dest.longitude}"
            location_name = dest.name
            location_id = dest.id
            location_type = dest.__class__.__name__
        else:
            destination = f"{dest[0]},{dest[1]}"
            location_name = None
            location_id = None
            location_type = None
        
        try:
            # Distance Matrix API call for transit (primary) and walking (secondary)
            transit_result = None
            walking_result = None
            
            for mode in ['transit', 'walking']:
                params = {
                    'origins': origin,
                    'destinations': destination,
                    'key': api_key,
                    'mode': mode
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
                            if mode == 'transit' and transit_result is None:
                                transit_result = (element, 'transit')
                            elif mode == 'walking' and walking_result is None:
                                walking_result = (element, 'walking')
            
            # Prefer transit, fallback to walking
            if transit_result:
                element, mode = transit_result
                results.append({
                    'location_id': location_id,
                    'location_name': location_name,
                    'location_type': location_type,
                    'distance_km': element['distance']['value'] / 1000,
                    'distance_text': element['distance']['text'],
                    'travel_time_min': element['duration']['value'] / 60,
                    'travel_time_text': element['duration']['text'],
                    'travel_mode': mode
                })
            elif walking_result:
                element, mode = walking_result
                results.append({
                    'location_id': location_id,
                    'location_name': location_name,
                    'location_type': location_type,
                    'distance_km': element['distance']['value'] / 1000,
                    'distance_text': element['distance']['text'],
                    'travel_time_min': element['duration']['value'] / 60,
                    'travel_time_text': element['duration']['text'],
                    'travel_mode': mode
                })
            else:
                logger().warning(f"No transit or walking route found for {location_name}")
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
    
    commute_modes = ['transit', 'walking']
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

def get_all_locations(location_type=None):
    """
    Get all locations from all models or filter by specific type.
    
    Args:
        location_type (str, optional): Filter by location type ('Architecture', 'Films', 'History', 'Music')
                                      If None, returns all locations
    
    Returns:
        list: Combined list of all location objects
    """
    locations = []
    
    if location_type is None or location_type == 'Architecture':
        locations.extend(list(Architecture.objects.all()))
    if location_type is None or location_type == 'Films':
        locations.extend(list(Films.objects.all()))
    if location_type is None or location_type == 'History':
        locations.extend(list(History.objects.all()))
    if location_type is None or location_type == 'Music':
        locations.extend(list(Music.objects.all()))
    
    logger().info(f"Retrieved {len(locations)} locations")
    return locations

def create_history_location(name, latitude, longitude, fact):
    """
    Create a new History location.
    
    Args:
        name (str): Name of the location
        latitude (float): Latitude of the location
        longitude (float): Longitude of the location
        fact (str): Interesting fact about the location
    
    Returns:
        History: Created History object
    """
    try:
        history_location = History.objects.create(
            name=name,
            latitude=latitude,
            longitude=longitude,
            fact=fact
        )
        logger().info(f"Created new History location: {name}")
        return history_location
    except Exception as e:
        logger().error(f"Error creating History location: {str(e)}")
        return None
    
def create_music_location(name, latitude, longitude, fact):
    """
    Create a new Music location.
    
    Args:
        name (str): Name of the location
        latitude (float): Latitude of the location
        longitude (float): Longitude of the location
        fact (str): Interesting fact about the location
    
    Returns:
        Music: Created Music object
    """
    try:
        music_location = Music.objects.create(
            name=name,
            latitude=latitude,
            longitude=longitude,
            fact=fact
        )
        logger().info(f"Created new Music location: {name}")
        return music_location
    except Exception as e:
        logger().error(f"Error creating Music location: {str(e)}")
        return None
    
def create_films_location(name, latitude, longitude, fact):    
    try:
        film_location = Films.objects.create(
                name=name,
                latitude=latitude,
                longitude=longitude,
                fact=fact
        )
        logger().info(f"Created new Film location: {name}")
        return film_location
    except Exception as e:
        logger().error(f"Error creating  location: {str(e)}")
        return None
    
def create_architecture_location(name, latitude, longitude, fact):
    try:
        architecture_location = Architecture.objects.create(
                name=name,
                latitude=latitude,
                longitude=longitude,
                fact=fact
        )
        logger().info(f"Created new Architecture location: {name}")
        return architecture_location
    except Exception as e:
        logger().error(f"Error creating  location: {str(e)}")
        return None
    