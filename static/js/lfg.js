
(function() {

var readAhead = 3;

// A comic is concidered the current comic when it enters this point of the
// viewport. 0 is the top of the viewport, 1 is the bottom.
var focusPosition = 0.3;

var comicsAdded = [];
var currentComicNumber = null;
var $comicsContainer = null;

function init() {
    currentComicNumber = getUrlComicNumber() || 1;
    $comicsContainer = $("#comics-container");

    initComicNumberInput();
    initComics();
}

function initComicNumberInput() {
    $("#comics-nav-input").on("change", function() {
        var number = Number($(this).val());

        // Invalid comic number?
        if (isNaN(number) || number < 1)
            return;

        setComicNumber(number, false);
        $comicsContainer.empty();
        comicsAdded = [];
        initComics();
    });
}

function initComics() {
    var c = currentComicNumber;

    for (var number = c; number < c + readAhead + 1; number++) {
        (function(number) {
            addComic(number)
        }(number));
    }
}

/**
 * Creates and returns a comic element
 */
function addComic(number) {
    // Don't add a comic twice
    if ($.inArray(number, comicsAdded) >= 0)
        return;

    comicsAdded.push(number);

    var comic = $("<div>").addClass("comic");
    var title = "Looking For Group #" + number;

    comic.attr("data-number", number);

    comic.append(
        $("<div>").addClass("comic-title").text(title),
        $("<div>").addClass("comic-img-wrapper")
    );

    getComicUrl(number, function(url) {
        // If the comic requested doesn't exist, the spot is removed
        if (url === null) {
            comic.remove();
            return;
        }

        var img = $("<img>").prop("src", url).addClass("hidden");

        img.on("load", function() {
            img.removeClass("hidden");
        });

        $(".comic-img-wrapper", comic).append(img);
    });

    $comicsContainer.append(comic);
}

/**
 * Calculates the current comic based on the scroll position
 */
function calculateCurrentComic() {
    var winHeight = $(window).height();
    var scrollTop = $(window).scrollTop();
    var c = currentComicNumber;
    var f = (scrollTop + (winHeight * focusPosition));

    // Checks if the focus position is on the input comic
    function check(comic) {
        var t = comic.offset().top;
        var b = t + comic.height();

        return f >= t && f <= b;
    }

    var comic = $(".comic[data-number=" + c + "]", $comicsContainer);

    if (check(comic))
        setComicNumber(Number(comic.data("number")));

    comic.nextAll().each(function(index, comic) {
        comic = $(comic);

        if (check(comic)) {
            setComicNumber(Number(comic.data("number")));
            return false;
        }
    });

    comic.prevAll().each(function(index, comic) {
        comic = $(comic);

        if (check(comic)) {
            setComicNumber(Number(comic.data("number")));
            return false;
        }
    });
}

function getComicUrl(number, callback) {
    var url = "/comic/" + number;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "text",

        success: function(text) {
            callback(text);
        },

        error: function() {
            callback(null);
        }
    });
}

function getUrlComicNumber() {
    var hash = window.location.hash;
    var number = hash.replace(/^#/, "");
    number = Number(number);

    if (isNaN(number)) return null;
    if (number % 1 !== 0) return null;

    return number;
}

function setComicNumber(number, loadNewComics) {
    if (loadNewComics === undefined) loadNewComics = true;

    currentComicNumber = number;

    if (loadNewComics)
        for (var i = number; i < number + readAhead + 1; i++)
            addComic(i);

    window.location.hash = number;
}

$(window).on("hashchange", function() {
    var number = getUrlComicNumber();

    if (number === null)
        console.log("Bad comic number");
    else if (number === currentComicNumber)
        return;
    else
        console.log("Hash changed to", window.location.hash);
});

$(window).on("scroll", _(calculateCurrentComic).throttle(100));

// Execute init on document ready
$(function() { init(); });

}());
