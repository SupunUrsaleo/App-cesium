// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium modules
import { Viewer, Terrain, Transforms, Matrix4, Cartesian3, createWorldTerrainAsync, IonImageryProvider, Cesium3DTileset, Math as CesiumMath, Ion } from 'cesium';

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
viewer.scene.globe.show = false;
viewer.scene.skyBox.show = true;
viewer.scene.skyAtmosphere.show = true;

viewer.camera.setView({
  destination: Cartesian3.fromRadians(
    -1.3193669086512454,
    0.698810888305128,
    220,
  ),
  orientation: {
    heading: -1.3,
    pitch: -0.6,
    roll: 0,
  },
  // endTransform: Matrix4.IDENTITY,
});

// Add base imagery if needed
// viewer.imageryLayers.addImageryProvider(new IonImageryProvider({ assetId: 2 }));
// viewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);

(async function() {
  try {
    const assetId = 2749165;
    const tileset = await Cesium3DTileset.fromIonAssetId(assetId, {
      enableCollision: true,
    });
    viewer.scene.primitives.add(tileset);

    // const center = tileset.boundingSphere.center;
    // viewer.scene.camera.lookAtTransform(Transforms.eastNorthUpToFixedFrame(center));

    await tileset.readyPromise;

    // Adjust camera to show tileset and some horizon
    // viewer.scene.camera.flyTo({
    //   destination: tileset.boundingSphere.center,
    //   orientation: {
    //     heading: CesiumMath.toRadians(0),
    //     pitch: CesiumMath.toRadians(-30),
    //     roll: 0
    //   }
    // });
  } catch (error) {
    console.error('Error loading tileset from Cesium ion:', error);
  }
})();
