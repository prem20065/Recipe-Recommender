fro
app = Flask(__name__)

def load_recipes():
    with open("recipes.json", "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/recipes")
def get_recipes():
    recipes = load_recipes()
    return jsonify(recipes)

if __name__ == "__main__":
    app.run(debug=True)
