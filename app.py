import os
import json
from flask import Flask, render_template, jsonify, send_from_directory
from flask import request
from ml.recommender import recommend


# Get absolute path to app directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, 
           template_folder=os.path.join(BASE_DIR, 'templates'),
           static_folder=os.path.join(BASE_DIR, 'static'))

def load_recipes():
    """Load recipes from JSON file"""
    recipe_file = os.path.join(BASE_DIR, 'recipes.json')
    try:
        with open(recipe_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading recipes: {e}")
        return []

@app.route('/')
def home():
    """Serve home page"""
    return render_template('index.html')

@app.route('/api/recipes')
def get_recipes():
    """API endpoint to get all recipes"""
    recipes = load_recipes()
    return jsonify(recipes)


@app.route('/images/<path:filename>')
def template_image(filename):
    """Serve image files stored under templates/images for convenience."""
    images_dir = os.path.join(BASE_DIR, 'templates', 'images')
    return send_from_directory(images_dir, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
    
@app.route("/api/ml-recommend", methods=["POST"])
def ml_recommend():
    data = request.json
    ingredients = data.get("ingredients", [])

    if not ingredients:
        return jsonify([])

    results = recommend(ingredients)
    return jsonify(results)
from ml.ingredient_extractor import extract_ingredients
from ml.recommender import recommend

@app.route("/api/nl-recommend", methods=["POST"])
def nl_recommend():
    query = request.json.get("query", "")
    ingredients = extract_ingredients(query)

    if not ingredients:
        return jsonify([])

    results = recommend(ingredients)
    return jsonify(results)
