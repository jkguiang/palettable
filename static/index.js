function APICall() {
    console.log("passing "+String($("#url").val())+" as 'url'");
    $("#main").hide();
    $("#load").show();
    $.ajax({
        type: "POST",
        url: "/result",
        data: JSON.stringify({ "url": $("#url").val() }),
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
        var txtColor = sortColors[len-1].color;
        var bgColor = sortColors[0].color;
        var hlColor = sortColors[((len % 2 === 0) ? len/2 : (len-1)/2)].color;
        $("html, body").css("background-color", bgColor);
        $("html, body").css("color", txtColor);
        $("a").css("color", txtColor)
        $(".navbar.navbar-expand-md.navbar-dark.bg-primary.fixed-top").attr("style", `background-color: ${hlColor} !important;`);
        $(":button").css("background-color", hlColor);
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
function Reset() {
    $("#load").hide();
    $("#result").hide();
    $("#main").show();
}
$(function() {
    $("#load").hide();
    $("#result").hide();
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
})
