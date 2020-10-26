class Matrix4f {
    constructor(
        m0 = [1, 0, 0, 0],
        m1 = [0, 1, 0, 0],
        m2 = [0, 0, 1, 0],
        m3 = [0, 0, 0, 1]
    ) {
        Utils.assert(m0.length === 4, "First vector must be size of 4");
        Utils.assert(m1.length === 4, "Second vector must be size of 4");
        Utils.assert(m2.length === 4, "Third vector must be size of 4");
        Utils.assert(m3.length === 4, "Fourth vector must be size of 4");
        Utils.assert(!m0.some(isNaN), "First vector contains unexpected values");
        Utils.assert(!m1.some(isNaN), "Second vector contains unexpected values");
        Utils.assert(!m2.some(isNaN), "Third vector contains unexpected values");
        Utils.assert(!m3.some(isNaN), "Fourth vector contains unexpected values");
        
        this.matrix = [m0, m1, m2, m3];
    }

    static negate(input) {
        Utils.assert(input instanceof Matrix4f, "First argument must be Matrix4f");

        return new Matrix4f(
            [-input.matrix[0][0], -input.matrix[0][1], -input.matrix[0][2], -input.matrix[0][3]],
            [-input.matrix[1][0], -input.matrix[1][1], -input.matrix[1][2], -input.matrix[1][3]],
            [-input.matrix[2][0], -input.matrix[2][1], -input.matrix[2][2], -input.matrix[2][3]],
            [-input.matrix[3][0], -input.matrix[3][1], -input.matrix[3][2], -input.matrix[3][3]]
        );
    }

    static add(input1, input2) {
        Utils.assert(input1 instanceof Matrix4f, "First argument must be Matrix4f");
        Utils.assert(input2 instanceof Matrix4f, "Second argument must be Matrix4f");

        const m = new Matrix4f();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                m.matrix[i][j] = input1.matrix[i][j] + input2.matrix[i][j];
            }
        }

        return m;
    }

    static transpose(input) {
        Utils.assert(input instanceof Matrix4f, "First argument must be Matrix4f");
        
        return new Matrix4f(
            [input.matrix[0][0], input.matrix[1][0], input.matrix[2][0], input.matrix[3][0]],
            [input.matrix[0][1], input.matrix[1][1], input.matrix[2][1], input.matrix[3][1]],
            [input.matrix[0][2], input.matrix[1][2], input.matrix[2][2], input.matrix[3][2]],
            [input.matrix[0][3], input.matrix[1][3], input.matrix[2][3], input.matrix[3][3]]
        );
    }

    static multiplyScalar(input1, input2) {
        Utils.assert(Util.isNumber(input1), "First argument must be a number");
        Utils.assert(input2 instanceof Matrix4f, "Second argument must be Matrix4f");

        const m = new Matrix4f();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                m.matrix[i][j] = input1 * input2.matrix[i][j];
            }
        }

        return m;
    }

    static multiply(input1, input2) {
        Utils.assert(input1 instanceof Matrix4f, "First argument must be Matrix4f");
        Utils.assert(input2 instanceof Matrix4f, "Second argument must be Matrix4f");

        const m = new Matrix4f();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += input1.matrix[i][k] * input2.matrix[k][j];
                }
                m.matrix[i][j] = sum;
            }
        }

        return m;
    }
}
