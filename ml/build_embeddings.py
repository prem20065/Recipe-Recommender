import pandas as pd
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer

# load dataset
df = pd.read_csv("ml/recipes_ml.csv")

# use ingredient text for embeddings
texts = df["ingredients"].tolist()

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = model.encode(texts, show_progress_bar=True)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings).astype("float32"))

faiss.write_index(index, "ml/recipe_index.faiss")

with open("ml/recipes_lookup.pkl", "wb") as f:
    pickle.dump(df, f)

print("Embeddings built successfully")
