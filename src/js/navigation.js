/*global $ */
var currentPage = "#frame_pop";
var b4settings = "";
function goTo(page) {
    if (page !== "#settings") {
        var settings = document.querySelector("#settings");
        settings.executeJavaScript(`if ($("#jwt").val()) {
                                        $("#jwt").prop("disabled", true).addClass("secret");
                                        $("#show-jwt").prop('checked', false);
                                    }`);
    } else {
        if (currentPage !== "#settings") {
            b4settings = currentPage;
        } else {
            b4settings = "";
        }
    }
    currentPage = page;
    window.location = page;
}
$(window).on('resize', function() {
    window.location = currentPage;
});

$("#nav button").on("click", function() {
    $("#nav button").css("display", "none");
});
$(".goto_settings").on("click", function() {
    $(".goBack").css("display", "inline-block");
    goTo("#settings");
});
$(".goBack").on("click", function() {
    if (b4settings && b4settings !== "#main" && !$("#error").length) {
        if (b4settings === "#frame_sr") {
            $(".goto_pop").css("display", "inline-block");
            $(".goto_settings").css("display", "inline-block");
        } else {
            $(".goto_sr").css("display", "inline-block");
            $(".goto_settings").css("display", "inline-block");
        }
        goTo(b4settings);
    } else {
        $(".goto_settings").css("display", "inline-block");
        if ($("#frame_pop").length) {
            $(".goto_sr").css("display", "inline-block");
            goTo("#frame_pop");
        } else {
            goTo("#main");
        }
    }
});
function goSr() {
    $("#nav button").css("display", "none");
    $(".goto_pop").css("display", "inline-block");
    $(".goto_settings").css("display", "inline-block");
    goTo("#frame_sr");
}
function goPop() {
    $("#nav button").css("display", "none");
    $(".goto_sr").css("display", "inline-block");
    $(".goto_settings").css("display", "inline-block");
    goTo("#frame_pop");
}
$(".goto_sr").on("click", function() {
    goSr();
});
$(".goto_pop").on("click", function() {
    goPop();
});
