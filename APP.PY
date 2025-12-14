from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

def load_recipes():
    recipe_path = os.path.join(os.path.dirname(__file__), "recipes.json")
    try:
        with open(recipe_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/recipes")
def get_recipes():
    recipes = load_recipes()
    return jsonify(recipes)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)
