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

class Point {
    dependents = [];

    constructor(x = 0, y = 0) {
        Utils.assert(Utils.isNumber(x), "First argument is not a number");
        Utils.assert(Utils.isNumber(y), "Second argument is not a number");
        this.x = x;
        this.y = y;
    }

    addDependent(point) {
        this.dependents.push(point);
    }
    
    draw(isSelected) {
        /*
        // Za testiranje krivulje
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        */
        ctx.beginPath();
        ctx.fillStyle = (isSelected ? "#FF0000" : "#00FFFF");
    }

    // Pridobi središčno točko med dvemi vozlišči
    midpoint(point) {
        return new Point((point.x - this.x) / 2 + this.x, (point.y - this.y) / 2 + this.y);
    }
}

// Aproksimirano vozlišče krivi krivuljo
class ApproximatedPoint extends Point {
    static RADIUS = 5;

    constructor(x, y) {
        super(x, y);
    }

    draw(isSelected) {
        super.draw(isSelected);
        ctx.save();
        ctx.arc(this.x, this.y, ApproximatedPoint.RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        ctx.closePath();
    }

    intersection(x, y) {
        return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) <= ApproximatedPoint.RADIUS * ApproximatedPoint.RADIUS;
    }

    // Izračunaj projekcijo čez interpolirano vozlišče
    calculateProjection(interpolatedPoint) {
        return new ApproximatedPoint(2 * interpolatedPoint.x - this.x, 2 * interpolatedPoint.y - this.y);
    }

    projectOverPoint(interpolatedPoint) {
        const newPoint = this.calculateProjection(interpolatedPoint);
        interpolatedPoint.dependents = [];
        interpolatedPoint.addDependent(this);
        interpolatedPoint.addDependent(newPoint);
        this.addDependent(interpolatedPoint);
        newPoint.addDependent(interpolatedPoint);
        return newPoint;
    }
}

// Interpolirano vozlišče leži na krivulji
class InterpolatedPoint extends Point {
    static WIDTH = 8;
    static HEIGHT = 8;

    constructor(x, y) {
        super(x, y);
    }

    draw(isSelected) {
        super.draw(isSelected);
        ctx.fillRect(
            this.x - InterpolatedPoint.WIDTH / 2,
            this.y - InterpolatedPoint.HEIGHT / 2,
            InterpolatedPoint.WIDTH,
            InterpolatedPoint.HEIGHT
        );
        ctx.closePath();
    }

    intersection(x, y) {
        return (x >= this.x - 4 && x <= this.x + 4 && y >= this.y - 4 && y <= this.y + 4);
    }
}

class Curve {
    static ACCURACY = 50; // Natančnost za de Casteljauvov algoritem - neuporabljen
    static THRESHOLD = 1; // Manjši threshold = večja natančnost
    static THICKNESS = 1.5; // Debelina zlepkov
    points = []; // Vozlišča, ki jih vsebuje krivulja
    parent = false; // Starš krivulje (zlepek)

    constructor(points, parent) {
        Utils.assert(points[0] instanceof InterpolatedPoint, "First point must be interpolated point (control point).");
        Utils.assert(points[1] instanceof ApproximatedPoint, "Second point must be approximated point (tesselation point).");
        Utils.assert(points[2] instanceof ApproximatedPoint, "Third point must be approximated point (tesselation point).");
        Utils.assert(points[3] instanceof InterpolatedPoint, "Fourth point must be interpolated point (control point).");
        Utils.assert(parent instanceof Spline, "Fifth argument must be Spline object.");
        this.points = points;
        this.parent = parent;
        this.draw(true); // Takoj nariši krivuljo
    }

    // De Casteljauvov algoritem - ni uporabljen
    casteljau(t) {
        return new Point(
            (1 - t) * ((1 - t) * ((1 - t) * this.points[0].x + t * this.points[1].x) + t * ((1 - t) * this.points[1].x + t * this.points[2].x)) + t * ((1 - t) * ((1 - t) * this.points[1].x + t * this.points[2].x) + t * ((1 - t) * this.points[2].x + t * this.points[3].x)),
            (1 - t) * ((1 - t) * ((1 - t) * this.points[0].y + t * this.points[1].y) + t * ((1 - t) * this.points[1].y + t * this.points[2].y)) + t * ((1 - t) * ((1 - t) * this.points[1].y + t * this.points[2].y) + t * ((1 - t) * this.points[2].y + t * this.points[3].y))
        );
    }

    // Izračun raven krivulje oz. "flatness"
    // Roger Willcocksov algoritem za izračunavanje ravni krivulje
    // https://hcklbrrfnn.files.wordpress.com/2012/08/bez.pdf
    flatness(curve) {
        let ux = Math.pow(3 * curve[1].x - 2 * curve[0].x - curve[3].x, 2);
        let uy = Math.pow(3 * curve[1].y - 2 * curve[0].y - curve[3].y, 2);
        const vx = Math.pow(3 * curve[2].x - 2 * curve[3].x - curve[0].x, 2);
        const vy = Math.pow(3 * curve[2].y - 2 * curve[3].y - curve[0].y, 2);
        if (ux < vx) {
            ux = vx;
        }
        if (uy < vy) {
            uy = vy;
        }
        return ux + uy;
    }

    // Razpolovi krivuljo
    split(curve) {
        const m12 = curve[0].midpoint(curve[1]);
        const m23 = curve[1].midpoint(curve[2]);
        const m34 = curve[3].midpoint(curve[2]);
        const m123 = m12.midpoint(m23);
        const m234 = m23.midpoint(m34);
        const m1234 = m123.midpoint(m234);
        return [
            [curve[0], m12, m123, m1234],
            [m1234, m234, m34, curve[3]]
        ];
    }

    // Rekurzivno razpolovi krivuljo, dokler ni dovolj ravna
    flatten(curve) {
        if(this.flatness(curve) < Curve.THRESHOLD) {
            // Ko je dovolj ravna, jo izriši
            return this.drawCurveLine(curve[0], curve[3]);
        } else {
            const split = this.split(curve);
            // Razdeli na levi in desni del
            this.flatten(split[0]);
            this.flatten(split[1]);
        }
    }

    check(x, y) {
        for (const point of this.points) {
            if (point.intersection(x, y)) {
                return point;
            }
        }
        return false;
    }

    drawCurveLine(c1, c2) {
        ctx.beginPath();
        // Test threshold
        // ctx.arc(c1.x, c1.y, 2, 0, 2 * Math.PI);
        // ctx.fill();
        ctx.strokeStyle = this.parent.color;
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.lineWidth = Curve.THICKNESS;
        ctx.stroke();
        ctx.closePath();
    }

    drawApproximationLines() {
        ctx.beginPath();
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";

        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        
        ctx.moveTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[3].x, this.points[3].y);

        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }

    draw(isSelected) {
        this.drawApproximationLines();
        /*
        // De Casteljauvov algoritem - neuporabljeno
        let p = this.casteljau(0);
        for (let i = 1; i <= Curve.ACCURACY; ++i) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            // Test accuracy
            ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
            p = this.casteljau(i / Curve.ACCURACY);
            ctx.lineTo(p.x, p.y);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.closePath();
        }
        */
        // Izvedi rekurzivni algoritem z postopnim risanjem krivulje (curve flattening)
        this.flatten(this.points);

        // Nariši vsa vozlišča
        for (const point of this.points) {
            point.draw(isSelected);
        }
    }
}

class Spline {
    static splines = new Set(); // Vsi zlepki, ki so na platnu
    static current; // Trenutno izbran zlepek
    static isDragging = false; // Predvsem za optimizacijo
    static number = 1;

    curves = []; // Vse krivulje, ki jih vsebuje zlepek
    temporaryPoints = []; // Trenutna vozlišča, ki jih uporabnik nastavi (drag and drop)
    deltaPoints = []; // Delta vozliša: Uporabljeno za premikanje interpoliranih vozlišč
    draggedPoint = false; // Vozlišče, ki ga trenutno nosimo z miško
    fullyDrawn = false; // Ali je narisana prva krivulja? Uporabljeno za brisanje ostankov
    color = "#000000"; // Barva zlepka

    constructor(isPreview = false) {
        if (!isPreview) {
            this.friendlyId = Spline.number++;
            const selection = document.getElementById("splines");
            const spline = document.createElement("option");
            spline.value = this.friendlyId;
            spline.innerHTML = this;
            selection.appendChild(spline);
        }
    }

    // Osveži platno in nariši vse zlepke
    static refreshAll() {
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        for (const spline of Spline.splines) {
            spline.draw(spline === Spline.current);
        }
    }

    // Pridobi zlepek glede na klik vozlišča
    static getClickedSpline(mouseX, mouseY) {
        for (const spline of Spline.splines) {
            if (spline.checkCurveClick(mouseX, mouseY)) {
                return spline;
            }
        }
        return false;
    }

    // Najdi objekt zlepka glede na ID
    static findByFriendlyId(friendlyId) {
        for (const spline of Spline.splines) {
            if (spline.friendlyId === friendlyId) {
                return spline;
            }
        }
    }

    // Lepo ime, za naše oči
    toString() {
        return "Krivulja " + this.friendlyId;
    }

    // Nariši zlepek (njegove krivulje)
    draw(isSelected) {
        for (const curve of this.curves) {
            curve.draw(isSelected);
        }
    }

    // Pobarvaj zlepek in ponovno nariši platno
    colorize(color) {
        this.color = color;
        Spline.refreshAll();
    }

    // Preveri, če je kliknil na katerokoli krivuljo
    checkCurveClick(mouseX, mouseY) {
        for (const curve of this.curves) {
            if (curve.check(mouseX, mouseY)) {
                return true;
            }
        }
        return false;
    }

    mouseDown(mouseX, mouseY) {
        for (const curve of this.curves) {
            this.draggedPoint = curve.check(mouseX, mouseY);
            if (this.draggedPoint) {
                Spline.isDragging = true;
                this.deltaPoints = [];
                if (this.draggedPoint instanceof InterpolatedPoint) {
                    for (let i = 0; i < this.draggedPoint.dependents.length; ++i) {
                        const dependent = this.draggedPoint.dependents[i];
                        this.deltaPoints[i] = new Point(
                            dependent.x - this.draggedPoint.x,
                            dependent.y - this.draggedPoint.y
                        );
                    }
                }
                return;
            }
        }
        this.temporaryPoints.push(new InterpolatedPoint(mouseX, mouseY));
    }

    mouseUp(mouseX, mouseY) {
        if (this.draggedPoint) {
            this.draggedPoint = false;
            Spline.isDragging = false;
            return;
        }
        this.temporaryPoints.push(new ApproximatedPoint(mouseX, mouseY));

        if (this.curves.length > 0) {
            const a2 = this.temporaryPoints.pop();
            const i2 = this.temporaryPoints.pop();
            const i1 = this.curves[this.curves.length - 1].points[3];
            const a1 = this.curves[this.curves.length - 1].points[2].projectOverPoint(this.curves[this.curves.length - 1].points[3]);

            const s = new Curve([i1, a1, a2, i2], Spline.current);
            this.curves.push(s);
            
            i2.addDependent(a2);
        } else if (this.temporaryPoints.length === 4) {
            const s = new Curve([this.temporaryPoints[0], this.temporaryPoints[1], this.temporaryPoints[3], this.temporaryPoints[2]], Spline.current);
            this.curves.push(s);
            this.fullyDrawn = true;

            this.temporaryPoints[0].addDependent(this.temporaryPoints[1]);
            this.temporaryPoints[2].addDependent(this.temporaryPoints[3]);
            this.temporaryPoints = [];
        }
    }

    mouseMove(mouseX, mouseY) {
        if (this.draggedPoint) {
            this.draggedPoint.x = mouseX;
            this.draggedPoint.y = mouseY;
            if (this.draggedPoint instanceof InterpolatedPoint) {
                for (let i = 0; i < this.draggedPoint.dependents.length; ++i) {
                    this.draggedPoint.dependents[i].x = mouseX + this.deltaPoints[i].x;
                    this.draggedPoint.dependents[i].y = mouseY + this.deltaPoints[i].y;
                }
            } else if (this.draggedPoint instanceof ApproximatedPoint) {
                if (this.draggedPoint.dependents.length > 0) {
                    let projectedPoint = this.draggedPoint.dependents[0].dependents[0];
                    if (this.draggedPoint.dependents[0].dependents[0] === this.draggedPoint) {
                        projectedPoint = this.draggedPoint.dependents[0].dependents[1];
                    }
                    const projection = this.draggedPoint.calculateProjection(this.draggedPoint.dependents[0]);
                    projectedPoint.x = projection.x;
                    projectedPoint.y = projection.y;
                }
            }
            Spline.refreshAll();
        }
    }
}

class Preview {
    static curve;
    static spline = new Spline(true);
    static mode = false;
    static points = [];

    static mouseDown(mouseX, mouseY) {
        Preview.mode = true;
        Preview.spline.color = "grey";
        Preview.points.push(new InterpolatedPoint(mouseX, mouseY));
        Preview.points.push(new ApproximatedPoint(mouseX, mouseY));
        Preview.points[0].draw();
    }

    static mouseUp(fullyDrawn) {
        Preview.mode = false;
        if (Preview.points.length === 4 || fullyDrawn) {
            Preview.points = [];
            Preview.curve = false;
            Spline.refreshAll();
        }
    }

    static mouseMove(mouseX, mouseY) {
        // Optimizacija: Ne naredi nič, če že premikamo vozlišče
        if (!Spline.isDragging) {
            // Spremeni stil miške, če kaže na vozlišče
            if (Spline.getClickedSpline(mouseX, mouseY)) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        }

        // Ali dovolimo preview?
        if (Preview.mode) {
            Spline.refreshAll();

            ctx.beginPath();
            ctx.save();

            ctx.setLineDash([4, 3]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "grey";

            for (let i = 0; i < Preview.points.length; i += 2) {
                ctx.moveTo(Preview.points[i].x, Preview.points[i].y);
                ctx.lineTo(Preview.points[i + 1].x, Preview.points[i + 1].y);
            }

            ctx.stroke();
            ctx.restore();
            ctx.closePath();

            Preview.points[0].draw();
            Preview.points[1].draw();
            Preview.points[Preview.points.length === 2 ? 1 : 3].x = mouseX;
            Preview.points[Preview.points.length === 2 ? 1 : 3].y = mouseY;
            if (Preview.points.length === 4) {
                Preview.points[2].draw();
                Preview.points[3].draw();
            }

            if (!Preview.curve && Preview.points.length === 4) {
                Preview.curve = new Curve([Preview.points[0], Preview.points[1], Preview.points[3], Preview.points[2]], Preview.spline);
            } else if (!Preview.curve && Preview.points.length === 2 && Spline.current.fullyDrawn) {
                const lastCurve = Spline.current.curves[Spline.current.curves.length - 1];
                Preview.curve = new Curve([Preview.points[0], Preview.points[1], lastCurve.points[2].calculateProjection(lastCurve.points[3]), lastCurve.points[3]], Preview.spline);
            } else if (Preview.curve) {
                Preview.curve.draw();
            }
        }
    }
}
