/** @type {CanvasRenderingContext2D} */
var ctx;

class Utils {
    static assert(condition, message) {
        if (!condition) {
            throw new TypeError(message);
        }
    }

    static isNumber(value) {
        return !isNaN(value);
    }
}

class Circle {
    static RADIUS = 12;
    static THICKNESS = 1.5;
    static SPEED = 2;
    
    constructor(
        x = ctx.canvas.width / 2,
        y = ctx.canvas.height / 2,
        velocityX = (Math.round(Math.random()) === 1 ? 1 : -1),
        velocityY = (Math.round(Math.random()) === 1 ? 1 : -1)
    ) {
        Utils.assert(Utils.isNumber(x), "First argument is not a number");
        Utils.assert(Utils.isNumber(y), "Second argument is not a number");
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
    }

    intersects(circle) {
        return (this.x - circle.x) * (this.x - circle.x) + (this.y - circle.y) * (this.y - circle.y) <= 4 * (Circle.RADIUS * Circle.RADIUS);
    }

    update() {
        if (this.x >= ctx.canvas.width - Circle.RADIUS) {
            this.velocityX = -Math.abs(this.velocityX);
        }
        if (this.x <= Circle.RADIUS) {
            this.velocityX = Math.abs(this.velocityX);
        }
        if (this.y >= ctx.canvas.height - Circle.RADIUS) {
            this.velocityY = -Math.abs(this.velocityY);
        }
        if (this.y <= Circle.RADIUS) {
            this.velocityY = Math.abs(this.velocityY);
        }
        this.x += Circle.SPEED * this.velocityX;
        this.y += Circle.SPEED * this.velocityY;
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = Circle.THICKNESS;
        if (this.collided) {
            ctx.strokeStyle = "#FF0000";
        } else {
            ctx.strokeStyle = "#000000";
        }
        ctx.arc(this.x, this.y, Circle.RADIUS, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }
}

class AABB {
    constructor(x = 0, y = 0, width = ctx.canvas.width, height = ctx.canvas.height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(circle) {
        return ((circle.x + Circle.RADIUS / 2 >= this.x - this.width) &&
            (circle.x + Circle.RADIUS / 2 <= this.x + this.width) &&
            (circle.y + Circle.RADIUS / 2 >= this.y - this.height) &&
            (circle.y + Circle.RADIUS / 2 <= this.y + this.height));
    }

    intersects(aabb) {
        return (this.x < aabb.x + aabb.width && this.x + this.width > aabb.x && this.y < aabb.y + aabb.height && this.y + this.height > aabb.y);
    }
}

// https://en.wikipedia.org/wiki/Quadtree#QuadTree_class
class QuadTree {
    static CAPACITY = 3;

    constructor(boundary) {
        this.boundary = boundary;
        this.circles = [];

        this.quadrants = [];
    }

    insert(circle) {
        // Vstavi samo tiste, ki so znotraj kvadranta
        if (!this.boundary.contains(circle)) {
            return false;
        }

        // Če je še prostora in nima delitev, ga dodaj tukaj
        if (this.circles.length < QuadTree.CAPACITY && this.quadrants.length === 0) {
            this.circles.push(circle);
            return true;
        }

        // Če ni, razdelimo mrežo
        if (this.quadrants.length === 0) {
            this.subdivide();
        }

        // In dodamo v novo narejene mreže
        for (let i = 0; i < 4; ++i) {
            if (this.quadrants[i].insert(circle)) {
                return true;
            }
        }

        return false;
    }

    subdivide() {
        const halfWidth = this.boundary.width / 2;
        const halfHeight = this.boundary.height / 2;
        this.quadrants = [
            new QuadTree(new AABB(this.boundary.x, this.boundary.y, halfWidth, halfHeight)),
            new QuadTree(new AABB(this.boundary.x + halfWidth, this.boundary.y, halfWidth, halfHeight)),
            new QuadTree(new AABB(this.boundary.x, this.boundary.y + halfHeight, halfWidth, halfHeight)),
            new QuadTree(new AABB(this.boundary.x + halfWidth, this.boundary.y + halfHeight, halfWidth, halfHeight)),
        ];
    }

    query(range) {
        const circles = [];
        if (!this.boundary.intersects(range)) {
            return circles;
        }

        for (const circle of this.circles) {
            if (range.contains(circle)) {
                circles.push(circle);
            }
        }

        if (this.quadrants.length === 0) {
            return circles;
        }

        for (let i = 0; i < 4; ++i) {
            Array.prototype.push.apply(circles, this.quadrants[i].query(range));
        }

        return circles;
    }

    draw() {
        for (let i = 0; i < this.quadrants.length; ++i) {
            this.quadrants[i].draw();
        }
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(this.boundary.x, this.boundary.y, this.boundary.width, this.boundary.height);
    }
}

class Renderer {
    static objects = new Array();
    static grid = true;

    static render() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        let quadTree = new QuadTree(new AABB());
        
        for (const object of Renderer.objects) {
            quadTree.insert(object);
            object.update();
            object.draw();
            object.collided = false;
        }
        if (Renderer.grid) {
            quadTree.draw();
        }
        
        for (const object of Renderer.objects) {
            const others = quadTree.query(new AABB(object.x, object.y, Circle.RADIUS));
            for (const other of others) {
                if (object !== other && object.intersects(other)) {
                    object.collided = true;
                    other.collided = true;
                }
            }
        }

        /*for (const object of Renderer.objects) {
            for (const other of Renderer.objects) {
                if (object !== other && object.intersects(other)) {
                    object.collided = true;
                    other.collided = true;
                }
            }
        }*/
        requestAnimationFrame(Renderer.render);
    }
}