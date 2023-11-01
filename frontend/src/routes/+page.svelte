<script>
  import { onMount } from 'svelte';

  let videoElement;
  let canvasElement;
  let canvasCtx;
  let camera;
  let isCameraConnected = false;

  onMount(() => {
      canvasElement = document.createElement('canvas');
      videoElement.parentNode.insertBefore(canvasElement, videoElement);
      canvasCtx = canvasElement.getContext('2d');
      canvasElement.width = videoElement.offsetWidth;
      canvasElement.height = videoElement.offsetHeight;

      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);

      camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({image: videoElement});
        },
      });
  });

  function connectCamera() {
      camera.start();
      isCameraConnected = true;
      videoElement.style.visibility = "hidden";
  }

  function disconnectCamera() {
      if (videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
      isCameraConnected = false;
      videoElement.style.visibility = "hidden";
  }

  function toggleCamera() {
      if (isCameraConnected) {
          disconnectCamera();
      } else {
          connectCamera();
      }
  }

  function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
          drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
          drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
        }
      }
      canvasCtx.restore();
  }

</script>

<div class="flex flex-col h-screen">
  <div class="text-center bg-gray-800 text-white py-4 text-2xl font-bold">
    VTuber Face Tracking
  </div>
  <button on:click={toggleCamera} class="p-4 text-lg font-bold">
    {#if isCameraConnected} 
      Disconnect Camera
    {:else} 
      Connect Camera 
    {/if}
  </button>  
  <div class="flex flex-grow"> 
    <div class="w-1/2 bg-gray-100 p-4 flex">
      <video bind:this={videoElement} autoplay class="w-full h-full object-cover"></video>
    </div>
    <div class="w-1/2 bg-gray-200 p-4 flex items-center justify-center">
      <iframe src="/WebGL/index.html" frameborder="0" class="w-full h-full object-cover"></iframe>
    </div>
  </div>
</div>



