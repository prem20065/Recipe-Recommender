import pandas as pd


df = pd.read_csv("recipes_extended.csv")  


clean_df = df[["recipe_title", "ingredient_text"]].dropna()

clean_df = clean_df.rename(columns={
    "recipe_title": "name",
    "ingredient_text": "ingredients"
})


clean_df = clean_df.head(5000)


clean_df.to_csv("ml/recipes_ml.csv", index=False)

print("Clean dataset created:", clean_df.shape)
