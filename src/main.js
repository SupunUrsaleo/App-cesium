// Import Cesium CSS
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { openDB } from 'idb';

// Import Cesium modules
import {
  Viewer,
  createWorldTerrainAsync,
  Cartesian3,
  Cartesian2,
  Math,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
  Entity,
  Cesium3DTileset,
  Ion,
  defined,
  Color,
  Cesium3DTileFeature,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin,
  Cartographic,
  SceneTransforms,
  Matrix4,
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
  const rotateRate = Math.toRadians(1.0); // Angle to rotate per key press

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

// Array of asset IDs to load
const assetIds = [2915556]; // Replace with your actual asset IDs

(async function loadTilesets() {
  try {
    for (const assetId of assetIds) {
      const tileset = await Cesium3DTileset.fromIonAssetId(assetId, {
        enableCollision: true, // Optional property
      });

      viewer.scene.primitives.add(tileset);

      await tileset.readyPromise;

      console.log(`Tileset ${assetId} loaded successfully.`);

      // Optionally fly to the first tileset
      if (assetId === assetIds[0]) {
        viewer.scene.camera.flyTo({
          destination: tileset.boundingSphere.center,
          orientation: {
            heading: Math.toRadians(0),
            pitch: Math.toRadians(-30),
            roll: 0,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error loading tilesets:', error);
  }
})();

// Reference to the waypoints overlay container
const waypointsOverlay = document.getElementById('waypointsOverlay');

// // Array of waypoints
// const waypoints = [
//   {
//     id: 'waypoint1',
//     name: 'Waypoint 1',
//     position: Cartesian3.fromDegrees(1.7525466444, 12.3094027847, 300), // Longitude, Latitude, Height
//   },
//   {
//     id: 'waypoint2',
//     name: 'Waypoint 2',
//     position: Cartesian3.fromDegrees(1.7525414098, 12.3096597222, 300), // Longitude, Latitude, Height
//   },
//   {
//     id: 'waypoint3',
//     name: 'Waypoint 3',
//     position: Cartesian3.fromDegrees(1.7512540625, 12.3097457051, 300), // Longitude, Latitude, Height
//   },
// ];

// Function to load waypoints from localStorage
function loadWaypoints() {
  const storedWaypoints = localStorage.getItem('waypoints');
  if (storedWaypoints) {
    const parsedWaypoints = JSON.parse(storedWaypoints);
    parsedWaypoints.forEach((waypoint) => {
      waypoint.position = Cartesian3.fromDegrees(
        waypoint.position.longitude,
        waypoint.position.latitude,
        waypoint.position.height
      );
    });
    return parsedWaypoints;
  }
  return [];
}



// Load waypoints from localStorage
const waypoints = loadWaypoints();

// Add waypoints directly as Cesium entities
function addWaypoints() {
  waypoints.forEach((waypoint) => {
    if (!waypoint.position || !(waypoint.position instanceof Cartesian3)) {
      console.error(`Invalid position for waypoint ${waypoint.id}:`, waypoint.position);
      return; // Skip invalid waypoints
    }
  
    viewer.entities.add({
      id: waypoint.id,
      name: waypoint.name,
      position: waypoint.position,
      billboard: {
        image: 'delete.png', // Use the PNG icon
        width: 32, // Optional: Scale the width
        height: 32, // Optional: Scale the height
        verticalOrigin: VerticalOrigin.BOTTOM, // Align the bottom of the icon with the position
      },
      label: {
        text: waypoint.name,
        font: '14pt sans-serif',
        style: LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -25),
      },
    });
  });  
}

// Function to save waypoints to localStorage
function saveWaypointsToLocalStorage() {
  const simplifiedWaypoints = waypoints.map((waypoint) => {
    const cartographic = Cartographic.fromCartesian(waypoint.position);
    return {
      id: waypoint.id,
      name: waypoint.name,
      position: {
        longitude: Math.toDegrees(cartographic.longitude),
        latitude: Math.toDegrees(cartographic.latitude),
        height: cartographic.height,
      },
      orientation: waypoint.orientation,
      screenshot: waypoint.screenshot, // Save the screenshot
    };
  });
  localStorage.setItem('waypoints', JSON.stringify(simplifiedWaypoints));
}



// Click handler to navigate to waypoints
function addWaypointClickHandler() {
  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (defined(pickedObject) && defined(pickedObject.id)) {
      const waypoint = waypoints.find((wp) => wp.id === pickedObject.id.id);
      if (waypoint && waypoint.position) {
        const cartographic = Cartographic.fromCartesian(waypoint.position);
        const height = cartographic.height || 300;
  
        viewer.camera.flyTo({
          destination: Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            height
          ),
          orientation: {
            heading: waypoint.orientation.heading,
            pitch: waypoint.orientation.pitch,
            roll: waypoint.orientation.roll,
          },
          duration: 0,
        });
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);
  
}

// Add Save Waypoint Button functionality
const saveWaypointButton = document.getElementById('saveWaypointButton');

// List to store saved waypoints dynamically
// const waypoints = [];

// Function to save current camera position as a waypoint
saveWaypointButton.addEventListener('click', () => {
  const camera = viewer.scene.camera;
  const cartographic = Cartographic.fromCartesian(camera.position);

  const latitude = Math.toDegrees(cartographic.latitude);
  const longitude = Math.toDegrees(cartographic.longitude);
  const height = cartographic.height;

  const heading = camera.heading;
  const pitch = camera.pitch;
  const roll = camera.roll;

  const waypointId = `waypoint${waypoints.length + 1}`;

  // Ensure the scene renders and capture the screenshot
  let screenshot = null;
  viewer.scene.postRender.addEventListener(function captureScreenshot() {
    // Capture the canvas after the scene is rendered
    screenshot = viewer.scene.canvas.toDataURL('image/jpeg', 0.5);
    viewer.scene.postRender.removeEventListener(captureScreenshot); // Remove the listener after capture
  });

  // Wait a short time to ensure the frame renders
  setTimeout(() => {
    if (!screenshot) {
      console.error('Failed to capture screenshot.');
      return;
    }

    const newWaypoint = {
      id: waypointId,
      name: `Waypoint ${waypoints.length + 1}`,
      position: Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: { heading, pitch, roll },
      screenshot, // Save the captured screenshot
    };

    waypoints.push(newWaypoint);

    viewer.entities.add({
      id: newWaypoint.id,
      name: newWaypoint.name,
      position: newWaypoint.position,
      billboard: {
        image: 'delete.png',
        width: 32,
        height: 32,
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
      label: {
        text: newWaypoint.name,
        font: '14pt sans-serif',
        style: LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -25),
      },
    });

    // Save waypoints to localStorage
    saveWaypointsToLocalStorage();

    console.log(
      `Waypoint saved: ${newWaypoint.name} at [${latitude}, ${longitude}, ${height}] with orientation: heading=${heading}, pitch=${pitch}, roll=${roll}`
    );
  }, 200); // Adjust delay if necessary
});




// Get references to the buttons and the waypoint list container
const viewWaypointsButton = document.getElementById('viewWaypointsButton');
const waypointsList = document.getElementById('waypointsList');
const waypointsUl = document.getElementById('waypointsUl');
const closeWaypointListButton = document.getElementById('closeWaypointListButton');

// Show the list of waypoints when the "View Waypoints" button is clicked
viewWaypointsButton.addEventListener('click', () => {
  waypointsUl.innerHTML = ''; // Clear the list before populating

  if (waypoints.length === 0) {
    const noWaypointsItem = document.createElement('li');
    noWaypointsItem.textContent = 'No waypoints saved.';
    waypointsUl.appendChild(noWaypointsItem);
  } else {
    waypoints.forEach((waypoint, index) => {
      const waypointItem = document.createElement('li');
      waypointItem.style.cursor = 'pointer';
      waypointItem.style.padding = '10px';
      waypointItem.style.borderBottom = '1px solid white';
      waypointItem.style.display = 'flex';
      waypointItem.style.alignItems = 'center';

      // Add the thumbnail image
      const thumbnail = document.createElement('img');
      thumbnail.src = waypoint.screenshot;
      thumbnail.alt = `Thumbnail of ${waypoint.name}`;
      thumbnail.style.width = '50px';
      thumbnail.style.height = '50px';
      thumbnail.style.marginRight = '10px';
      thumbnail.style.borderRadius = '5px';

      // Add the waypoint name
      const nameSpan = document.createElement('span');
      nameSpan.textContent = `${index + 1}. ${waypoint.name}`;

      // Add click listener to fly to the waypoint
      waypointItem.addEventListener('click', () => {
        flyToWaypoint(waypoint);
      });

      waypointItem.appendChild(thumbnail);
      waypointItem.appendChild(nameSpan);
      waypointsUl.appendChild(waypointItem);
    });
  }

  waypointsList.style.display = 'block'; // Show the list
});


// Close the list of waypoints
closeWaypointListButton.addEventListener('click', () => {
  waypointsList.style.display = 'none'; // Hide the list
});

function flyToWaypoint(waypoint) {
  const cartographic = Cartographic.fromCartesian(waypoint.position);

  const destination = Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    cartographic.height
  );

  viewer.camera.flyTo({
    destination,
    orientation: {
      heading: waypoint.orientation.heading,
      pitch: waypoint.orientation.pitch,
      roll: waypoint.orientation.roll,
    },
    duration: 2, // Smooth animation
  });

  // Optionally close the waypoint list after flying to a waypoint
  waypointsList.style.display = 'none';
}


// Initialize waypoints and interaction
addWaypoints();
addWaypointClickHandler();



// Add position showing feature
function addPositionShowingFeature() {
  // MOUSE_MOVE event for hover effect to show latitude and longitude in HTML overlay
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    const cartesian = viewer.scene.pickPosition(movement.endPosition);
    const overlay = document.getElementById('coordinatesOverlay');
    const coordinatesText = document.getElementById('coordinatesText');

    if (cartesian) {
      const cartographic = Cartographic.fromCartesian(cartesian);
      const longitude = Math.toDegrees(cartographic.longitude).toFixed(10);
      const latitude = Math.toDegrees(cartographic.latitude).toFixed(10);
      // const height = Math.toDegrees(cartographic.height).toFixed(10)

      // coordinatesText.innerText = `Lat: ${latitude}°\nLon: ${longitude}°\nHeight: ${height}`;
      coordinatesText.innerText = `Lat: ${latitude}°\nLon: ${longitude}°`;

      // Update the overlay position near the mouse
      overlay.style.left = `${movement.endPosition.x + 10}px`;
      overlay.style.top = `${movement.endPosition.y + 10}px`;
      overlay.style.display = 'block';  // Show the overlay
    } else {
      overlay.style.display = 'none';  // Hide overlay if no position is found
    }

  }, ScreenSpaceEventType.MOUSE_MOVE);
}

// Call the function to add the feature
// addPositionShowingFeature();
