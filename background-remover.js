const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadButton = document.getElementById('download');

upload.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const net = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
        });
        
        const segmentation = await net.segmentPerson(canvas, {
            internalResolution: 'high',
            segmentationThreshold: 0.75,
            maxDetections: 1,
            scoreThreshold: 0.7,
            nmsRadius: 20
        });
        
        const foregroundColor = {r: 0, g: 0, b: 0, a: 0}; // Transparent background
        const backgroundColor = {r: 255, g: 255, b: 255, a: 255}; // White background (can be any color or transparent)
        const mask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
        
        const opacity = 1;
        const maskBlurAmount = 0; // Increase blur amount for smoother edges
        const flipHorizontal = false;

        bodyPix.drawMask(
            canvas, img, mask, opacity, maskBlurAmount,
            flipHorizontal
        );

        // Post-processing: smoothing edges
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        smoothEdges(imageData);
        ctx.putImageData(imageData, 0, 0);
    };
});

downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'processed-image.png';
    link.click();
});

function smoothEdges(imageData) {
    // Simple example of edge smoothing (you can implement more sophisticated algorithms)
    const data = imageData.data;
    console.log('data', data)
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) { // If alpha is less than 128
            data[i + 3] = 0; // Make it fully transparent
        }
    }
}
