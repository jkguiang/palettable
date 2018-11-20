# Flask
from flask import Flask, render_template, flash, request, url_for
from wtforms import Form, TextField, TextAreaField, validators, StringField, SubmitField
import os
# API
import api

index = Flask(__name__)
index.config.update(
    CELERY_BROKER_URL="redis://localhost:6379",
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)

@index.route("/")
def Home():
    if request.method == "GET":
        response = { "succes": False }
    elif request.method == "POST":
        response = api.Parse("https://www.facebook.com")

    return render_template("home.html", response=response)




if __name__ == "__main__":
    index.debug = True
    port = int(os.environ.get("PORT",3000))
    index.run(host="0.0.0.0", port=port)
