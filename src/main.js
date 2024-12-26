// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Color, PostProcessStageLibrary, Terrain, Transforms, Matrix4, defined, UniformType, HeadingPitchRange, Cesium3DTileFeature, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, CustomShader, LightingModel, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math, Ion, JulianDate, ClippingPolygon, ClippingPolygonCollection, Entity } from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the viewer
const viewer = new Viewer('cesiumContainer', {
  infoBox: true, // Enable the infoBox
  selectionIndicator: true, // Enable selection indicator
  shadows: false,
});

// Enable global imagery and terrain
viewer.scene.globe.show = false;
viewer.scene.skyBox.show = false;
viewer.scene.skyAtmosphere.show = false;

// const tileset = viewer.scene.primitives.add(
//   await Cesium3DTileset.fromIonAssetId(2951277),
// );

// Create the tileset, and set its model matrix to move it
// to a certain position on the globe
const tileset = viewer.scene.primitives.add(
  await Cesium3DTileset.fromUrl(
    "http://172.31.11.155:8080/tileset.json",
    {
      debugShowBoundingVolume: false,
    }
  )
);

tileset.modelMatrix = Transforms.eastNorthUpToFixedFrame(
  Cartesian3.fromDegrees(-75.152325, 39.94704, 0.0)
);

viewer.scene.globe.cullWithChildren = true;
console.log(tileset.featureIdLabel); // Verify the feature ID label
console.log(tileset.metadata);

// Add ambient occlusion if supported
if (PostProcessStageLibrary.isAmbientOcclusionSupported(viewer.scene)) {
  const ambientOcclusion = viewer.scene.postProcessStages.ambientOcclusion;
  ambientOcclusion.enabled = true;
  ambientOcclusion.uniforms.intensity = 2.0;
  ambientOcclusion.uniforms.bias = 0.1;
  ambientOcclusion.uniforms.lengthCap = 0.5;
  ambientOcclusion.uniforms.directionCount = 16;
  ambientOcclusion.uniforms.stepCount = 32;
}

// Highlighting and metadata picking logic
const selectedEntity = new Entity(); // Entity for infoBox display
viewer.selectedEntity = undefined; // Initialize selected entity

const selected = { feature: undefined, originalColor: new Color() };
const highlighted = { feature: undefined, originalColor: new Color() };

viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
  // Undo previous highlight
  if (defined(highlighted.feature)) {
    highlighted.feature.color = highlighted.originalColor;
    highlighted.feature = undefined;
  }
  // Pick a new feature
  const pickedFeature = viewer.scene.pick(movement.endPosition);
  if (!defined(pickedFeature) || !(pickedFeature instanceof Cesium3DTileFeature)) {
    return;
  }

  // Highlight the feature
  if (pickedFeature !== selected.feature) {
    highlighted.feature = pickedFeature;
    Color.clone(pickedFeature.color, highlighted.originalColor);
    pickedFeature.color = Color.YELLOW;
  }
}, ScreenSpaceEventType.MOUSE_MOVE);

viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  // Undo previous selection
  if (defined(selected.feature)) {
    selected.feature.color = selected.originalColor;
    selected.feature = undefined;
  }

  // Pick a new feature
  const pickedFeature = viewer.scene.pick(movement.position);
  if (!defined(pickedFeature) || !(pickedFeature instanceof Cesium3DTileFeature)) {
    return;
  }

  selected.feature = pickedFeature;
  if (pickedFeature === highlighted.feature) {
    Color.clone(highlighted.originalColor, selected.originalColor);
    highlighted.feature = undefined;
  } else {
    Color.clone(pickedFeature.color, selected.originalColor);
  }

  pickedFeature.color = Color.LIME;

  // Set feature infoBox description
  const propertyIds = pickedFeature.getPropertyIds();
  if (propertyIds && propertyIds.length > 0) {
    let description = `<table class="cesium-infoBox-defaultTable"><tbody>`;
    propertyIds.forEach((propertyId) => {
      const value = pickedFeature.getProperty(propertyId);
      description += `<tr><th>${propertyId}</th><td>${value}</td></tr>`;
    });
    description += `</tbody></table>`;
    selectedEntity.name = 'Feature Details';
    selectedEntity.description = description;
    viewer.selectedEntity = selectedEntity; // Display in infoBox
  } else {
    viewer.selectedEntity = undefined; // Clear the infoBox if no metadata
  }
}, ScreenSpaceEventType.LEFT_CLICK);

const offset = new HeadingPitchRange(
  Math.toRadians(-45.0),
  Math.toRadians(-45.0),
  80.0
);
viewer.zoomTo(tileset, offset);