import * as THREE from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants"


//=========================== Global Variables =======================================

//Set up Clock
var clockTime = new THREE.Clock(true);
var delta;

//Set up Scene
var scene = new THREE.Scene();

//Set up Camera
var camera;
setUpCamera();

//Set up World
var world;
setUpWorld();

//Set up Renderer
var renderer;
setUpRenderer();

//Set up Controls
var controls;
setUpControls();

//Set up Player
var player;
setUpPlayer();


//Set up onEvents
// setOnEvents();


//Set up Main Ambient Lighting
var ambientLightMain = new THREE.AmbientLight(0xfcb46a, 0.4);
scene.add(ambientLightMain);



//=========================== EACH FRAME =======================================

//Game Loop
export const GameLoop = function(){
  requestAnimationFrame(GameLoop);

  update();
  render();
}

//At Each Frame
function update(){

}

//What to Render
function render(){
  renderer.render(scene,camera);
}


//=========================== SET UP FUNCTIONS =======================================

function setUpWorld(){
  // var world = new CANNON.World();
  // world.gravity.set(0,0,0);
  // world.broadphase = new CANNON.NaiveBroadphase();
}

function setUpCamera(){
  camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, cameraNear, cameraFar);
  camera.position.z = 3;
}

function setUpRenderer(){
  renderer =  new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement);
}

function setUpControls(){
  controls = null;
  // var controls = new PointerLockControls(camera, renderer.domElement);
}

function setUpPlayer(){
  //Set up player
  player = null;
}

// function setOnEvents(){
//   const onKeyDown = (event)=>{
//     onKeyBoolean(true, event);
//   }
  
//   const onKeyUp = (event)=>{
//       onKeyBoolean(false, event);
//   }

//   window.addEventListener("resize", onWindowResize);
//   document.addEventListener( 'keydown', onKeyDown );
//     document.addEventListener( 'keyup', onKeyUp );
//   document.addEventListener('mousemove', onMouseMove);
//   // document.addEventListener('pointerlockchange', onMouseMove, false);
// }

// function onKeyBoolean (isKeyDown, event ) {
//   let code = event.code;

//   if (code == "ArrowUp" || code == "KeyW"){
//     moveForward = isKeyDown;
//   }

//   if (code == "ArrowLeft" || code == "KeyA"){
//     moveRight = isKeyDown;
//   }

//   if (code == "ArrowDown" || code == "KeyS"){
//     moveBackward = isKeyDown;
//   }

//   if (code == "ArrowRight" || code == "KeyD"){
//     moveLeft = isKeyDown;
//   }
// }



//=========================== GAME OBJECT FUNCTIONS =======================================



//=========================== MOVEMENT =======================================
