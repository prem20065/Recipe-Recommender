from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

def load_recipes():
    recipe_path = os.path.join(os.path.dirname(__file__), "recipes.json")
    with open(recipe_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/recipes")
def get_recipes():
    recipes = load_recipes()
    return jsonify(recipes)

if __name__ == "__main__":
    app.run()
