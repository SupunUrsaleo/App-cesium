// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import {
  Viewer,
  createWorldTerrainAsync,
  Cartesian3,
  Math as CesiumMath,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  Entity,
  Cesium3DTileset,
  Ion,
  defined,
  Color,
  Cesium3DTileFeature,
} from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the viewer with terrain
const viewer = new Viewer('cesiumContainer', {
  terrainProvider: await createWorldTerrainAsync(),
  infoBox: true,
});

// Ensure globe is visible
viewer.scene.globe.show = true;
viewer.scene.skyBox.show = true;
viewer.scene.skyAtmosphere.show = true;

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

// HTML overlay for showing feature name on mouse hover
const nameOverlay = document.createElement('div');
viewer.container.appendChild(nameOverlay);
nameOverlay.className = 'backdrop';
nameOverlay.style.display = 'none';
nameOverlay.style.position = 'absolute';
nameOverlay.style.bottom = '0';
nameOverlay.style.left = '0';
nameOverlay.style['pointer-events'] = 'none';
nameOverlay.style.padding = '4px';
nameOverlay.style.backgroundColor = 'black';

// Function to update name overlay on hover
// HTML overlay for showing feature name on mouse hover
function updateNameOverlay(pickedFeature, position) {
  if (!defined(pickedFeature) || !(pickedFeature instanceof Cesium3DTileFeature)) {
    nameOverlay.style.display = 'none';
    return;
  }

  nameOverlay.style.display = 'block';
  nameOverlay.style.bottom = `${viewer.canvas.clientHeight - position.y}px`;
  nameOverlay.style.left = `${position.x}px`;

  const name = pickedFeature.getProperty('name') || 'Unnamed Feature';
  nameOverlay.textContent = `Name: ${name}`;
}

// Function to create description for InfoBox
function createPickedFeatureDescription(pickedFeature) {
  if (!(pickedFeature instanceof Cesium3DTileFeature)) {
    return '<p>No feature selected.</p>';
  }

  return `
    <table class="cesium-infoBox-defaultTable">
      <tr><th>Name</th><td>${pickedFeature.getProperty('name') || 'N/A'}</td></tr>
      <tr><th>Height</th><td>${pickedFeature.getProperty('height') || 'N/A'}</td></tr>
    </table>
  `;
}

// Load tilesets and enable feature picking
const assetIds = [2915556];
(async function loadTilesets() {
  try {
    for (const assetId of assetIds) {
      const tileset = await Cesium3DTileset.fromIonAssetId(assetId, {
        enableCollision: true,
      });

      viewer.scene.primitives.add(tileset);
      await tileset.readyPromise;

      console.log(`Tileset ${assetId} loaded successfully.`);

      // Enable picking on the tileset
      viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedFeature = viewer.scene.pick(movement.endPosition);

        // Update overlay with feature name
        updateNameOverlay(pickedFeature, movement.endPosition);

        // Highlight the feature
        if (defined(pickedFeature) && pickedFeature instanceof Cesium3DTileFeature) {
          pickedFeature.color = Color.YELLOW; // Optional: Highlight in yellow
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedFeature = viewer.scene.pick(movement.position);

        if (defined(pickedFeature) && pickedFeature instanceof Cesium3DTileFeature) {
          viewer.selectedEntity = new Entity({
            description: createPickedFeatureDescription(pickedFeature),
          });
        } else {
          viewer.selectedEntity = undefined; // Clear InfoBox if no valid feature is clicked
        }
      }, ScreenSpaceEventType.LEFT_CLICK);

      // Optionally fly to the first tileset
      if (assetId === assetIds[0]) {
        viewer.scene.camera.flyTo({
          destination: tileset.boundingSphere.center,
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-30),
            roll: 0,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error loading tilesets:', error);
  }
})();
