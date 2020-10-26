class PointManager {
    constructor() {
        this.points = [];
    }

    read(input) {
        const lines = input.split("\n");
        for (const line of lines) {
            const tokens = line.trim().split(/\s+/);
            if (tokens.length === 4 && tokens[0] === "v") {
                const x = parseFloat(tokens[1]);
                const y = parseFloat(tokens[2]);
                const z = parseFloat(tokens[3]);
                if (Utils.isNumber(x) && Utils.isNumber(y) && Utils.isNumber(z)) {
                    this.points.push(new Vector4f(x, y, z));
                }
            }
        }
    }

    write(object) {
        object.value = "";
        for (const vector of this.points) {
            object.value += vector + "\n";
        }
    }
}