# Flask
from flask import Flask, render_template, flash, request, url_for, jsonify
from wtforms import Form, TextField, TextAreaField, validators, StringField, SubmitField
import os
# API
import api
# Celery
from celery import Celery

app = Flask(__name__)
app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)

celery = Celery(
    app.name,
    broker=app.config['CELERY_BROKER_URL']
)
celery.conf.update(app.config)

@celery.task(bind=True)
def APICall(self, url="", nColors=8):
    # Retrieve image
    self.update_state(state="PROGRESS",
                      meta={ "status": "Retrieving image..." })
    screenshot = api.GetImage(url)
    # Process image
    self.update_state(state="PROGRESS",
                      meta={ "status": "Processing image...",
                             "result": screenshot })
    image = api.ProcImage(screenshot)
    # Shape data
    self.update_state(state="PROGRESS",
                      meta={ "status": "Shaping data..." })
    data = api.ShapeData(image)
    # Run clustering algorithm
    self.update_state(state="PROGRESS",
                      meta={ "status": "Running clustering algorithm..." })
    colors, img = api.Cluster(nColors, image, data)

    return {
             "success": True,
             "result": { "colors": colors, "img": img }
           }

@app.route("/", methods=['GET', 'POST'])
def Index():
    return render_template("index.html")

@app.route("/result", methods=['POST'])
def Result():
    if request.data:
        url = request.json["url"]
    else:
        url = ""
    task = APICall.apply_async(kwargs={ "url":url })
    return jsonify({}), 202, {"Location": url_for("Status", taskID=task.id)}

@app.route('/status/<taskID>')
def Status(taskID):
    task = APICall.AsyncResult(taskID)
    response = { "state": task.state }
    if task.state != "FAILURE" and task.info:
        response["status"] = task.info.get("status", "")
        if "result" in task.info:
            response["result"] = task.info["result"]

    return jsonify(response)

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT",3000))
    app.run(host="0.0.0.0", port=port)
