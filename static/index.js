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
            Result(data);
        },
        error: function() {
            alert("Unexpected error");
            $("#load").hide();
            $("#load-img").hide();
            $("#main").show();
        }
    });
}
function Result(data) {
    var resultDiv = $("#result");
    var resultColors = $("#result-colors");
    var resultURL = $("#result-url");
    if (data.hasOwnProperty("result")) {
        // resultImg.attr("src", "data:image/png;base64,"+data.result.img);
        resultURL.html($("#url").val());
        resultColors.html("");
        var colors = data.result.colors;
        var sortColors = [];
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            var luma = GetLuma(color); // Get perceived lightness or darkness
            var txtColor = (luma > 128) ? "#000" : "#fff";
            sortColors.push({ "luma":luma, "color":color });
            resultColors.append(`
                <div class="col-md-4 d-flex align-items-stretch" style="padding-bottom: 5px;">
                  <div class="card" id="${'color-card'+String(i)}" style="width: 100%; height: 100px;">
                    <div class="card-body" id="${'color-body'+String(i)}" style="color: ${txtColor}">
                      ${color}
                    </div>
                  </div>
                </div>
            `);
            $(`#color-card${i}`).css({ "background-color": color });
        }
        resultDiv.show();
        // Change website's color scheme
        SetScheme(sortColors.sort(function(a,b) { return a.luma - b.luma }));
    }
}
function SetScheme(sortColors) {
    if (sortColors.length != 0) {
        var len = sortColors.length;
        // Background color
        var bgColor = sortColors[0].color;
        // Highlight color
        var hlIndex = ((len % 2 === 0) ? len/2 : (len-1)/2);
        var hlColor = sortColors[hlIndex].color;
        var hlLuma = sortColors[hlIndex].luma;
        // Text color
        var txtColor = (hlLuma > 176) ? "#000" : "#fff";
        // Apply formatting
        $("html, body").css("background-color", bgColor);
        $(".navbar.navbar-expand-md.navbar-dark.bg-primary.fixed-top").attr("style", `background-color: ${hlColor} !important;`);
        $(":button").css("background-color", hlColor);
        $("html, body").css("color", txtColor);
        $("a").css("color", txtColor);
        $(":button").css("color", txtColor);
        return;
    }
}
function GetLuma(color) {
    var c = color.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue

    return 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
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
    $("#load").hide();
    $("#result").hide();
    $("#main").show();
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
