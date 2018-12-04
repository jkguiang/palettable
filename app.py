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

@celery.task
def APICall(url):
    print("passing {} to api".format(url))
    return api.Parse(url)

@app.route("/", methods=['GET', 'POST'])
def Index():
    # response = { "success": False }
    # if request.method == "POST":
    #     print("post received")
    #     url = request.form["url"]
    #     result = APICall.delay(url)
    #     return render_template("home.html", response=result.wait())
    return render_template("index.html")

@app.route("/result", methods=['POST'])
def Result():
    # response = { "success": False }
    # if request.method == "POST":
    #     print("post received")
    #     url = request.form["url"]
    #     result = APICall.delay(url)
    #     return render_template("result.html", response=result.wait())
    #
    # return render_template("result.html", response=response)
    if request.data:
        url = request.json["url"]
    else:
        url = ""
    print("received {}".format(url))
    task = APICall.apply_async(args=[url])
    return jsonify({}), 202, {'Location': url_for('Status', taskID=task.id)}

@app.route('/status/<taskID>')
def Status(taskID):
    print("checking status")
    task = APICall.AsyncResult(taskID)
    print(task.state)
    print(task.info)
    response = { "state": task.state }
    if task.state != "FAILURE" and task.info and "result" in task.info:
        response["result"] = task.info["result"]
    return jsonify(response)

if __name__ == "__main__":
    app.debug = True
    port = int(os.environ.get("PORT",3000))
    app.run(host="0.0.0.0", port=port)
