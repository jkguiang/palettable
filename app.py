# Flask
from flask import Flask, render_template, flash, request, url_for, jsonify
import os
# API
import api

app = Flask(__name__)

def APICall(url="", img="", nColors=6):
    # Retrieve image
    if not img:
        img = api.ParseCSS(url)
    else:
        img = api.ProcImage(img)
    # Shape data
    data = api.GetData(img)
    # Run clustering algorithm
    colors = api.Cluster(nColors, data)

    return { "result": { "colors": colors } }

@app.route("/", methods=['GET', 'POST'])
def Index():
    return render_template("index.html")

@app.route("/query", methods=['POST'])
def Query():
    url = (request.json).get("url", False)
    img = (request.json).get("img", False)
    response = APICall(url=url, img=img)

    return jsonify(response)

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT",3000))
    app.run(host="0.0.0.0", port=port)
