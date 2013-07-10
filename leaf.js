function startAnimation(imageType) {
    "use strict";

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    function Leaf() {
        this.p = Math.random() * 5;
        this.x = Math.floor(Math.random() * WIDTH);
        this.y = Math.floor(Math.random() * -500);
        this.dy = 1;
        this.horizontalPlay = Math.random() * 3;
        this.image = new Image();

        if (imageType === "png") {
            this.image.src = "Leaf_1.png";
        } else {
            this.image.src = "Leaf_1.svg";
        }
    }

    Leaf.prototype = {
        LEAF_WIDTH: 20,
        LEAF_HEIGHT: 20,

        tick: function() {
            this.y = Math.min(HEIGHT - this.LEAF_HEIGHT, this.y + this.dy);

            if (this.y < HEIGHT - this.LEAF_HEIGHT) {
                this.x = this.x + Math.sin(this.p) * this.horizontalPlay;
                this.p += 0.1;
            }
        },

        render: function(canvasCtx) {
            canvasCtx.drawImage(this.image, this.x, this.y, this.LEAF_WIDTH, this.LEAF_HEIGHT);
        }
    };

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var MAX_LEAVES = 1024;
    var leaves = [];

    for (var i = 0; i < MAX_LEAVES; i++) {
        leaves.push(new Leaf());
    }

    setInterval(function() {
        for (var i = 0; i < leaves.length; i++) {
            leaves[i].tick();
        }
    }, 33);

    (function renderCanvas() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0; i < leaves.length; i++) {
            leaves[i].render(ctx);
        }

        requestAnimationFrame(renderCanvas);
    }());
};