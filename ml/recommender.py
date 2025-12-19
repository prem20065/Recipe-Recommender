import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("ml/recipes_ml.csv")

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=5000
)

X = vectorizer.fit_transform(df["ingredients"])

def recommend(user_ingredients, top_n=5):
    user_text = " ".join(user_ingredients)
    user_vec = vectorizer.transform([user_text])

    similarity = cosine_similarity(user_vec, X).flatten()
    top_indices = similarity.argsort()[-top_n:][::-1]

    return df.iloc[top_indices]["name"].tolist()
