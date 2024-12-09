// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math as CesiumMath, Ion } from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the Cesium Viewer
const viewer = new Viewer('cesiumContainer', {
  terrainProvider: createWorldTerrainAsync(),
});

// Optionally disable default navigation controls if you want full custom control
viewer.scene.screenSpaceCameraController.enableRotate = false;
viewer.scene.screenSpaceCameraController.enableZoom = false;
viewer.scene.screenSpaceCameraController.enableTilt = false;
viewer.scene.screenSpaceCameraController.enableLook = false;

// Add custom keyboard navigation
document.addEventListener('keydown', (event) => {
  const camera = viewer.scene.camera;
  const moveRate = 10.0; // Distance to move per key press
  const rotateRate = CesiumMath.toRadians(1.0); // Angle to rotate per key press

  switch (event.key) {
    case 'w':
      camera.moveForward(moveRate);
      break;
    case 's':
      camera.moveBackward(moveRate);
      break;
    case 'a':
      camera.moveLeft(moveRate);
      break;
    case 'd':
      camera.moveRight(moveRate);
      break;
    case 'ArrowUp':
      camera.lookUp(rotateRate);
      break;
    case 'ArrowDown':
      camera.lookDown(rotateRate);
      break;
    case 'ArrowLeft':
      camera.lookLeft(rotateRate);
      break;
    case 'ArrowRight':
      camera.lookRight(rotateRate);
      break;
    default:
      break;
  }
});

(async function() {
  try {
    // Replace `12345` with your actual Cesium ion asset ID
    const assetId = 2749165;
    const tileset = await Cesium3DTileset.fromIonAssetId(assetId);
    viewer.scene.primitives.add(tileset);

    // Wait for the tileset to finish loading
    await tileset.readyPromise;

    // Move the camera to show the tileset
    viewer.scene.camera.flyTo({
      destination: tileset.boundingSphere.center,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-45),
        roll: 0,
      }
    });
  } catch (error) {
    console.error('Error loading tileset from Cesium ion:', error);
  }
})();
