(function () {
    "use strict";

    /* Pixel-art maps. "X" = solid pixel, "o" = blinking pixel, anything else = empty. */
    var PX = {
        sparkle: [
            "..X..",
            "..X..",
            "XXXXX",
            "..X..",
            "..X.."
        ],
        heart: [
            ".XX.XX.",
            "XXXXXXX",
            "XXXXXXX",
            ".XXXXX.",
            "..XXX..",
            "...X..."
        ],
        heartHalf: [
            ".XX....",
            "XXXX...",
            "XXXX...",
            ".XXX...",
            "..XX...",
            "...X..."
        ],
        heartOutline: [
            ".XX.XX.",
            "X..X..X",
            "X.....X",
            ".X...X.",
            "..X.X..",
            "...X..."
        ],
        monitor: [
            "XXXXXXXXXXXXXXXXXXXX",
            "X..................X",
            "X..X...............X",
            "X...X..............X",
            "X....X.............X",
            "X...X..............X",
            "X..X...oooo........X",
            "X..................X",
            "X..................X",
            "X..................X",
            "XXXXXXXXXXXXXXXXXXXX",
            "........XXXX........",
            "........XXXX........",
            ".....XXXXXXXXXX....."
        ],
        pawn: [
            "...XXX...",
            "..XXXXX..",
            "..XXXXX..",
            "...XXX...",
            "..XXXXX..",
            "...XXX...",
            "...XXX...",
            ".XXXXXXX.",
            "XXXXXXXXX"
        ],
        molecule: [
            ".XX...XX.",
            "X..X.X..X",
            "X..XXX..X",
            ".XX...XX.",
            "....X....",
            "....X....",
            "...XXX...",
            "..X...X..",
            "...XXX..."
        ],
        globe: [
            "...XXX...",
            ".XX.X.XX.",
            "X..X.X..X",
            "XXXXXXXXX",
            "X..X.X..X",
            "XXXXXXXXX",
            "X..X.X..X",
            ".XX.X.XX.",
            "...XXX..."
        ],
        chip: [
            ".X.X.X.X.",
            "XXXXXXXXX",
            ".X.....X.",
            "XX.XXX.XX",
            ".X.X.X.X.",
            "XX.XXX.XX",
            ".X.....X.",
            "XXXXXXXXX",
            ".X.X.X.X."
        ],
        palette: [
            "..XXXXX..",
            ".X.....X.",
            "X.XX....X",
            "X.XX..X.X",
            "X.....XXX",
            "X.X.....X",
            "X.....XX.",
            ".X...X...",
            "..XXX...."
        ],
        briefcase: [
            "...XXX...",
            "..X...X..",
            "XXXXXXXXX",
            "X.......X",
            "XXXX.XXXX",
            "X...X...X",
            "X.......X",
            "XXXXXXXXX"
        ],
        book: [
            ".XXX.XXX.",
            "X...X...X",
            "X.X.X.X.X",
            "X...X...X",
            "X.X.X.X.X",
            "X...X...X",
            "XXXXXXXXX"
        ],
        trophy: [
            "XXXXXXXXX",
            "X.XXXXX.X",
            "X.XXXXX.X",
            ".XXXXXXX.",
            "..XXXXX..",
            "...XXX...",
            "....X....",
            "...XXX...",
            "..XXXXX.."
        ],
        chart: [
            "X......X.",
            "X.....XXX",
            "X.....XX.",
            "X.X..X...",
            "X.XXX....",
            "X..X.....",
            "X........",
            "XXXXXXXXX"
        ],
        cap: [
            "....X....",
            "..XXXXX..",
            "XXXXXXXXX",
            "..XXXXX..",
            "..X...X.X",
            "..XXXXX.X",
            "........X"
        ],
        gamepad: [
            ".XXXXXXXXX.",
            "X.........X",
            "X.X....X..X",
            "XXXX..X.X.X",
            "X.X....X..X",
            "X..XXXXX..X",
            ".XX.....XX."
        ],
        flag: [
            "X........",
            "XXXXX....",
            "XXXXXXXX.",
            "XXXXX....",
            "X........",
            "X..X.X.X.",
            "X........",
            "X.X.X.X.X",
            "X........"
        ]
    };

    function toPath(map, ch) {
        var d = "";
        for (var y = 0; y < map.length; y++) {
            var row = map[y];
            for (var x = 0; x < row.length; x++) {
                if (row[x] === ch) d += "M" + x + " " + y + "h1v1h-1z";
            }
        }
        return d;
    }

    document.querySelectorAll("[data-px]").forEach(function (el) {
        var map = PX[el.getAttribute("data-px")];
        if (!map) return;
        var scale = parseFloat(el.getAttribute("data-scale")) || 2;
        var w = map[0].length, h = map.length;
        var solid = toPath(map, "X"), blink = toPath(map, "o");
        el.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + " " + h + '" width="' + w * scale +
            '" height="' + h * scale + '" aria-hidden="true" focusable="false">' +
            '<path fill="currentColor" d="' + solid + '"/>' +
            (blink ? '<path class="cursor-blink" fill="currentColor" d="' + blink + '"/>' : "") +
            "</svg>";
    });

    /* Copy-to-clipboard buttons */
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var text = btn.getAttribute("data-copy");
            var original = btn.textContent;
            var done = function () {
                btn.textContent = "copied!";
                setTimeout(function () { btn.textContent = original; }, 1400);
            };
            if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
        });
    });

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
})();
