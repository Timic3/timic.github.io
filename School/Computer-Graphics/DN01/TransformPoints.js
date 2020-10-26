class TransformPoints {
    static triggerTransformation(input, output) {
        Utils.assert(input.nodeName === "TEXTAREA", "Input field is not text area object");
        Utils.assert(output.nodeName === "TEXTAREA", "Output field is not text area object");
    
        const text = input.value;
        const pointManager = new PointManager();
        pointManager.read(text);

        pointManager.points = pointManager.points.map(vector => Transformation.transformPoint(vector));

        pointManager.write(output);
    }
}