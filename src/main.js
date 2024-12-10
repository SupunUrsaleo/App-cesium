// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Terrain, Transforms, Matrix4, Cartesian3, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math as CesiumMath, Ion } from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the viewer with terrain
const viewer = new Viewer('cesiumContainer', {
  terrainProvider: await createWorldTerrainAsync(),
  // shadows: true,
});

// Add global imagery
// viewer.imageryLayers.addImageryProvider(createWorldImagery());
// Ensure globe is visible
viewer.scene.globe.show = true;
viewer.scene.skyBox.show = true;
viewer.scene.skyAtmosphere.show = true;

// viewer.camera.setView({
//   destination: Cartesian3.fromRadians(
//     1.7517704227,
//     12.3090332001,
//     290,
//   ),
//   orientation: {
//     heading: -1.3,
//     pitch: -0.6,
//     roll: 0,
//   },
//   // endTransform: Matrix4.IDENTITY,
// });

// Add base imagery if needed
// viewer.imageryLayers.addImageryProvider(new IonImageryProvider({ assetId: 2 }));
// viewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
// Optionally disable default navigation controls if you want full custom control
viewer.scene.screenSpaceCameraController.enableRotate = true;
viewer.scene.screenSpaceCameraController.enableZoom = true;
viewer.scene.screenSpaceCameraController.enableTilt = true;
viewer.scene.screenSpaceCameraController.enableLook = true;

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
    case 'q':
      camera.moveDown(moveRate);
      break;
    case 'e':
      camera.moveUp(moveRate);
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
    const assetId = 2915556;
    const tileset = await Cesium3DTileset.fromIonAssetId(assetId, {
      enableCollision: true,
    });
    viewer.scene.primitives.add(tileset);

    // const center = tileset.boundingSphere.center;
    // viewer.scene.camera.lookAtTransform(Transforms.eastNorthUpToFixedFrame(center));

    await tileset.readyPromise;

    // Adjust camera to show tileset and some horizon
    viewer.scene.camera.flyTo({
      destination: tileset.boundingSphere.center,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-30),
        roll: 0
      }
    });
  } catch (error) {
    console.error('Error loading tileset from Cesium ion:', error);
  }
})();
