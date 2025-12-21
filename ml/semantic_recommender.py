import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("ml/recipe_index.faiss")

with open("ml/recipes_lookup.pkl", "rb") as f:
    df = pickle.load(f)

def semantic_recommend(query, top_n=5):
    query_vec = model.encode([query])
    distances, indices = index.search(
        np.array(query_vec).astype("float32"), top_n
    )
    return df.iloc[indices[0]][["name"]].to_dict(orient="records")

