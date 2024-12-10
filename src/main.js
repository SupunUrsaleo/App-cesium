// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Terrain, Transforms, defined, Matrix4, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Cesium3DTileFeature, Math as CesiumMath, Ion } from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the viewer with terrain
const viewer = new Viewer('cesiumContainer', {
  terrainProvider: await createWorldTerrainAsync(),
  infoBox: true,
  // shadows: true,
});

// Enable global imagery and terrain
viewer.scene.globe.show = true;
viewer.scene.skyBox.show = true;
viewer.scene.skyAtmosphere.show = true;
// Enable free mouse navigation (Army-style rotation)
// Disable Cesium's default mouse navigation
viewer.scene.screenSpaceCameraController.enableRotate = false;
viewer.scene.screenSpaceCameraController.enableTilt = false;
viewer.scene.screenSpaceCameraController.enableLook = false;
viewer.scene.screenSpaceCameraController.enableZoom = false;

// Variables to track mouse state
let isRightMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
const rotateSpeed = CesiumMath.toRadians(0.2); // Adjust rotation speed

// Prevent the context menu from appearing on right-click
viewer.canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Track when the right mouse button is pressed
viewer.canvas.addEventListener('mousedown', (event) => {
  if (event.button === 2) { // Right mouse button
    isRightMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }
});

// Track when the right mouse button is released
viewer.canvas.addEventListener('mouseup', (event) => {
  if (event.button === 2) { // Right mouse button
    isRightMouseDown = false;
  }
});

// Rotate the camera based on mouse movement
viewer.canvas.addEventListener('mousemove', (event) => {
  if (!isRightMouseDown) return; // Only rotate when the right mouse button is pressed

  const camera = viewer.scene.camera;

  // Calculate mouse movement deltas
  const deltaX = event.movementX || event.clientX - lastMouseX;
  const deltaY = event.movementY || event.clientY - lastMouseY;

  // Horizontal movement: Rotate left or right
  camera.lookRight(rotateSpeed * deltaX);

  // Vertical movement: Rotate up or down
  camera.lookUp(rotateSpeed * deltaY);

  // Update last mouse position
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
});




const handler = new ScreenSpaceEventHandler(viewer.canvas);

handler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position);
  if (defined(pickedObject)) {
    // Check if it's a 3D tile feature
    if (pickedObject instanceof Cesium3DTileFeature) {
      // Create a basic entity object for the InfoBox
      viewer.selectedEntity = {
        name: "Selected Feature",
        description: `
          <p>Properties of this feature:</p>
          <pre>${JSON.stringify(pickedObject.getPropertyNames().map(name => ({[name]: pickedObject.getProperty(name)})), null, 2)}</pre>
        `
      };
    }
  } else {
    // Clear selection if we didn't pick anything
    viewer.selectedEntity = undefined;
  }
}, ScreenSpaceEventType.LEFT_CLICK);

// Add custom keyboard navigation
document.addEventListener('keydown', (event) => {
  const camera = viewer.scene.camera;
  const moveRate = 5.0; // Movement speed
  const rotateRate = CesiumMath.toRadians(5.0); // Rotation speed

  switch (event.key) {
    case 'w': // Move forward
      camera.moveForward(moveRate);
      break;
    case 's': // Move backward
      camera.moveBackward(moveRate);
      break;
    case 'a': // Strafe left
      camera.moveLeft(moveRate);
      break;
    case 'd': // Strafe right
      camera.moveRight(moveRate);
      break;
    case 'q': // Move down
      camera.moveDown(moveRate);
      break;
    case 'e': // Move up
      camera.moveUp(moveRate);
      break;
    case 'ArrowUp': // Look up
      camera.lookUp(rotateRate);
      break;
    case 'ArrowDown': // Look down
      camera.lookDown(rotateRate);
      break;
    case 'ArrowLeft': // Look left
      camera.lookLeft(rotateRate);
      break;
    case 'ArrowRight': // Look right
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
