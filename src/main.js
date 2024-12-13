// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Terrain, Transforms, Matrix4, defined, UniformType, Cesium3DTileFeature, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, CustomShader, LightingModel, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math as CesiumMath, Ion } from 'cesium';

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

// const customShader = new CustomShader({
//   lightingModel: LightingModel.PBR, // Use PBR for realistic materials or UNLIT for simple shading
//   fragmentShaderText: `
//     void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
//       material.diffuse = vec3(1.0, 0.5, 0.0); // Orange diffuse color
//       material.specular = vec3(0.8); // Reflective highlights
//       material.roughness = 0.2; // Smooth surface
//     }
//   `,
// });

// const basicShader = new CustomShader({
//   fragmentShaderText: `
//     void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
//       material.diffuse = vec3(1.0, 0.0, 0.0); // Red color
//     }
//   `,
// });

const globalShader = new CustomShader({
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      material.diffuse = vec3(0.0, 0.5, 1.0); // Apply blue color
      material.emissive = vec3(0.2, 0.2, 0.2); // Add a subtle glow effect
      material.alpha = 0.8; // Slightly translucent
    }
  `,
});






// Array of asset IDs to load
// const assetIds = [2915556]; // Replace with your actual asset IDs

(async function loadTilesets() {
  try {
      const tileset = await Cesium3DTileset.fromUrl('http://172.31.11.155:8080/tileset.json');
      viewer.scene.primitives.add(tileset);
      
      await tileset.readyPromise;
      
      console.log(`Tilesetloaded successfully.`);
      // Apply the shader to the tileset
      tileset.customShader = globalShader;
      console.log(tileset.featureIdLabel); // Verify the feature ID label
      console.log(tileset.metadata); // Verify tileset metadata
    
        viewer.scene.camera.flyTo({
          destination: tileset.boundingSphere.center,
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-30),
            roll: 0,
          },
        });
 
  } catch (error) {
    console.error('Error loading tilesets:', error);
  }
})();

// const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
// handler.setInputAction(function (movement) {
//   const pickedObject = viewer.scene.pick(movement.position);

//   if (defined(pickedObject) && pickedObject instanceof Cesium3DTileFeature) {
//     // Retrieve a property from the picked feature
//     const selectedComponent = pickedObject.getProperty("component");

//     console.log("Selected Component:", selectedComponent);

//     // Update the shader's uniform with the property value
//     propertyShader.setUniform("u_selectedComponent", selectedComponent);
//   } else {
//     // Reset the uniform if no feature is selected
//     propertyShader.setUniform("u_selectedComponent", -1);
//   }
// }, ScreenSpaceEventType.LEFT_CLICK);




