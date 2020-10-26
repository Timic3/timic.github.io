class Vector4f {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        Utils.assert(Utils.isNumber(x), "First argument must be a number");
        Utils.assert(Utils.isNumber(y), "Second argument must be a number");
        Utils.assert(Utils.isNumber(z), "Third argument must be a number");
        Utils.assert(Utils.isNumber(w), "Fourth argument must be a number");

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    
    static negate(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");
        
        return new Vector4f(
            -input.x,
            -input.y,
            -input.z
        );
    }

    static add(input1, input2) {
        Utils.assert(input1 instanceof Vector4f, "First argument must be Vector4f");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");
        
        return new Vector4f(
            input1.x + input2.x,
            input1.y + input2.y,
            input1.z + input2.z
        );
    }

    static scalarProduct(input1, input2) {
        Utils.assert(Utils.isNumber(input1), "First argument must be a number");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");
        
        return new Vector4f(
            input1 * input2.x,
            input1 * input2.y,
            input1 * input2.z
        );
    }

    static dotProduct(input1, input2) {
        Utils.assert(input1 instanceof Vector4f, "First argument must be Vector4f");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");
        
        return input1.x * input2.x + input1.y * input2.y + input1.z * input2.z;
    }

    static crossProduct(input1, input2) {
        Utils.assert(input1 instanceof Vector4f, "First argument must be Vector4f");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");
        
        return new Vector4f(
            input1.y * input2.z - input1.z * input2.y,
            input1.z * input2.x - input1.x * input2.z,
            input1.x * input2.y - input1.y * input2.x
        );
    }

    static length(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");
        
        return Math.sqrt(
            input.x * input.x +
            input.y * input.y +
            input.z * input.z
        );
    }

    static normalize(input) {
        Utils.assert(input instanceof Vector4f, "First argument must be Vector4f");
        
        const length = this.length(input);
        Utils.assert(length !== 0, "Input vector has zero length");

        return new Vector4f(
            input.x / length,
            input.y / length,
            input.z / length
        );
    }

    static project(input1, input2) {
        Utils.assert(input1 instanceof Vector4f, "First argument must be Vector4f");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");
        
        const length = this.length(input2);
        Utils.assert(length !== 0, "Second input vector has zero length");

        return this.scalarProduct(this.dotProduct(input1, input2) / (length * length), input2);
    }

    static cosPhi(input1, input2) {
        Utils.assert(input1 instanceof Vector4f, "First argument must be Vector4f");
        Utils.assert(input2 instanceof Vector4f, "Second argument must be Vector4f");

        const lengthA = this.length(input1);
        const lengthB = this.length(input2);
        Utils.assert(lengthA !== 0, "First input vector has zero length");
        Utils.assert(lengthB !== 0, "Second input vector has zero length");

        return Math.acos(this.dotProduct(input1, input2) / (lengthA * lengthB));
    }

    toString() {
        return `v ${this.x.toFixed(3)} ${this.y.toFixed(3)} ${this.z.toFixed(3)}`;
    }
}
