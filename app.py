# Flask
from flask import Flask, render_template, flash, request, url_for, jsonify
from wtforms import Form, TextField, TextAreaField, validators, StringField, SubmitField
import os
# API
import api
# Celery
from celery import Celery

app = Flask(__name__)

def APICall(url="", nColors=8):
    # Retrieve image
    image = api.GetImage(url)
    # Shape data
    data = api.GetData(image)
    # Run clustering algorithm
    colors = api.Cluster(nColors, image, data)

    return { "result": { "colors": colors } }

@app.route("/", methods=['GET', 'POST'])
def Index():
    return render_template("index.html")

@app.route("/result", methods=['POST'])
def Result():
    if request.data:
        url = request.json["url"]
    else:
        url = ""
    response = APICall(url=url)
    return jsonify(response)

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT",3000))
    app.run(host="0.0.0.0", port=port)
