import * as THREE from "three";
import { Color } from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//=========================== Global Variables =======================================

//Set up Clock
var clockTime = new THREE.Clock(true);
var delta;

//Set up Scene
const scene = new THREE.Scene();

//Set up Camera
const camera = new THREE.PerspectiveCamera(cameraFOV, window.innerWidth / window.innerHeight, cameraNear, cameraFar);
setUpCamera();

// //Set up World
// var world;
// setUpWorld();

//Set up Renderer
var renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#canvas")});
setUpRenderer();

//Set up Controls
var controls;
setUpControls();

//Set up Main Ambient Lighting
var ambientLightMain = new THREE.AmbientLight(0xfcb46a, 0.4);
scene.add(ambientLightMain);

//Set up Ground
//var ground;
//addGround();

//Set up Player
var player;
setUpPlayer();

//Set up skybox
skyBox();

//Set up onEvents
// setOnEvents();






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
  camera.position.set(-900,-200,-900);
  scene.add(camera);
}

function setUpRenderer(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
}

function setUpControls(){
  controls = new OrbitControls(camera, renderer.domElement);
  // var controls = new PointerLockControls(camera, renderer.domElement);
}

function setUpPlayer(){
  //Set up player
  player = null;
}

function addGround(){
  let geometry = new THREE.BoxGeometry(100,1,100);
  let material = new THREE.MeshBasicMaterial({color: 0xFF3647, wireframe: true});
  // material.side = THREE.BackSide;
  ground = new THREE.Mesh(geometry,material);

  scene.add(ground);
}


//=========================== HELPE - SET UP FUNCTIONS =======================================

function setOnEvents(){

  window.addEventListener("resize", onWindowResize);
//   document.addEventListener( 'keydown', onKeyDown );
//     document.addEventListener( 'keyup', onKeyUp );
  // document.addEventListener('mousemove', onMouseMove);
}

function onWindowResize() {
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


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

function skyBox(){

  const skyTexture = "../../assets/textures/sky/cloudySky.jpg";

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  
  let frontTexture = new THREE.TextureLoader().load(skyTexture);
  //let backTexture = new THREE.TextureLoader().load(skyTexture);
  //let skyTexture = new THREE.TextureLoader().load(skyTexture);
 // let floorTexture = new THREE.TextureLoader().load( 'arid2_dn.jpg');
 // let rightTexture = new THREE.TextureLoader().load(skyTexture);
 // let leftTexture = new THREE.TextureLoader().load(skyTexture);
 /* 
 var materialArray = [
  new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // RIGHT 
  new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // LEFT 
  new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // TOP 
  new THREE.MeshBasicMaterial({color: 0x00ff00, side:THREE.DoubleSide}), // BOTTOM 
  new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // FRONT 
  new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // BACK
]*/
  
  //Setting the Textures to Box
  var materialArray = [
    new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // RIGHT 
    new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // LEFT 
    new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // TOP 
    new THREE.MeshBasicMaterial({color: 0x006400, side:THREE.DoubleSide}), // BOTTOM 
    new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // FRONT 
    new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // BACK
  ]
    
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
  scene.add( skybox );

}


//=========================== MOVEMENT =======================================
