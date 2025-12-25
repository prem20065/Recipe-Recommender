import faiss
import pickle
import numpy as np
import json
import os
from sentence_transformers import SentenceTransformer

# Load recipes
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
recipes_file = os.path.join(BASE_DIR, 'recipes.json')

with open(recipes_file, 'r', encoding='utf-8') as f:
    recipes_data = json.load(f)

# Initialize model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Create embeddings from recipe descriptions (ingredients + name)
texts = []
for recipe in recipes_data:
    text = f"{recipe['name']} {' '.join(recipe['ingredients'])} {recipe.get('cuisine', '')}"
    texts.append(text)

# Build FAISS index
embeddings = model.encode(texts, show_progress_bar=False)
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings).astype("float32"))

def semantic_recommend(query, top_n=5):
    """
    Semantic search for recipes using sentence transformers and FAISS.
    ML-based semantic similarity using neural embeddings.
    """
    if not query or query.strip() == "":
        return []
    
    try:
        query_vec = model.encode([query])
        distances, indices = index.search(
            np.array(query_vec).astype("float32"), top_n
        )
        
        results = []
        for idx in indices[0]:
            if idx < len(recipes_data):
                recipe = recipes_data[idx]
                results.append({
                    "name": recipe["name"],
                    "cuisine": recipe.get("cuisine", ""),
                    "calories": recipe.get("calories", 0),
                    "prepTime": recipe.get("prepTime", 0)
                })
        
        return results
    except Exception as e:
        print(f"Error in semantic_recommend: {e}")
        return []


