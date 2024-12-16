// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Terrain, Transforms, Matrix4, defined, UniformType, HeadingPitchRange, Cesium3DTileFeature, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, CustomShader, LightingModel, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math, Ion } from 'cesium';

// Set the base URL for Cesium’s static assets
window.CESIUM_BASE_URL = './Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize the viewer with terrain
const viewer = new Viewer("cesiumContainer");

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
// Create an HTML element that will serve as the
// tooltip that displays the metadata information
function createTooltip() {
  const tooltip = document.createElement("div");
  viewer.container.appendChild(tooltip);

  // Set tooltip styles
  tooltip.style.backgroundColor = "black";
  tooltip.style.color = "white"; // Make text visible
  tooltip.style.position = "absolute";
  tooltip.style.left = "0";
  tooltip.style.top = "0";
  tooltip.style.padding = "8px"; // Reduce padding for better readability
  tooltip.style.borderRadius = "4px"; // Add rounded corners
  tooltip.style.fontSize = "14px"; // Set readable font size
  tooltip.style.lineHeight = "1.5"; // Adjust line height for better spacing
  tooltip.style.pointerEvents = "none"; // Ensure it doesn't block interaction
  tooltip.style.whiteSpace = "pre-line"; // Preserve line breaks
  tooltip.style.zIndex = "1000"; // Ensure it appears on top of other elements
  tooltip.style.display = "none"; // Hide by default

  return tooltip;
}

const tooltip = createTooltip();

// Show the given HTML content in the tooltip
// at the given screen position
function showTooltip(screenX, screenY, htmlContent) {
  tooltip.style.display = "block";
  tooltip.style.left = `${screenX}px`;
  tooltip.style.top = `${screenY}px`;
  tooltip.innerHTML = htmlContent;
}

// Create an HTML string that contains information
// about the given metadata, under the given title
function createMetadataHtml(title, metadata) {
  if (!defined(metadata)) {
    return `(No ${title})<br>`;
  }
  const propertyKeys = metadata.getPropertyIds();
  if (!defined(propertyKeys)) {
    return `(No properties for ${title})<br>`;
  }
  let html = `<b>${title}:</b><br>`;
  for (let i = 0; i < propertyKeys.length; i++) {
    const propertyKey = propertyKeys[i];
    const propertyValue = metadata.getProperty(propertyKey);
    html += `&nbsp;&nbsp;${propertyKey} : ${propertyValue}<br>`;
  }
  return html;
}

// Install the handler that will check the element that is
// under the mouse cursor when the mouse is moved, and
// add any metadata that it contains to the label.
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (movement) {
  let tooltipText = "";
  const picked = viewer.scene.pick(movement.endPosition);

  const tilesetMetadata = picked?.content?.tileset?.metadata;
  tooltipText += createMetadataHtml("Tileset metadata", tilesetMetadata);

  const tileMetadata = picked?.content?.tile?.metadata;
  tooltipText += createMetadataHtml("Tile metadata", tileMetadata);

  const groupMetadata = picked?.content?.group?.metadata;
  tooltipText += createMetadataHtml("Group metadata", groupMetadata);

  const contentMetadata = picked?.content?.metadata;
  tooltipText += createMetadataHtml("Content metadata", contentMetadata);

  const screenX = movement.endPosition.x;
  const screenY = movement.endPosition.y;
  showTooltip(screenX, screenY, tooltipText);
}, ScreenSpaceEventType.MOUSE_MOVE);

// Zoom to the tileset, with a small offset so that it
// is fully visible
const offset = new HeadingPitchRange(
  Math.toRadians(-45.0),
  Math.toRadians(-45.0),
  80.0
);
viewer.zoomTo(tileset, offset);



