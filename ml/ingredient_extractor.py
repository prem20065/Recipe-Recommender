import re

KNOWN_INGREDIENTS = [
    "egg", "tomato", "onion", "rice", "chicken", "paneer",
    "potato", "garlic", "ginger", "oil", "salt", "masala"
]

def extract_ingredients(text):
    text = text.lower()
    found = []

    for ing in KNOWN_INGREDIENTS:
        if re.search(rf"\b{ing}\b", text):
            found.append(ing)

    return found
