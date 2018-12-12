function APICall(type) {
    $("#main").hide();
    $("#load").show();
    var query = {};
    query[type] = $(`#${type}`).val();
    $.ajax({
        type: "POST",
        url: "/query",
        data: JSON.stringify(query),
        contentType: "application/json;charset=UTF-8",
        success: function(data, status, request) {
            $("#load-img").hide();
            $("#load").hide();
            console.log(data);
            Result(type, data);
        },
        error: function() {
            alert("Unexpected error");
            $("#load").hide();
            $("#load-img").hide();
            $("#main").show();
        }
    });
}
function Result(type, data) {
    var resultDiv = $("#result");
    var resultColors = $("#result-colors");
    var resultURL = $("#result-url");
    if (data.hasOwnProperty("result")) {
        // resultImg.attr("src", "data:image/png;base64,"+data.result.img);
        resultURL.html((type === "url") ? $("#url").val() : "Result");
        resultColors.html("");
        var colors = (data.result.colors).sort(function(a,b) { return (a.hsl[0]-b.hsl[0])*(a.hsl[1]-b.hsl[1])*(a.hsl[2]-b.hsl[2]) });
        for (var i = 0; i < colors.length; i++) {
            var rgb = colors[i].rgb;
            var hex = colors[i].hex;
            var hsl = colors[i].hsl;
            colors[i]["lum"] = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
            var txtColor = TextColor(colors[i].lum);
            resultColors.append(`
                <div class="col-md-4 d-flex align-items-stretch" style="padding-bottom: 5px;">
                  <div class="card" id="${'color-card'+String(i)}" style="width: 100%; height: 100px;">
                    <div class="card-body" id="${'color-body'+String(i)}" style="color: ${txtColor}">
                      ${hex}
                    </div>
                  </div>
                </div>
            `);
            $(`#color-card${i}`).css({ "background-color": hex });
        }
        resultDiv.show();
        // Change website's color scheme
        SetScheme(colors);
    }
}
function SetScheme(colors) {
    if (colors.length != 0) {
        // var len = colors.length;
        var bgIndex = 0;
        var hlIndex = ((colors.length % 2 === 0) ? colors.length/2 : (colors.length-1)/2);
        for (var i = 0; i < colors.length; i++) {
            var hsl = colors[i].hsl;
            var rgb = colors[i].rgb;
            var lum = colors[i].lum;
        }
        // Background color
        var bgHex = colors[bgIndex].hex;
        var bgLum = colors[bgIndex].lum;
        // Highlight color
        var hlHex = colors[hlIndex].hex;
        var hlLum = colors[hlIndex].lum;
        // Apply formatting
        $("html, body").css("background-color", bgHex);
        $(".navbar.navbar-expand-md.navbar-dark.bg-primary.fixed-top").attr("style", `background-color: ${hlHex} !important;`);
        $(":button").css("background-color", hlHex);
        $("html, body").css("color", TextColor(bgLum));
        $("a").css("color", TextColor(hlLum));
        $(":button").css("color", TextColor(hlLum));

        return;
    }
}
function TextColor(lum) {
    // return (hsl[2] > 0.9 || (hsl[1] < 0.7 && hsl[1] > 0.6)) ? "#000" : "#fff";
    return (lum > 192) ? "#000" : "#fff";
}
function CheckInput(type) {
    var input = $(`#${type}`).val();
    if (type === "url") {
        // Whole URL string checks
        var hasWWW = (input.indexOf("www") >= 0);
        var colonDoubleSlash = (input.indexOf("://") >= 4);
        var valHTTP = (colonDoubleSlash && (input.split("://")[0] === "http" || input.split("://")[0] === "https"));
        var noWhiteSpace = (input.indexOf(" ") < 0);
        // Split (on '.') URL string checks
        var splitInput = input.split(".");
        var twoDots = (splitInput.length === 3);
        var notEmpty = (splitInput[0] !== "" && splitInput[1] !== "" && splitInput[2] !== "");

        return (hasWWW && valHTTP && colonDoubleSlash && noWhiteSpace && twoDots && notEmpty);
    }
    else if (type === "img") {
        return (input !== "");
    }
    else {
        return false;
    }
}
function Reset() {
    // Reset display
    $("#load").hide();
    $("#result").hide();
    $("#main").show();
    // Reset form
    $("#img").val("");
    $("#img-upload").val("");
    $("#url").val("");
    $("#submit").attr("disabled", !CheckInput($("input[name=radio-buttons]:checked").val()));
}
$(function() {
    // Startup actions
    $("#load").hide();
    $("#result").hide();
    $("#url-radio").attr("checked", true);
    // Initial input check
    $("#submit").attr("disabled", !CheckInput("url"));
    $("#img-upload").attr("disabled", true);
    // Silence 'Enter' keypress
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    // Handle radio menu
    $("input[name=radio-buttons]").on("change", function(e) {
        $("#img-upload").attr("disabled", (e.target.value !== "img"));
        $("#url").attr("disabled", (e.target.value !== "url"));
        $("#submit").attr("disabled", !CheckInput(e.target.value));
    });
    // Handle image upload
    $("#img-upload").on("change", function(e) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var b64 = (reader.result).split("base64,")[1];
            $("#img").val(b64);
            $("#submit").attr("disabled", !CheckInput("img"));
        }

        reader.readAsDataURL(e.target.files[0]);
    });
    // Handle url input
    $("#url").on("keyup", function(e) {
        $("#submit").attr("disabled", !CheckInput("url"));
    });
    // Submit query
    $("#submit").on("click", function() {
        var type = $("input[name=radio-buttons]:checked").val();
        APICall(type);
    });
})
