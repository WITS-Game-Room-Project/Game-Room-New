import * as THREE from "three";
import { Color, MeshStandardMaterial } from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants"
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { Water } from "three/examples/jsm/objects/Water"
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import * as Ammo from "ammo.js"

//=========================== Global Variables =======================================

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
addPlayer(-50,20,-50);



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
// let arrTreePositions = [
//   [0, 0], [50, 50], [200, 200], [525, 50], [25, 500], [300, 150]
// ];

//trees


let arrTreePositions = [
  [0, 0], [50, 1000]
];

for (var i = 0; i < arrTreePositions.length; i++){
  addTrees(arrTreePositions[i][0], [i][1]);
}

//Add mushrooms

let arrMushroomPositions = [
  [-345,818], [-363,865], [-380,914], [-395,798], [-431,898], [-415,850]
];

for (var i = 0; i < arrMushroomPositions.length; i++){
  addMushroom(arrMushroomPositions[i][0], arrMushroomPositions[i][1]);
}

//Add bushes

let arrBushPositions = [
  [-420,700,0], [125,300,Math.PI/6],[125,205,-Math.PI/6]
]

for (var i = 0; i < arrBushPositions.length; i++){
  addBush(arrBushPositions[i][0], arrBushPositions[i][1],arrBushPositions[i][2]);
}

//Add fences

let arrFencePositions = [
  [250,350,0], [250,250,0], [199,240,-Math.PI/8], [199,340,-Math.PI/8], [155,218,-Math.PI/6], [155,317,-Math.PI/6]
];

for (var i = 0; i < arrFencePositions.length; i++){
  addFence(arrFencePositions[i][0], arrFencePositions[i][1],arrFencePositions[i][2]);
}


var axesHelper = new THREE.AxesHelper(100);
scene.add( axesHelper );

addTrees(0, 100); //origin - house ish - near blob
addTrees2(450, 500);
//addBush(450,500);
addTrees(500, 500);

//three near house
addTrees3(-250, -150);
addTrees2(-200, -200); 
addTrees(-250, -200);
addTrees2(-300, -175);
//addBush(-200,-200);

//across path
addTrees(150, -150);
addTrees3(160, -100);

//behind house
addTrees3(650, 350);
addTrees2(500, 200);
//addBush(500,-50);
//addBush(550,0);

//border near house
addTrees3(200, 550);
addTrees2(150, 600); 
addTrees(-200, 400);

//loop one
//mouth
addTrees(400, -250);
addTrees2(400, -475);
addTrees(250, -500);
//inside
addTrees(550, -600);
addTrees2(550, -675);
//addBush(550,-600);
addTrees3(550, -700);
addTrees(600, -750);
addTrees(750, -700);
addTrees2(800, -600);
addTrees(850, -500);
addTrees2(900, -400);
addTrees2(875, -350);
addTrees3(850, -450);
addTrees(900, -250);
addTrees2(850, -200);
addTrees(725, -250);
addTrees(700, -300);

//arrow bit
addTrees2(-400, 950); //arrow tip
addTrees(-500, 800); //right
addTrees2(-250, 825); //left
addTrees(-300, 575); //branch things
addTrees3(-300, 625);


//near cave
addTrees(200, -550);
addTrees2(200, -675);
addTrees(50, -650);
addTrees3(100, -625);

//near cave - other side
addTrees(-450, -350);
addTrees2(-600, 50);
addTrees(-550, -200);
addTrees3(-500, -325);

//loop two
addTrees(-750, 50);
addTrees3(-850, 50);
addTrees2(-875, 150);
addTrees(-900, 250);
addTrees(-900, 300);
addTrees2(-900, 400);
addTrees(-650, 500);
addTrees3(-600, 350);
addTrees2(-700, 500);

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
  if (camera.position.y < 10){
    camera.position.y = 10;
  }else if (camera.position > 150){
    camera.position.y = 150;
  }
}

//What to Render
function render(){

  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

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

  controls.minDistance = 1;
  controls.maxDistance = 800;

  controls.maxPolarAngle = Math.PI * 2;

  // gui.add( controls, 'screenSpacePanning' );
}

function addGround(){
  
  let groundLocation = '../../assets/models/ground/ground.glb';
  let loader = new GLTFLoader();
        
  loader.load(groundLocation, function(glb){
            
    ground = glb.scene;            
    ground.scale.set(100, 100, 100);            
    ground.position.set(0, -70, 0);     
    
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
     transform.setOrigin( new Ammo.btVector3( tempGround.position.x, tempGround.position.y +77,tempGround.position.z ) );
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
    waterNormals: new THREE.TextureLoader().load( '../assets/textures/water/waternormals.jpg', function ( texture ) {

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
     
     tempPlayer.userData.physicsBody = body;
     rigidBodies.push(tempPlayer);

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
    tree.position.set(x, 19, z);            
    scene.add(gltf.scene);       
          
  });
}

function addTrees2(x, z){
  let treeLocation = '../../assets/models/trees4/flat/scene.gltf';
  let loader = new GLTFLoader();

        
  loader.load(treeLocation, function(gltf){

    var tree = gltf.scene.children[0];            
    tree.scale.set(3, 3, 3);            
    tree.position.set(x, 10, z);            
    scene.add(gltf.scene);   
    
    // let material = new THREE.MeshBasicMaterial({color: 0xFFFF00});
    // tree.material = material;
    // tree.children[0].material = material;
    // let materialSide = new THREE.MeshBasicMaterial({color: 0xFFFF00});
    // tree.children[1].material = materialSide;
          
  });

    
}

function addTrees3(x, z){
  let treeLocation = '../../assets/models/trees5/blue/scene.gltf';
  let loader = new GLTFLoader();

        
  loader.load(treeLocation, function(gltf){

    var tree = gltf.scene.children[0];            
    tree.scale.set(35, 35, 35);            
    tree.position.set(x, 10, z);            
    scene.add(gltf.scene);   
    
    // let material = new THREE.MeshBasicMaterial({color: 0xFFFF00});
    // tree.material = material;
    // tree.children[0].material = material;
    // let materialSide = new THREE.MeshBasicMaterial({color: 0xFFFF00});
    // tree.children[1].material = materialSide;
          
  });

    
}


function addMushroom(x, z){
  let mushroomLocation = '../../assets/models/mushroom/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(mushroomLocation, function(gltf){
            
    var mushroom = gltf.scene.children[0];            
    mushroom.scale.set(0.05, 0.05, 0.05);            
    mushroom.position.set(x, 8, z);            
    scene.add(gltf.scene);       
          
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
          
  });
}

function addHouse(x, z){
  let houseLocation = '../../assets/models/low_poly_house/scene.gltf';
  let loader = new GLTFLoader();
        
  loader.load(houseLocation, function(gltf){
            
    var house = gltf.scene.children[0];            
    house.scale.set(1.6, 1.6, 1.6);            
    house.position.set(x, 10, z);            
    scene.add(gltf.scene);       
          
  });
}



//=========================== PHYSICS =======================================

function movePlayer(){
  let scalingFactor = 20;

  let moveX =  moveDirection.right - moveDirection.left;
  let moveZ =  moveDirection.back - moveDirection.forward;

  let moveY =  0; 

  if( moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
  resultantImpulse.op_mul(scalingFactor);

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
  console.log(tempPlayer.position);
}