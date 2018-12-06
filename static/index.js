function APICall() {
    console.log("passing "+String($("#url").val())+" as 'url'");
    $.ajax({
        type: "POST",
        url: "/result",
        data: JSON.stringify({ "url": $("#url").val() }),
        contentType: "application/json;charset=UTF-8",
        success: function(data, status, request) {
            $("#main").hide();
            $("#load-img").hide();
            $("#load").show();
            statusURL = request.getResponseHeader("Location");
            Update(statusURL);
        },
        error: function() {
            alert("Unexpected error");
            $("#load").hide();
            $("#load-img").hide();
            $("#main").show();
        }
    });
}
function Update(statusURL) {
    var mainDiv = $("#main");
    var resultDiv = $("#result");
    var resultColors = $("#result-colors");
    var resultImg = $("#result-img");
    var loadBar = $("#load");
    var loadTxt = $("#load-txt");
    var loadImg = $("#load-img");
    $.getJSON(statusURL, function(data) {
        console.log(data);
        if (data.state === "SUCCESS" && data.hasOwnProperty("result")) {
            // resultImg.attr("src", "data:image/png;base64,"+data.result.img);
            resultColors.html("");
            var colors = data.result.colors;
            for (var i = 0; i < colors.length; i++) {
                var color = colors[i];
                resultColors.append(`
                    <div class="col-md-4 d-flex align-items-stretch">
                      <div class="card" id="${'color-card'+String(i)}" style="width: 100%; height: 100px;">
                        <div class="card-body" id="${'color-body'+String(i)}">
                          ${color}
                        </div>
                      </div>
                    </div>
                `);
                $(`#color-card${i}`).css({ "background-color": color });
            }
            loadBar.hide();
            resultDiv.show();
        }
        else if (data.state === "FAILURE") {
            mainDiv.show();
            resultDiv.hide();
            loadBar.hide();
        }
        else {
            if (data.hasOwnProperty("status")) {
                loadTxt.html(data.status);
            }
            if (data.hasOwnProperty("result")) {
                loadImg.show();
                loadImg.attr("src", "data:image/png;base64,"+data.result);
            }
            console.log(data);
            setTimeout(function() {
                Update(statusURL);
            }, 500);
        }
    });
}
$(function() {
    $("#load").hide();
    $("#result").hide();
})
