import pandas as pd
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load recipes from JSON
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
recipes_file = os.path.join(BASE_DIR, 'recipes.json')

with open(recipes_file, 'r', encoding='utf-8') as f:
    recipes_data = json.load(f)

# Create DataFrame from recipes
df = pd.DataFrame(recipes_data)
df['ingredients_text'] = df['ingredients'].apply(lambda x: ' '.join(x))

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=5000,
    lowercase=True,
    ngram_range=(1, 2)
)

X = vectorizer.fit_transform(df["ingredients_text"])

def recommend(user_ingredients, top_n=5):
    """
    Recommend recipes based on user ingredients using TF-IDF and cosine similarity.
    Uses machine learning to find best matches.
    """
    if not user_ingredients:
        return []
    
    user_text = " ".join(user_ingredients)
    user_vec = vectorizer.transform([user_text])
    
    # Calculate cosine similarity
    similarity = cosine_similarity(user_vec, X).flatten()
    
    # Get top N indices
    top_indices = np.argsort(similarity)[-top_n:][::-1]
    
    # Filter by minimum similarity threshold to avoid poor matches
    threshold = 0.1
    valid_indices = [idx for idx in top_indices if similarity[idx] > threshold]
    
    if not valid_indices:
        return []
    
    results = df.iloc[valid_indices][["name", "cuisine", "calories", "prepTime"]].to_dict(orient='records')
    return results
