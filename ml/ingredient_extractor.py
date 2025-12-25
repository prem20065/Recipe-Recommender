import re
import json
import os

# Load ingredient list from recipes
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
recipes_file = os.path.join(BASE_DIR, 'recipes.json')

with open(recipes_file, 'r', encoding='utf-8') as f:
    recipes_data = json.load(f)

# Extract all unique ingredients from recipes
KNOWN_INGREDIENTS = set()
for recipe in recipes_data:
    KNOWN_INGREDIENTS.update(recipe.get('ingredients', []))

KNOWN_INGREDIENTS = sorted(list(KNOWN_INGREDIENTS))

def extract_ingredients(text):
    """
    Extract ingredients from natural language text using pattern matching.
    ML-based ingredient extraction using regex and known ingredient database.
    """
    text = text.lower()
    found = []
    
    # Search for each known ingredient
    for ing in KNOWN_INGREDIENTS:
        if re.search(rf"\b{ing}\b", text):
            found.append(ing)
    
    return list(set(found))  # Remove duplicates
