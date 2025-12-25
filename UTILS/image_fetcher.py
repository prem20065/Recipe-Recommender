import requests
import os

UNSPLASH_KEY = os.getenv("UNSPLASH_API_KEY")

def get_recipe_image(query):
    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": f"{query} food",
        "per_page": 1
    }
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_KEY}"
    }

    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    if data["results"]:
        return data["results"][0]["urls"]["small"]

    return "https://via.placeholder.com/300?text=Food"
