import * as THREE from "three";
import { Color, MeshStandardMaterial } from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants"
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { Water } from "three/examples/jsm/objects/Water"
import { Sky } from 'three/examples/jsm/objects/Sky.js';


//=========================== Global Variables =======================================

//Set up Clock
var clockTime = new THREE.Clock(true);
var delta;

//Set up GUI
const gui = new GUI();

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
var ambientLightMain = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLightMain);

//Set up Ground
var ground;
addGround();

//Set up Player
var player;
var playerMixer;
addPlayer(-25,10,-25);



//Set up onEvents
setOnEvents();

//Add Ocean
var water;
var mirrorMesh;
addOcean();

//Set up skybox
var sun = new THREE.Vector3();
skyBox();
//Add mushroom house
addHouse(400, 300);




//Set up trees
let arrTreePositions = [
  [0, 0], [50, 50], [200, 200], [525, 50], [25, 500], [300, 150]
];

for (var i = 0; i < arrTreePositions.length; i++){
  addTrees(arrTreePositions[i][0], [i][1]);
}




//=========================== EACH FRAME =======================================

//Game Loop
export const GameLoop = function(){
  requestAnimationFrame(GameLoop);

  update();
  render();
}

//At Each Frame
function update(){
  delta = clockTime.getDelta();
  controls.update();

  //Play moving animation
  if (playerMixer != undefined){
    playerMixer.update(delta);  
  }

  //Make sure camera is in y axis constant
  if (camera.position.y < 60){
    camera.position.y = 60;
  }else if (camera.position > 150){
    camera.position.y = 150;
  }
}

//What to Render
function render(){
  var time = performance.now() * 0.001;
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

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
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = true;

  controls.minDistance = 10;
  controls.maxDistance = 800;

  controls.maxPolarAngle = Math.PI * 2;

  // gui.add( controls, 'screenSpacePanning' );
}

function addGround(){
  
  let groundLocation = '../../assets/models/ground/ground.glb';
  let loader = new GLTFLoader();
        
  loader.load(groundLocation, function(glb){
            
    var ground = glb.scene;            
    ground.scale.set(100, 100, 100);            
    ground.position.set(0, -70, 0);     
    
    let material = new THREE.MeshBasicMaterial({color: 0x228B22});
    ground.material = material;
    ground.children[0].material = material;
    let materialSide = new THREE.MeshBasicMaterial({color: 0x654321});
    ground.children[1].material = materialSide;

    scene.add(glb.scene);       
          
  });

}


//=========================== HELPER - SET UP FUNCTIONS =======================================

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

function addOcean(){
  var oceanSize = 10000;
  const waterGeometry = new THREE.PlaneBufferGeometry( oceanSize, oceanSize );
  
  water = new Water( 
    waterGeometry, 
    {
    textureWidth: 512, 
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( '../assets/textures/water/waternormals.jpg', function ( texture ) {

      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    } ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  } );

  addMushroom(-340,820);
  addMushroom(-350,860);
  addMushroom(-368,910);
  addBush(100,100);


  water.rotation.x = - Math.PI / 2;

  scene.add( water );




}

function skyBox(){

  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const skyUniforms = sky.material.uniforms;

  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 0.3; //Horizon Intesnity in General
  skyUniforms[ 'mieCoefficient' ].value = 0.00005; //Horizon Intensity at Point
  skyUniforms[ 'mieDirectionalG' ].value = 1; //Intensity of Sun

  const parameters = {
    elevation: 300,
    azimuth: 50000
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( -45 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );
    //sun.set.z = 0;

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    scene.environment = pmremGenerator.fromScene( sky ).texture;

  }

  updateSun();

  const folderSky = gui.addFolder( 'Sky' );
  folderSky.add( parameters, 'elevation', 0, 180, 0.1 ).onChange( updateSun );
  folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
  folderSky.open();

  const waterUniforms = water.material.uniforms;

  const folderWater = gui.addFolder( 'Water' );
  folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
  folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
  folderWater.open();

//   const skyTexture = "../../assets/textures/sky/cloudySky.jpg";

//   let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  
//   let frontTexture = new THREE.TextureLoader().load(skyTexture);
//   //let backTexture = new THREE.TextureLoader().load(skyTexture);
//   //let skyTexture = new THREE.TextureLoader().load(skyTexture);
//  // let floorTexture = new THREE.TextureLoader().load( 'arid2_dn.jpg');
//  // let rightTexture = new THREE.TextureLoader().load(skyTexture);
//  // let leftTexture = new THREE.TextureLoader().load(skyTexture);
//  /* 
//  var materialArray = [
//   new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // RIGHT 
//   new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // LEFT 
//   new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // TOP 
//   new THREE.MeshBasicMaterial({color: 0x00ff00, side:THREE.DoubleSide}), // BOTTOM 
//   new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // FRONT 
//   new THREE.MeshBasicMaterial({map:frontTexture, side:THREE.DoubleSide}), // BACK
// ]*/
  
//   //Setting the Textures to Box
//   var materialArray = [
//     new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // RIGHT 
//     new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // LEFT 
//     new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // TOP 
//     new THREE.MeshBasicMaterial({color: 0x006400, side:THREE.DoubleSide}), // BOTTOM 
//     new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // FRONT 
//     new THREE.MeshBasicMaterial({color: 0x87ceeb, side:THREE.DoubleSide}), // BACK
//   ]
    
//   let skybox = new THREE.Mesh( skyboxGeo, materialArray );
//   scene.add( skybox );

}



function addPlayer(x,y,z){
  let playerLocation = '../../assets/models/player/slime.fbx';
  let playerTextureLocation = '../../assets/models/player/textures/slime.jpeg';

  let loader = new FBXLoader();

  loader.load(playerLocation, function (fbx){
    // Three JS Section
    let scaleplay = 1.5 ;
    player = fbx;
    console.log(player);
    player.scale.set(scaleplay* 0.05,scaleplay * 0.05,scaleplay * 0.05);
    player.position.set(x,y,z);

    player.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;
        child.receiveShadow = true;

      }

    } );

    let animations = fbx.animations;
    playerMixer = new THREE.AnimationMixer( player );
    let action = playerMixer.clipAction( animations[ 0 ] );
    action.play();



    let playerTexture = new THREE.TextureLoader().load( playerTextureLocation);
      
    let material = new THREE.MeshStandardMaterial({map: playerTexture});

    player.material = material;
    player.children[0].material = material;
    scene.add(player);

    // let light = new THREE.PointLight({color: 0xffffff, intensity: 1.0});
    // light.position.set(x,y,z);

    // scene.add(light);

    //Ammo JS Section
  })


  // let playerLocation = '../../assets/models/player/slime.glb';
  // let loader = new GLTFLoader();

  // loader.load(playerLocation, function(gltf){
  //   //Three JS Section
  //   gltf.scene.
  //   player = gltf.scene.children[0];
  //   console.log(player);
  //   player.scale.set(3,3,3);
  //   player.position.set(x,y,z);
  //   scene.add(player);

  //   // let light = new THREE.PointLight({color: 0xffffff, intensity: 1.0});
  //   // light.position.set(x,y,z);

  //   // scene.add(light);

  //   //Ammo JS Section
  // });
}

function addTrees(x, z){
  let treeLocation = '../../assets/models/trees/pineTree/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(treeLocation, function(gltf){
            
    var tree = gltf.scene.children[0];            
    tree.scale.set(0.1, 0.1, 0.1);            
    tree.position.set(x, 25, z);            
    scene.add(gltf.scene);       
          
  });
}

function addMushroom(x, z){
  let mushroomLocation = '../../assets/models/mushroom/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(mushroomLocation, function(gltf){
            
    var mushroom = gltf.scene.children[0];            
    mushroom.scale.set(0.05, 0.05, 0.05);            
    mushroom.position.set(x, 25, z);            
    scene.add(gltf.scene);       
          
  });
}

function addBush(x, z){
  let bushLocation = '../../assets/models/bush/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(bushLocation, function(gltf){
            
    var bush = gltf.scene.children[0];            
    bush.scale.set(10,10,10);            
    bush.position.set(x, 25, z);            
    scene.add(gltf.scene);       
          
  });
}

function addHouse(x, z){
  let houseLocation = '../../assets/models/low_poly_house/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(houseLocation, function(gltf){
            
    var house = gltf.scene.children[0];            
    house.scale.set(1.6, 1.6, 1.6);            
    house.position.set(x, 25, z);            
    scene.add(gltf.scene);       
          
  });
}


//=========================== MOVEMENT =======================================
