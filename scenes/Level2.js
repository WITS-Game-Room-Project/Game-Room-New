import * as THREE from "three";
import { Color, MeshStandardMaterial } from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import index, { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as Ammo from "ammo.js";

//=========================== Global Variables =======================================

var changeLevelNumber;
var diamond;
var mushroom;
var tempMushroom;
//////////////////////////KIATA 
var diamondCount = 0;


//Player Movement
const playerMovement = 50;

// Physics stuff
let physicsWorld,rigidBodies = [], tmpTrans;
let moveDirection = { left: 0, right: 0, forward: 0, back: 0 }

const STATE = { DISABLE_DEACTIVATION : 4 }

let massG = 0;
let massP = 1;

setUpPhysicsWorld();

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
var tempGround;
addGround();

//Set up Player
var player;
var playerMixer; 
var tempPlayer;
addPlayer(-50,30,-50);
var tempDiamond;

//Set up Fire
var fire;
var fireMixer; 
var scale = 1.5; 
var kaboom = false;
addFire();

//Set up onEvents
setOnEvents();

//Add Ocean
var water;
addOcean();

//Set up skybox
var sun = new THREE.Vector3();
skyBox();

addCave(795, -832);

// Add House
addHouse(600,550);

//Add Minimap
let width = window.innerWidth;
let height = window.innerHeight;
let orthiMulti = 0.4;
const minimapHeight = 400;
const minimapRenderer = new THREE.WebGLRenderer({canvas: document.querySelector("#minimap"), antialias: false});
const minimapCam = new THREE.OrthographicCamera( orthiMulti* width/-2, orthiMulti* width/2, orthiMulti * height/2, orthiMulti * height/-2, 0, minimapHeight*1.2 );
// const minimapCam = new THREE.PerspectiveCamera(50, (18/25)*window.innerWidth/window.innerHeight,10,minimapHeight*1.2);
minimapCam.zoom = 0.1;
addMinimap();

// Add Fence
let arrFencePositions = [
  [650,420,Math.PI/2], [570,420,Math.PI/2] , [570,360,Math.PI/2] , [650,360,Math.PI/2] ,
  [460,560,Math.PI/3],
  [450,610,Math.PI/2],
  [460,660,-Math.PI/3],
  [500,700,-Math.PI/8],
  [550,710,Math.PI],
  [600,700,Math.PI/8],
  [650,680,Math.PI/8],
  [698,655,Math.PI/6],
  [743,620,Math.PI/4],
  [773,580,Math.PI/3],
  [800,534,Math.PI/3],
  [830,487,Math.PI/3],
  [850,437,Math.PI/2.5],
  [860,387,Math.PI/2],
  [850,342,Math.PI/-2.5],
  [833,297,Math.PI/-2.5],


  // These are for bototm part of island

  [25,900,Math.PI/2],
  [-125,900,Math.PI/2],
  [-125,800,Math.PI/2],
  [ 25,800,Math.PI/2],
  [-125,700,Math.PI/2],
  [ 25,700,Math.PI/2],
  [-125,600,Math.PI/2],
  [ 25,600,Math.PI/2],
  [-125,500,Math.PI/2],
  [25,500,Math.PI/2],

];

for (var i = 0; i < arrFencePositions.length; i++){
  addFence(arrFencePositions[i][0], arrFencePositions[i][1],arrFencePositions[i][2]);
}

// Adding trees
let test = 35
let bias = 20
let arrTreePositions = [
  [660,680],
  [743,620],
  [773,580],
  [800,534],
  [850,437],
  [850,342],
  [839,287],

  [25 - bias,900 + test], // BOTTOM HALF OF ISLAND
  [-125 - bias,900 + test],
  [-125 - bias,800 + test],
  [ 25 - bias,800 + test],
  [-125 - bias,700 + test],
  [ 25 - bias,700 + test],
  [-125 - bias,600 + test],
  [ 25 - bias,600 + test],
  [-125 - bias,500 + test],
  [25 - bias,500 + test],




]

for (var i = 0; i < arrTreePositions.length; i++){
  addTrees(arrTreePositions[i][0]+19, arrTreePositions[i][1]+15);
}


let diamondArray = [
  [750,680,0],
  [850,640,0],
  [900,560,0],
  [950,480,0],
  [950,480,0],
  [950,380,0],

  [-50,500],
  [-50,600],
  [-50,700],
  [-50,800],
  [-50,900],
  [-50,1000],


]

for (var i = 0; i < diamondArray.length; i++){
  addDiamond(diamondArray[i][0], diamondArray[i][1], diamondArray[i][2]);
}

test = 25

let mushroomArray = [
  [-50,550, true],
  [-50,650, true],
  [-50,750, true],
  [-50,850, true],
  [-50,950, true],
  [-50,1050, true],
  [-50,1050, true],
  [-360,270, true],
  [-320,370, true],
  [-280,470, true],

]

for (var i = 0; i < mushroomArray.length; i++){
  addMushroom(mushroomArray[i][0], mushroomArray[i][1], mushroomArray[i][2]);
}

let bushArray = [
  [-250,500,Math.PI/2],
  [-290,400,Math.PI/2],
  [-330,300,Math.PI/2],
  [-390,200,Math.PI/2],
  [-50,900,Math.PI/2],
  [-50,1000,Math.PI/2],
]

for (var i = 0; i < bushArray.length; i++){
  addBush(bushArray[i][0], bushArray[i][1],bushArray[i][2]);
}



addDiamond(50,225.5,0);
addDiamond(75,65,0);
addDiamond(-207,-125,0);
addDiamond(-262,-198,0);
addDiamond(-246,-295,0);
addDiamond(-356,-163,0);
addDiamond(-350,200,0);
addDiamond(-274,263,0);
addDiamond(-305,369,0);
addDiamond(50,19,0);
addDiamond(200,195,0);
addDiamond(308,205,0);
addDiamond(105,-205,0);
addDiamond(305,-205,0);
addDiamond(205,405,0);
addDiamond(270,367,0);
addDiamond(357,10,0);


addTrees(0, 100); 
addTrees2(450, 500);
addTrees(500, 500);

addDiamond(-200, -175, 0);
addTrees3(-250, -150);
addDiamond(-300, -275, 0);
addTrees2(-200, -200); 
addTrees(-250, -200);
addDiamond(-300, -175, 0);
addTrees2(-300, -175);

addTrees(150, -150);
addTrees3(160, -100);

addTrees3(650, 350);
addTrees2(500, 200);


addTrees3(200, 550);
addTrees2(150, 600); 
addTrees(-200, 400);


addDiamond(450, -200, 0);
addDiamond(450, -150, 0);
addTrees(400, -250);
addTrees2(400, -475);
addTrees(250, -500);

addTrees2(-250, 825); //left
addTrees(-300, 575); //branch things
addTrees3(-300, 625);


//near cave
addTrees(200, -550);
addDiamond(600, -575, 0);
addTrees2(200, -675);
addDiamond(100, -475, 0);
addDiamond(150, -275, 0);
addDiamond(50, -675, 0);
addDiamond(-50, -275, 0);
addTrees(50, -650);
addTrees3(100, -625);

//near cave - other side
addTrees(-450, -350);

// addTrees(-550, -200);
addTrees3(-500, -325);

//loop two

addTrees2(-900, 400);
addTrees(-650, 500);
addDiamond(-600, 425, 0);
addDiamond(-600, 475, 0);
addTrees3(-600, 350);
addDiamond(-800, 475, 0);
addTrees2(-700, 500);
AddCannon(-185,-47);

// ADDING stuff TO TOP LEFT OF WORLD

addTrees2(-600,-800)
addTrees(-600,-1000)
addTrees3(-700,-800)
addTrees(-790,-850)
addTrees(-800,-1000)
addTrees2(-400,-900)
addTrees3(-400,-700)
addTrees3(-650,-900)
addBush(-500,-900,0)
addBush(-400,-500,0)
addBush(-350,-750,0)

bias = 45

addDiamond(-600+ bias,-800)
addDiamond(-600+ bias,-1000)
addDiamond(-700+ bias,-800)
addDiamond(-790+ bias,-850)
addDiamond(-800+ bias,-1000)
addDiamond(-400+ bias,-900)
addDiamond(-400+ bias,-700)
addDiamond(-650+ bias,-900)

bias = 90

addMushroom(-600+ bias,-800,true)
addMushroom(-600+ bias,-1000,true)
addMushroom(-700+ bias,-800,true)
addMushroom(-790+ bias,-850,true)
addMushroom(-800+ bias,-1000,true)
addMushroom(-400+ bias,-900,true)
addMushroom(-400+ bias,-700,true)
addMushroom(-650+ bias,-900,true)


addTrees2(-50,-700)
addTrees3(-75,-800)
addTrees(-150,-860)
addTrees3(-200,-920)
addTrees(-150,-700)
addTrees3(-200,-780)
addBush(-260,-830,0)
addTrees2(-260,-500)
addTrees(-280,-600)
addTrees(-300,-700)
addTrees3(-170,-600)

bias = 40

addDiamond(-75 + bias,-800)
addDiamond(-200+ bias,-920)
addDiamond(-260+ bias,-830,0)
addDiamond(-280+ bias,-600)

bias = 90
addMushroom(-75 + bias,-800,true)
addMushroom(-200+ bias,-920,true)
addMushroom(-260+ bias,-830,0,true)
addMushroom(-280+ bias,-600,true)


//cannon on mapp
let BallInWorld1 = false;

let D1 = new THREE.Vector3(-187,10,-47); // the starting position of the ball
let D2 = new THREE.Vector3(-54,10,-301); //used for the directional vector of the ball
let ball;
let pos = new THREE.Vector3();

let ttl = 6, ttlCounter = 0;

//=========================== EACH FRAME =======================================

let myVar = 0;
let opac = 0;
let curtain = null;

function changeScene() {
    // Trigger animation
    myVar = setInterval(function(){
      ambientLightMain.intensity -= 0.025
      skyUniforms[ 'rayleigh' ].value -= 0.010;
      curtain = document.getElementById("render")
      opac = parseFloat(window.getComputedStyle(curtain,null).getPropertyValue("--opac"));
      opac += 0.01
      curtain.style.setProperty("--w",'100%')
      curtain.style.setProperty("--h",'100%')
      curtain.style.setProperty("--opac",opac);
    },2000)
};


//Game Loop
export const GameLoop = function(){
  requestAnimationFrame(GameLoop);
  update();

  // start of aerial view
  // SET X AND Y OF OBJECT YOU WANNA LOOK AT FROM ABOVE
  // let x = 400;
  // let z = -800;
  // // SET HEIGHT
  // let height = 750;

  // camera.position.set( x, height, z); 
  // camera.lookAt( x, 0, z); 
  // camera.up.set( 0, 1, 0 );
  // end of aerial view


  render();
}

//At Each Frame
function update(){
  delta = clockTime.getDelta();
  controls.update();


  if(opac==1){
    clearTimeout(myVar)
    //loading screen
    let loadingScreen = document.getElementById("loadingScreen")
    loadingScreen.style.setProperty("--zVal",'3')

    curtain.style.setProperty("--w",'0%')
    curtain.style.setProperty("--h",'0%')
    curtain.style.setProperty("--opac",0);

    //load level 2
    changeLevelNumber(2);
  }

  if(diamondCount>=2){
    var myDiv = document.getElementById("text");
    myDiv.innerHTML = "Proceed to the cave ...";
    myDiv.style.fontSize = "30px";
    if(player.position.x<-200 && player.position.x >-390 && player.position.z<-430 && player.position.z>-600){
      changeScene();
    }
  }else{
    var myDiv = document.getElementById("text");
    myDiv.innerHTML = "Diamond Count : " + diamondCount + "/40";
    myDiv.style.fontSize = "30px";
  }

  if (fire != undefined && kaboom){
    scale += 0.1;
    fire.scale.set(scale, scale, scale);

    if (scale > 12){
      scale = 1;
      kaboom = false;
      scene.remove(fire);
    }
  }

  // for (let i = 0; i < scene.children.length; i++){
  //   if (scene.children[i].userData){
  //     if (scene.children[i].userData.tag){
  //       if (scene.children[i].userData.tag == 'diamond'){
  //         scene.children[i].rotateZ(2 * Math.PI * delta);
  //       }
  //     }
  //   }
    
  // }

  //Play moving animation
  if (playerMixer != undefined){
    playerMixer.update(delta);  
  }

  //Make sure camera is in y axis constant
  if (camera.position.y < 10){
    camera.position.y = 10;
  }else if (camera.position > 150){
    camera.position.y = 150;
  }

  let playerPos = player.position;
  let distanceAway = 100;
  let yFactor = 3;
  camera.lookAt(new THREE.Vector3(playerPos.x,playerPos.y,playerPos.z));

  if (tempPlayer != undefined){
    if (tempPlayer.userData != null){
      if(tempPlayer.userData.physicsBody != null){
        let velocity = tempPlayer.userData.physicsBody.getLinearVelocity().length();
        
        let diffX = Math.abs(camera.position.x - playerPos.x + distanceAway);
        let diffZ = Math.abs(camera.position.z - playerPos.z + distanceAway);
        if (velocity > 0.01 || diffX > 1 || diffZ > 1){
          let cameraMoveRate = 10*delta;
          let horiSpeed = 2;
          if (camera.position.x < playerPos.x + distanceAway){
            camera.position.x += cameraMoveRate * horiSpeed;
          }
          if (camera.position.x > playerPos.x + distanceAway){
            camera.position.x -= cameraMoveRate * horiSpeed;
          }
          if (camera.position.y < playerPos.y + distanceAway*yFactor){
            camera.position.y += cameraMoveRate;
          }
          if (camera.position.y > playerPos.y + distanceAway*yFactor){
            camera.position.y -= cameraMoveRate;
          }
          if (camera.position.z < playerPos.z + distanceAway){
            camera.position.z += cameraMoveRate * horiSpeed;
          }
          if (camera.position.z > playerPos.z + distanceAway){
            camera.position.z -= cameraMoveRate * horiSpeed;
          }
        }
      }
    }
  }
  
  //Ortho update
  if (typeof player !== "undefined" && player != null && player.position != null){
    let camX = player.position.x;
    let camZ = player.position.z;

    minimapCam.position.set( camX, minimapHeight, camZ); 
  }
}


//What to Render
function render(){

  water.material.uniforms['time'].value += 1.0 / 60.0;
  ThrowBall();
  
  
  if( BallInWorld1 ){
     ttlCounter += delta;}


  //if time to live has been exceeded then delete the ball
  
   if( ttlCounter > ttl ){
    physicsWorld.removeRigidBody( ball.userData.physicsBody );
    scene.remove(ball);
   
    ttlCounter = 0;
    BallInWorld1 = false;  
  }

  movePlayer();
  updatePhysics();

  renderer.render(scene,camera);

}


//=========================== SET UP FUNCTIONS =======================================

function setUpPhysicsWorld(){

  tmpTrans = new Ammo.btTransform(); 
  let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
  overlappingPairCache = new Ammo.btDbvtBroadphase(),
  solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
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
  controls.maxDistance = 100;

  controls.maxPolarAngle = Math.PI * 2;

  // gui.add( controls, 'screenSpacePanning' );
}



function addGround(){
  
  let groundLocation = '../../assets/models/ground/ground2.glb';
  let loader = new GLTFLoader();
        
  loader.load(groundLocation, function(glb){
            
    ground = glb.scene;            
    ground.scale.set(50, 25, 50);            
    ground.position.set(0, -125, 0);     
    
    let material = new THREE.MeshBasicMaterial({color: 0x228B22});
    ground.material = material;
    ground.children[0].material = material;
    let materialSide = new THREE.MeshBasicMaterial({color: 0x654321});
    ground.children[1].material = materialSide;

    

    scene.add(ground);  
    
    
     //Ammojs Section
     tempGround = ground;
     let transform = new Ammo.btTransform();
     transform.setIdentity();
     transform.setOrigin( new Ammo.btVector3( tempGround.position.x, tempGround.position.y+132,tempGround.position.z ) );
     transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
     let motionState = new Ammo.btDefaultMotionState( transform );

     let colShape = new Ammo.btBoxShape( new Ammo.btVector3( 10000* 0.5, 1 * 0.5, 10000* 0.5 ) );
     colShape.setMargin( 0.05 );

     let localInertia = new Ammo.btVector3( 0, 0, 0 );
     colShape.calculateLocalInertia( massG, localInertia );

     let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
     let body = new Ammo.btRigidBody( rbInfo );

     body.setFriction(4);
     body.setRollingFriction(10);

     physicsWorld.addRigidBody( body );
     
          
  });

}


//=========================== HELPER - SET UP FUNCTIONS =======================================

function setOnEvents(){

  window.addEventListener("resize", onWindowResize);
  window.addEventListener( 'keydown',handleKeyDown, false );
  window.addEventListener( 'keyup', handleKeyUp,false );
  // document.addEventListener('mousemove', onMouseMove);
}

function onWindowResize() {
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


function handleKeyDown(event){
  let keyCode = event.keyCode;

  switch(keyCode){

      case 87: //W: FORWARD
          moveDirection.forward = 1
        
          break;
          
      case 83: //S: BACK
          moveDirection.back = 1
          
          break;
          
      case 65: //A: LEFT
          moveDirection.left = 1
          
          break;
          
      case 68: //D: RIGHT
          moveDirection.right = 1
          
          break;
          
  }
}


function handleKeyUp(event){
  let keyCode = event.keyCode;

  switch(keyCode){
      case 87: //FORWARD
          moveDirection.forward = 0
          break;
          
      case 83: //BACK
          moveDirection.back = 0
          break;
          
      case 65: //LEFT
          moveDirection.left = 0
          break;
          
      case 68: //RIGHT
          moveDirection.right = 0
          break;
          
  }

}



//=========================== GAME OBJECT FUNCTIONS =======================================

function addGrass(x,y,z){
  let grassLocation = '../../assets/models/grass/Grass.fbx';

  let loader = new FBXLoader();
  loader.load(grassLocation, function (fbx){
    // Three JS Section
    let grass = fbx;
    grass.scale.set(0.1,0.1,0.1);
    grass.position.set(x,y,z);

    grass.traverse( function ( child ) {

      if ( child.isMesh ) {

        child.castShadow = true;
        child.receiveShadow = true;

      }

    } );



    // let playerTexture = new THREE.TextureLoader().load( playerTextureLocation);
      
    // let material = new THREE.MeshStandardMaterial({map: playerTexture});

    // player.material = material;
    // player.children[0].material = material;
    scene.add(grass);

    // let light = new THREE.PointLight({color: 0xffffff, intensity: 1.0});
    // light.position.set(x,y,z);

    // scene.add(light);

    //Ammo JS Section
  
  });
}

function addOcean(){
  var oceanSize = 10000;
  const waterGeometry = new THREE.PlaneBufferGeometry( oceanSize, oceanSize );
  
  water = new Water( 
    waterGeometry, 
    {
    textureWidth: 512, 
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( '../assets/textures/water/waternormals.jpg',function(texture){
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  } );

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


     //Ammojs Section
     tempPlayer = player;
     let transform = new Ammo.btTransform();
     transform.setIdentity();
     transform.setOrigin( new Ammo.btVector3( tempPlayer.position.x, tempPlayer.position.y,tempPlayer.position.z ) );
     transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
     let motionState = new Ammo.btDefaultMotionState( transform );

     let colShape = new Ammo.btSphereShape( 2.5 );
     colShape.setMargin( 0.05 );

     let localInertia = new Ammo.btVector3( 0, 0, 0 );
     colShape.calculateLocalInertia( massP, localInertia );

     let rbInfo = new Ammo.btRigidBodyConstructionInfo( massP, motionState, colShape, localInertia );
     let body = new Ammo.btRigidBody( rbInfo );

     body.setFriction(4);
     body.setRollingFriction(10);

     

     body.setActivationState( STATE.DISABLE_DEACTIVATION )


     physicsWorld.addRigidBody( body );
     body.threeObject = player;
     tempPlayer.userData.physicsBody = body;
     


     player.userData.physicsBody = body;

     player.userData.tag = "player";

     rigidBodies.push(tempPlayer);
    
    // let light = new THREE.PointLight({color: 0xffffff, intensity: 1.0});
    // light.position.set(x,y,z);

    // scene.add(light);

    //Ammo JS Section
  })
}

function addDiamond(x, z, r){
  let diamondLocation = '../../assets/models/diamond/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(diamondLocation, function(gltf){

    var unreasonableScale = 2;
            
    diamond = gltf.scene.children[0];   

    diamond.scale.set(0.1,0.1,0.1);            
    diamond.position.set(x, 10, z); 
    diamond.rotation.z = r;  
    diamond.userData.tag = "diamond";     
    scene.add(diamond);  
    
    
          
    tempDiamond = diamond;
    let transform = new Ammo.btTransform();

    transform.setIdentity();

    transform.setOrigin(new Ammo.btVector3(tempDiamond.position.x, tempDiamond.position.y, tempDiamond.position.z));
    transform.setRotation(new Ammo.btQuaternion(-Math.PI/2,0,0,1));
    let motionState = new Ammo.btDefaultMotionState( transform );
    let diamondSize = new THREE.Box3().setFromObject(diamond).getSize();

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(unreasonableScale*diamondSize.x/2,unreasonableScale*diamondSize.y/2,unreasonableScale*diamondSize.z/2));
    colShape.setMargin(0.05);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( Ammo.NULL, motionState, colShape, Ammo.NULL );
    let body = new Ammo.btRigidBody( rbInfo );
    
    body.setActivationState( STATE.DISABLE_DEACTIVATION )
    physicsWorld.addRigidBody( body );

    body.threeObject = diamond;
    tempDiamond.userData.physicsBody = body;
    diamond.userData.physicsBody = body;

    diamond.userData.tag = "diamond";
       

    rigidBodies.push(tempDiamond);

  });
}


function addTrees(x, z){
  let treeLocation = '../../assets/models/trees/pineTree/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(treeLocation, function(gltf){
            
    var tree = gltf.scene.children[0];            
    tree.scale.set(0.1, 0.1, 0.1);            
    tree.position.set(x, 19, z);            
    scene.add(tree);       
    
    //Ammojs Section
    let tempTree = tree;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempTree.position.x, tempTree.position.y,tempTree.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let treeSize = new THREE.Box3().setFromObject(tree).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( treeSize.x/2, treeSize.y/2, treeSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
  });
}

function addTrees2(x, z){
  let treeLocation = '../../assets/models/trees4/flat/scene.gltf';
  let loader = new GLTFLoader();

        
  loader.load(treeLocation, function(gltf){

    var tree = gltf.scene.children[0];            
    tree.scale.set(3, 3, 3);            
    tree.position.set(x, 10, z);            
    scene.add(tree);   

    //Ammojs Section
    let tempTree = tree;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempTree.position.x, tempTree.position.y,tempTree.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let treeSize = new THREE.Box3().setFromObject(tree).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( treeSize.x/2, treeSize.y, treeSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
  });

    
}

function addTrees3(x, z){
  let treeLocation = '../../assets/models/trees5/blue/scene.gltf';
  let loader = new GLTFLoader();

        
  loader.load(treeLocation, function(gltf){

    var tree = gltf.scene.children[0];            
    tree.scale.set(35, 35, 35);            
    tree.position.set(x, 10, z);            
    scene.add(tree);   

    //Ammojs Section
    let tempTree = tree;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempTree.position.x, tempTree.position.y,tempTree.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let treeSize = new THREE.Box3().setFromObject(tree).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( treeSize.x/2, treeSize.y/2, treeSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
  });

    
}

function addMushroom(x, z, explode){
  let mushroomLocation = '../../assets/models/mushroom/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(mushroomLocation, function(gltf){

    var unreasonableScale = 1;
            
    mushroom = gltf.scene.children[0];            
    mushroom.scale.set(0.07, 0.07, 0.07);            
    mushroom.position.set(x, 8, z);            

    mushroom.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );

    scene.add(mushroom);    
    
    tempMushroom = mushroom;
    let transformMush = new Ammo.btTransform();

    transformMush.setIdentity();

    transformMush.setOrigin(new Ammo.btVector3(tempMushroom.position.x, tempMushroom.position.y, tempMushroom.position.z));
    transformMush.setRotation(new Ammo.btQuaternion(-Math.PI/2,0,0,1));
    let motionState = new Ammo.btDefaultMotionState( transformMush );
    let mushroomSize = new THREE.Box3().setFromObject(mushroom).getSize();

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(unreasonableScale*mushroomSize.x/2,unreasonableScale*mushroomSize.y/2,unreasonableScale*mushroomSize.z/2));
    colShape.setMargin(0.05);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( Ammo.NULL, motionState, colShape, Ammo.NULL );
    let body = new Ammo.btRigidBody( rbInfo );
    
    body.setActivationState( STATE.DISABLE_DEACTIVATION )
    physicsWorld.addRigidBody( body );

    body.threeObject = mushroom;
    tempMushroom.userData.physicsBody = body;
    mushroom.userData.physicsBody = body;

    if (explode){ mushroom.userData.tag = "mushroom"; }
       

    rigidBodies.push(tempMushroom);
          
  });
}


function addFence(x, z, r){
  let fenceLocation = '../../assets/models/fence/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(fenceLocation, function(gltf){
            
    var fence = gltf.scene.children[0];            
    fence.scale.set(0.38,0.25,0.25);            
    fence.position.set(x, 10, z); 
    fence.rotation.z = r           
    scene.add(gltf.scene);     
    
    //Ammojs Section
    let tempFence = fence;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempFence.position.x, tempFence.position.y,tempFence.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let fenceSize = new THREE.Box3().setFromObject(fence).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( fenceSize.x/2, fenceSize.y/2, fenceSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
  });
}

function addBush(x, z, r){
  let bushLocation = '../../assets/models/bush/bush.glb';
  let loader = new GLTFLoader();
        
  loader.load(bushLocation, function(gltf){
  let scaleTemp = 10;
  
    var bush = gltf.scene.children[0];
    bush.scale.set(scaleTemp,scaleTemp,scaleTemp);            
    bush.position.set(x, 10, z);
    bush.rotation.y = r;            


    bush.material = new THREE.MeshStandardMaterial({color: 0x6428a6});
    scene.add(gltf.scene);       
          
    //Ammojs Section
    let tempBush = bush;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempBush.position.x, tempBush.position.y,tempBush.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let bushSize = new THREE.Box3().setFromObject(bush).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( bushSize.x/2, bushSize.y/2, bushSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
  });
}

function addHouse(x, z){
  let houseLocation = '../../assets/models/low_poly_house/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(houseLocation, function(gltf){
            
    var house = gltf.scene.children[0];            
    house.scale.set(1.6, 1.6, 1.6);            
    house.position.set(x, 10, z); 
    house.rotateZ(-4*Math.PI/8)    
       
    scene.add(gltf.scene);     
    
    //Ammojs Section
    let tempHouse = house;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempHouse.position.x, tempHouse.position.y,tempHouse.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0, 1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let houseSize = new THREE.Box3().setFromObject(house).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( houseSize.x/2, houseSize.y/2, houseSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
  });
}

function addCave(x, z){

  let caveLocation = '../../assets/models/cave/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(caveLocation, function(gltf){
            
    var cave = gltf.scene;            
    cave.scale.set(0.3, 0.3, 0.3);            
    cave.position.set(x, 10, z);
    cave.rotation.y = Math.PI;    
 
    scene.add(cave);
    
    
    //Ammojs Section
    let tempCave = cave;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( tempCave.position.x, tempCave.position.y,tempCave.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let caveSize = new THREE.Box3().setFromObject(cave).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( caveSize.x/2, caveSize.y/2, caveSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
    
  });
}



//=========================== PHYSICS =======================================

function movePlayer(){

  let moveX =  moveDirection.right - moveDirection.left;
  let moveZ =  moveDirection.back - moveDirection.forward;

  let moveY =  0; 

  if( moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
  resultantImpulse.op_mul(playerMovement);

  let physicsBody = tempPlayer.userData.physicsBody;
  physicsBody.setLinearVelocity( resultantImpulse );

}

function updatePhysics(){
  // Step world
  physicsWorld.stepSimulation( delta, 10 );

  // Update rigid bodies
  for ( let i = 0; i < rigidBodies.length; i++ ) {
      let objThree = rigidBodies[ i ];
      let objAmmo = objThree.userData.physicsBody;
      let ms = objAmmo.getMotionState();
      if ( ms ) {

          ms.getWorldTransform( tmpTrans );
          let p = tmpTrans.getOrigin();
          let q = tmpTrans.getRotation();
          objThree.position.set( p.x(), p.y(), p.z() );
          objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

      }
  }

  tempPlayer.rotation.set(0,0,0);
  detectCollision();
}

function detectCollision(){

	let dispatcher = physicsWorld.getDispatcher();
	let numManifolds = dispatcher.getNumManifolds();

	for ( let i = 0; i < numManifolds; i ++ ) {

		let contactManifold = dispatcher.getManifoldByIndexInternal( i );

    let rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
    let rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );
    let threeObject0 = rb0.threeObject;
    let threeObject1 = rb1.threeObject;
    if ( ! threeObject0 && ! threeObject1 ) continue;
    let userData0 = threeObject0 ? threeObject0.userData : null;
    let userData1 = threeObject1 ? threeObject1.userData : null;
    let tag0 = userData0 ? userData0.tag : "none";
    let tag1 = userData1 ? userData1.tag : "none";

    if (tag0 == "player" && tag1 == "diamond"){
      
      scene.remove(threeObject1);
      
      diamondCount++;
      physicsWorld.removeRigidBody(rb1);
    }else if (tag0 == "diamond" && tag1 == "player"){
      
    
      scene.remove(threeObject0);
      diamondCount++;
      physicsWorld.removeRigidBody(rb0);
    }

    var pos;

    if (tag0 == "player" && tag1 == "mushroom"){  

      pos = threeObject1.position;      
      fire.position.set(pos.x, pos.y, pos.z);
      scene.add(fire);
      health.value -= 0.1;
      kaboom = true;
    }
    else if (tag0 == "mushroom" && tag1 == "player"){
            
      pos = threeObject1.position;      
      fire.position.set(pos.x, pos.y, pos.z);
      scene.add(fire);
      health.value -= 0.1;
      kaboom = true;
    }

    if (tag0 == "player" && tag1 == "flower"){  

      pos = threeObject1.position;      
      fire.position.set(pos.x, pos.y, pos.z);
      scene.add(fire);
      health.value -= 0.1;
      kaboom = true;
    }
    else if (tag0 == "flower" && tag1 == "player"){
            
      pos = threeObject1.position;      
      fire.position.set(pos.x, pos.y, pos.z);
      scene.add(fire);
      health.value -= 0.1;
      kaboom = true;
    }
	
    else if(tag0 == "ball" && tag1 == "player"){
      scene.remove(threeObject0);
      physicsWorld.removeRigidBody(rb0);
     //negate health here
    }
    else if(tag0 == "player" && tag1 == "ball"){}
	   scene.remove(threeObject1);
     physicsWorld.removeRigidBody(rb1);
    //negate health here
	}

}
function ThrowBall(){
  if(BallInWorld1){
    return;
  }
   // Create a ball 
   var dir = new THREE.Vector3();
   dir.subVectors( D1, D2 ).normalize();
  
   
   pos.copy( dir );
   pos.add( D1 );
  
   ball = createBall(pos,D1);
   
   //shoot out the ball
   let ballBody = ball.userData.physicsBody;
  
   pos.copy( dir );
   pos.multiplyScalar( 70 );
   ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
  
   BallInWorld1 = true;
   arrBalls.push(ball);

   AddCannon();
  
  }


function createBall(){
                
  let radius = 14;
  let quat = {x: 0, y: 0, z: 0, w: 1};
  let mass = 1;

  //threeJS Section
  let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: "#000000"}));

  ball.position.set(pos.x, pos.y, pos.z);
  
  ball.castShadow = true;
  ball.receiveShadow = true;
  scene.add(ball);


  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin( new Ammo.btVector3( D1.x, D1.y, D1.z ) );
  transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
  let motionState = new Ammo.btDefaultMotionState( transform );

  let colShape = new Ammo.btSphereShape( radius );
  colShape.setMargin( 0.05 );

  let localInertia = new Ammo.btVector3( 0, 0, 0 );
  colShape.calculateLocalInertia( mass, localInertia );

  let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
  let body = new Ammo.btRigidBody( rbInfo );

  body.setFriction(4);
  body.setRollingFriction(10);

  body.setActivationState( STATE.DISABLE_DEACTIVATION )


  physicsWorld.addRigidBody( body );
  rigidBodies.push(ball);
  
  ball.userData.physicsBody = body;
  ball.userData.tag = "ball";
  
  return ball;
}

function addFire(){

  let fireLocation = '../../assets/models/sun-animated-test/source/boom.glb';
  let fireTextureLocation = '../../assets/models/sun-animated-test/textures/FLAME.jpg';


  let loaders = new GLTFLoader();

  loaders.load(fireLocation, function ( gltf ) {

    fire = gltf.scene.children[0];

    fire.scale.set(0, 0, 0);

    let fireTexture = new THREE.TextureLoader().load(fireTextureLocation);
      
    let fireMaterial = new THREE.MeshStandardMaterial({map: fireTexture});

    fire.material = fireMaterial;

} );
}
//ask for help on loading a model
function AddCannon(x,z){
  let CLocation = '../../assets/models/stylized_cannon/scene.gltf';
  let loader = new GLTFLoader();

        
  loader.load(CLocation, function(gltf){

    var cannon = gltf.scene.children[0];            
    cannon.scale.set(3, 3, 3);            
    cannon.position.set(x, 10, z);            
    scene.add(cannon);   

    //Ammojs Section
    let Tempcannon = cannon;
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( Tempcannon.position.x, Tempcannon.position.y,Tempcannon.position.z ) );
    transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let CannonSize = new THREE.Box3().setFromObject(cannon).getSize();

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( CannonSize.x/2, CannonSize.y, CannonSize.z/2) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( massG, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody( body );
          
  });
 

}

function addMinimap(){
  let camX = 0;
  let camZ = 0;

  if (typeof player !== "undefined" && player != null && player.position != null){
    camX = player.position.x;
    camZ = player.position.z;
  }
  minimapCam.position.set( camX, minimapHeight, camZ); 
  minimapCam.lookAt( 0, 0, 0); 
  minimapCam.up.set( 0, 1, 0 );
}
