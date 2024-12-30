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
viewer.scene.globe.show = true;
viewer.scene.skyBox.show = false;
viewer.scene.skyAtmosphere.show = false;

// const tileset = viewer.scene.primitives.add(
//   await Cesium3DTileset.fromIonAssetId(2951670),
// );

// Create the tileset, and set its model matrix to move it
// to a certain position on the globe
// const tileset = viewer.scene.primitives.add(
//   await Cesium3DTileset.fromUrl(
//     "http://172.31.11.155:8080/tileset.json",
//     {
//       debugShowBoundingVolume: false,
//     }
//   )
// );

// tileset.modelMatrix = Transforms.eastNorthUpToFixedFrame(
//   Cartesian3.fromDegrees(-75.152325, 39.94704, 0.0)
// );

// viewer.scene.globe.cullWithChildren = true;
// console.log(tileset.featureIdLabel); // Verify the feature ID label
// console.log(tileset.metadata);

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

// Create a container for the toggle buttons in the top-left corner
// const toggleContainer = document.createElement('div');
// toggleContainer.style.position = 'absolute';
// toggleContainer.style.top = '10px';
// toggleContainer.style.left = '10px';
// toggleContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
// toggleContainer.style.padding = '10px';
// toggleContainer.style.borderRadius = '5px';
// toggleContainer.style.color = 'white';
// toggleContainer.style.zIndex = '1000';
// toggleContainer.style.fontFamily = 'Arial, sans-serif';
// document.body.appendChild(toggleContainer);

// Add a title to the toggle container
// const toggleTitle = document.createElement('div');
// toggleTitle.textContent = 'Toggle Layers';
// toggleTitle.style.fontWeight = 'bold';
// toggleTitle.style.marginBottom = '10px';
// toggleContainer.appendChild(toggleTitle);

// Access the toolbar container
const toolbar = document.getElementById("toolbar");

// The Architectural Design is comprised of multiple tilesets
const tilesetData = [
  { title: "Architecture", assetId: 2951277, visible: true },
  { title: "Facade", assetId: 2951864, visible: true },
  { title: "Structural", assetId: 2951909, visible: false },
  { title: "Electrical", assetId: 295199, visible: true },
  { title: "HVAC", assetId: 2887126, visible: true },
  { title: "Plumbing", assetId: 2887127, visible: true },
  { title: "Site", assetId: 2951670, visible: true },
];

// Map to hold references to the tilesets
const tilesetMap = new Map();

// Load each tileset and create a corresponding toggle button
for (const { title, assetId, visible } of tilesetData) {
  try {
    const tileset = await Cesium3DTileset.fromIonAssetId(assetId);
    viewer.scene.primitives.add(tileset);
    tileset.show = visible;
    tilesetMap.set(title, tileset);

    // Create a label with a checkbox
    const label = document.createElement("label");
    label.textContent = title;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = visible;
    checkbox.addEventListener("change", () => {
      tileset.show = checkbox.checked;
    });

    label.prepend(checkbox); // Add the checkbox before the title
    toolbar.appendChild(label);
  } catch (error) {
    console.log(`Error loading tileset (${title}): ${error}`);
  }
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

// const offset = new HeadingPitchRange(
//   Math.toRadians(-45.0),
//   Math.toRadians(-45.0),
//   80.0
// );
// viewer.zoomTo(tileset, offset);

// Find and zoom to the "Architecture" tileset
const architectureTileset = tilesetMap.get("Site"); // Get the tileset by title

if (architectureTileset) {
  const offset = new HeadingPitchRange(
    Math.toRadians(-45.0), // Heading
    Math.toRadians(-45.0), // Pitch
    80.0 // Range
  );
  viewer.zoomTo(architectureTileset, offset);
} else {
  console.log("Architecture tileset not found.");
}
