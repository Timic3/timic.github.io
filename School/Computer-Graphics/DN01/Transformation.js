class Transformation {
    constructor() {
        // V navodilih piše, da moramo to nastaviti na privatno spremenljivko,
        // ampak v ES6 privatne spremenljivke ne obstajajo
        this._matrix = new Matrix4f();
    }

    translate(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");

        this._matrix = Matrix4f.multiply(
            new Matrix4f(
                [1, 0, 0, input.x],
                [0, 1, 0, input.y],
                [0, 0, 1, input.z],
                [0, 0, 0, 1]
            ),
            this._matrix
        );
    }

    scale(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");

        this._matrix = Matrix4f.multiply(
            new Matrix4f(
                [input.x, 0, 0, 0],
                [0, input.y, 0, 0],
                [0, 0, input.z, 0],
                [0, 0, 0, 1]
            ),
            this._matrix
        );
    }

    rotateX(input) {
        Utils.assert(Utils.isNumber(input), "First argument must be a number");

        this._matrix = Matrix4f.multiply(
            new Matrix4f(
                [1, 0, 0, 0],
                [0, Math.cos(input), -Math.sin(input), 0],
                [0, Math.sin(input), Math.cos(input), 0],
                [0, 0, 0, 1]
            ),
            this._matrix
        );
    }

    rotateY(input) {
        Utils.assert(Utils.isNumber(input), "First argument must be a number");

        this._matrix = Matrix4f.multiply(
            new Matrix4f(
                [Math.cos(input), 0, Math.sin(input), 0],
                [0, 1, 0, 0],
                [-Math.sin(input), 0, Math.cos(input), 0],
                [0, 0, 0, 1]
            ),
            this._matrix
        );
    }

    rotateZ(input) {
        Utils.assert(Utils.isNumber(input), "First argument must be a number");

        this._matrix = Matrix4f.multiply(
            new Matrix4f(
                [Math.cos(input), -Math.sin(input), 0, 0],
                [Math.sin(input), Math.cos(input), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ),
            this._matrix
        );
    }

    static transformPoint(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");

        const newTransformation = new Transformation();
        newTransformation.translate(new Vector4f(1.25, 0, 0));
        newTransformation.rotateZ(Math.PI / 3);
        newTransformation.translate(new Vector4f(0, 0, 4.15));
        newTransformation.translate(new Vector4f(0, 3.14, 0));
        newTransformation.scale(new Vector4f(1.12, 1.12, 1));
        newTransformation.rotateY(5 * Math.PI / 8);

        return new Vector4f(
            newTransformation._matrix.matrix[0][0] * input.x +
            newTransformation._matrix.matrix[0][1] * input.y +
            newTransformation._matrix.matrix[0][2] * input.z +
            newTransformation._matrix.matrix[0][3] * input.w,

            newTransformation._matrix.matrix[1][0] * input.x +
            newTransformation._matrix.matrix[1][1] * input.y +
            newTransformation._matrix.matrix[1][2] * input.z +
            newTransformation._matrix.matrix[1][3] * input.w,

            newTransformation._matrix.matrix[2][0] * input.x +
            newTransformation._matrix.matrix[2][1] * input.y +
            newTransformation._matrix.matrix[2][2] * input.z +
            newTransformation._matrix.matrix[2][3] * input.w
        );
    }
}
