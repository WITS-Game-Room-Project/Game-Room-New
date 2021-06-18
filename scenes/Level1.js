import * as THREE from "three";
import { CanvasTexture, Color, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { cameraFOV, cameraNear, cameraFar } from "../utils/constants";
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import index, { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import coord from '../classes/coord.class';
import * as Ammo from "ammo.js";
//import {levelTwo as Level2Loop} from "../main.js";
// import changeLevelNumber from "../main.js";

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
var renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#canvas"), antialias: true});
setUpRenderer();

//Set up Controls
var controls;
setUpControls();




//Set up Main Ambient Lighting
var ambientLightMain = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLightMain);

//Set up Light Post Lighting
var lightPostLight = new THREE.SpotLight(0xffa200,25,200,  Math.PI * 0.5);
lightPostLight.position.set(350,150,300);
scene.add(lightPostLight);

//Set up Ground
var ground;
var tempGround;
addGround();

//Set up Player
var player;
var playerMixer; 
var tempPlayer;
addPlayer(-50,20,-50);

var tempDiamond;

//Set up Fire
var fire;
var fireMixer; 
var scale = 1.5; 
var kaboom = false;
addFire();

//Add Enemy
var enemy;
const enemyStepsThreshold = 150;
var enemyMoveDiff = 5;
var enemySteps = enemyStepsThreshold + 1;
var enemyCurrPathIdx = 0;
var enemyPathList = [new coord(100,100), new coord(407, -150)]
const enemyBurnDistance = 10;
addEnemy(100,25,100);



//Set up onEvents
setOnEvents();

//Add Ocean
var water;
var mirrorMesh;
addOcean();

//Set up skybox
// Sky
var boxHelper;
let sky = new Sky();
let skyUniforms = sky.material.uniforms;
var sun = new THREE.Vector3();
var directLight;
skyBox();
//Add mushroom house
addHouse(400, 300);

//Add props
var flower;
var tempFlower;
var health = document.getElementById("health")
health.value -= 0; 
var purpleFlower = '../../assets/models/flowers/purple_flower/scene.gltf';
var orangeFlower = '../../assets/models/flowers/orange_flower/scene.gltf';
addProps();

//=========================== EACH FRAME =======================================

//Game Loop
export function changeLevelFunc(changeLevelNumbert){
  changeLevelNumber = changeLevelNumbert
}

export const GameLoop = function(){
  requestAnimationFrame(GameLoop);

  update();
  render();
}

//At Each Frame
function update(){
  delta = clockTime.getDelta();
  controls.update();

  //Del
  if (typeof boxHelper !== "undefined" && boxHelper != null){
    boxHelper.update();
  }

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

  if(diamondCount>=40){
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

  // if (typeof player !== "undefined" && player != null && typeof player.position !== "undefined"){
    
  // }

  if (tempPlayer != undefined){
    if (tempPlayer.userData != null){
      if(tempPlayer.userData.physicsBody != null){
        let playerPos = player.position;
        let yFactor = 3;
        let distanceAway = 500;
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

  //Move enemy up and down its path
  if (typeof enemy !== "undefined" && enemy != null && typeof enemy.position !== "undefined"){
    // console.log(enemy.position);
    let currX = enemy.position.x;
    let currZ = enemy.position.z;

    let pathX = enemyPathList[enemyCurrPathIdx].x;
    let pathZ = enemyPathList[enemyCurrPathIdx].z;

    // console.log(enemySteps)
    //Change direction
    let reachedEnd = (Math.abs(parseInt(currX) - parseInt(pathX)) < enemyMoveDiff&& Math.abs(parseInt(currZ) - parseInt(pathZ)) < enemyMoveDiff);

    if ( reachedEnd && (enemySteps > enemyStepsThreshold)){
      if (enemyCurrPathIdx == 0){
        enemyCurrPathIdx++;
      }else{
        enemyCurrPathIdx--;
      }

      pathX = enemyPathList[enemyCurrPathIdx].x;
      pathZ = enemyPathList[enemyCurrPathIdx].z;

      enemySteps = 0;
    }    

    //Move player to path
    let enemyMovementSpeed = 5;

    let diffX = currX - pathX;
    let diffZ = currZ - pathZ;

    let normLength = Math.sqrt(diffX * diffX + diffZ * diffZ);

    diffX /= normLength;
    diffZ /= normLength;

    diffX *= enemyMovementSpeed;
    diffZ *= enemyMovementSpeed;

    enemy.translateX(-diffX * delta);
    enemy.translateZ(-diffZ * delta);

    enemySteps++;
    
    if (typeof camera  !== "undefined"){
      // console.log(enemy.position)
      // enemy.lookAt(camera.position);
    }
  }
  
  
  if (typeof enemy !== "undefined" && enemy != null){
    if (typeof player !== "undefined" && player != null){
      let playerPos = player.position;
      let enemyPos = enemy.position;

      let distanceBetw = Math.sqrt((playerPos.x - enemyPos.x)^2 + (playerPos.y - enemyPos.y)^2 + (playerPos.z - enemyPos.z)^2)
      
      if (distanceBetw < enemyBurnDistance){
        if (distanceBetw < 2){
          health.value -= 10000;
        }
        health.value -= 10 *delta ;
      }
    }
  }

  // camera.position.set(playerPos.x + 180, playerPos.y + 180, playerPos.z + 180);
  // camera.position.y = playerPos.y + 220;
}


//What to Render
function render(){

  water.material.uniforms['time'].value += 1.0 / 60.0;
  
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

  document.body.appendChild(renderer.domElement);
}

function setUpControls(){
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = true;

  controls.minDistance = 10;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI * 2;

  // gui.add( controls, 'screenSpacePanning' );
}

function on() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("healthbar").style.display = "block";

}


function addGround(){
  
  let groundLocation = '../../assets/models/ground/ground.glb';
  let loader = new GLTFLoader();

  let material;
        
  loader.load(groundLocation, function(glb){
            
    ground = glb.scene;            
    ground.scale.set(100, 100, 100);            
    ground.position.set(0, -70, 0);     
    
    let material = new THREE.MeshStandardMaterial({color: 0x228B22});
    ground.material = material;
    ground.children[0].material = material;
    let materialSide = new THREE.MeshStandardMaterial({color: 0x654321});
    ground.children[1].material = materialSide;

    ground.traverse( function ( child ) {

      if ( child.isMesh ) {

        // child.castShadow = true;
        child.receiveShadow = true;
      }

    } );

    materialSide = new THREE.MeshBasicMaterial({color: 0x654321});
    ground.children[1].material = materialSide;    

    scene.add(ground);  
  
     //Ammojs Section
    tempGround = ground;
     let transform = new Ammo.btTransform();
     transform.setIdentity();
     transform.setOrigin( new Ammo.btVector3( tempGround.position.x, tempGround.position.y +77 ,tempGround.position.z ) );
     transform.setRotation( new Ammo.btQuaternion( 0, 0, 0,1 ) );
     let motionState = new Ammo.btDefaultMotionState( transform );

     let colShape = new Ammo.btBoxShape(new Ammo.btVector3(10000 *0.5,1*0.5,10000*0.5));
     colShape.setMargin( 0.05 );

     let localInertia = new Ammo.btVector3( 0, 0, 0 );
     colShape.calculateLocalInertia( massG, localInertia );

     let rbInfo = new Ammo.btRigidBodyConstructionInfo( massG, motionState, colShape, localInertia );
     let body = new Ammo.btRigidBody( rbInfo );

     body.setFriction(4);
     body.setRollingFriction(10);

     physicsWorld.addRigidBody( body );
     
          
  });

  let geometry = new THREE.BoxGeometry(10000,10000,500);
  let maty = new THREE.MeshStandardMaterial({color: 0x0000ff});

  let planetset = new THREE.Mesh(geometry, maty);
  planetset.position.set(0,15,0);
  planetset.rotateX(Math.PI/2);
  planetset.receiveShadow = true;
  //scene.add(planetset);

}


function setSunLight(){
  
  directLight  = new THREE.DirectionalLight( 0xffffff, 2 );
  let directLightPos = sun.multiplyScalar(500);
  directLight.castShadow = true;

  directLight.position.set(directLightPos.x,directLightPos.y,directLightPos.z);
  directLight.lookAt(new THREE.Vector3(0,20,0)); //default; light shining from top
  directLight.shadow.camera.left = -1000;
  directLight.shadow.camera.right = 1000;
  directLight.shadow.camera.top = 500;
  directLight.shadow.camera.bottom = -500;

  //Set up shadow properties for the light
  directLight.shadow.mapSize.width = 2000; // default
  directLight.shadow.mapSize.height = 1000; // default
  directLight.shadow.camera.near = 10; // default
  directLight.shadow.camera.far = 1500; // default

  scene.add(directLight);

  // boxHelper = new THREE.BoxHelper(directLight,0x00ffff);
  // scene.add(boxHelper);

  // let lightBoxgeo = new THREE.BoxGeometry(1000,1000,1000)
  // let lightBoxMat = new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: true});

  // let lightBox = new THREE.Mesh(lightBoxgeo, lightBoxMat);
  // lightBox.position.set(directLightPos.x,directLightPos.y,directLightPos.z);
  // console.log(lightBox.position);
  // scene.add(lightBox);

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




function skyBox(){

  sky.scale.setScalar( 10000 );
  scene.add( sky );


  skyUniforms[ 'turbidity' ].value = 10;
  skyUniforms[ 'rayleigh' ].value = 0.2; //Horizon Intesnity in General
  skyUniforms[ 'mieCoefficient' ].value = 0.00005; //Horizon Intensity at Point
  skyUniforms[ 'mieDirectionalG' ].value = 1; //Intensity of Sun

  const parameters = {
    elevation: 25,
    azimuth: 90
  };

  const pmremGenerator = new THREE.PMREMGenerator( renderer );


  function updateSun() {
    
    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );
    //sun.set.z = 0;

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    scene.environment = pmremGenerator.fromScene( sky ).texture;

  }

  
  updateSun();

  // Set directional light
  //Create a DirectionalLight and turn on shadows for the light
  setSunLight();

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
    player = fbx;
    player.scale.set(0.05, 0.05, 0.05);
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

    var unreasonableScale = 1;
            
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
    
    tree.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );

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
    
    tree.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );

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
    
    tree.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );


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

function addFlowers(x, z, explode, flowerLocation, flowerScale){
    
  let loader = new GLTFLoader();
        
  loader.load(flowerLocation, function(gltf){

    var unreasonableScale = 1;
            
    flower = gltf.scene.children[0];            
    flower.scale.set(flowerScale, flowerScale, flowerScale);            
    flower.position.set(x, 8, z); 

    flower.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );
               
    scene.add(flower);    
    
    tempFlower = flower;
    let transformFlow = new Ammo.btTransform();

    transformFlow.setIdentity();

    transformFlow.setOrigin(new Ammo.btVector3(tempFlower.position.x, tempFlower.position.y, tempFlower.position.z));
    transformFlow.setRotation(new Ammo.btQuaternion(-Math.PI/2,0,0,1));
    let motionState = new Ammo.btDefaultMotionState( transformFlow );
    let flowerSize = new THREE.Box3().setFromObject(flower).getSize();

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(unreasonableScale*flowerSize.x/2,unreasonableScale*flowerSize.y/2,unreasonableScale*flowerSize.z/2));
    colShape.setMargin(0.05);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( Ammo.NULL, motionState, colShape, Ammo.NULL );
    let body = new Ammo.btRigidBody( rbInfo );
    
    body.setActivationState( STATE.DISABLE_DEACTIVATION )
    physicsWorld.addRigidBody( body );

    body.threeObject = flower;
    tempFlower.userData.physicsBody = body;
    flower.userData.physicsBody = body;

    if (explode){ flower.userData.tag = "flower"; }
       

    rigidBodies.push(tempFlower);
          
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

    fence.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );

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

    bush.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );

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
    
    house.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );


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

    CanvasTexture.traverse( function ( child ) {

      // console.log(child.castShadow);

      if ( child.isMesh ) {
        
        child.castShadow = true;
        child.receiveShadow = true;
        // console.log(child.castShadow);
      }

    } );
 
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

function addProps(){
  //Add Diamonds
//body of island
addDiamond(125,250.5,0);
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
on();


addTrees(0, 100); //origin - house ish - near blob
addTrees2(450, 500);
//addBush(450,500);
addTrees(500, 500);

//three near house
addDiamond(-200, -175, 0);
addTrees3(-250, -150);
addDiamond(-300, -275, 0);
addTrees2(-200, -200); 
addTrees(-250, -200);
addDiamond(-300, -175, 0);
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
addDiamond(450, -200, 0);
addDiamond(450, -150, 0);
addTrees(400, -250);
addTrees2(400, -475);
addTrees(250, -500);
//inside
addTrees(550, -600);
addDiamond(550, -625, 0);
addDiamond(550, -650, 0);
addTrees2(550, -675);
//addBush(550,-600);
addDiamond(550, -725, 0);
addDiamond(575, -750, 0);
addTrees3(550, -700);

addDiamond(620, -750, 0);
addDiamond(660, -750, 0);
addDiamond(700, -740, 0);
addTrees(600, -750);

addDiamond(775, -700, 0);
addDiamond(830, -600, 0);
addDiamond(880, -550, 0);
addDiamond(950, -350, 0);
addDiamond(900, -200, 0);
addDiamond(900, -150, 0);
addDiamond(850, -150, 0);
addDiamond(800, -175, 0);
addDiamond(800, -175, 0);
addTrees(750, -700);
addTrees2(800, -600);
addTrees(850, -500);
addDiamond(800, -500, 0);
addTrees2(900, -400);
addTrees2(875, -350);
addTrees3(850, -450);
addDiamond(850, -500, 0);
addTrees(900, -250);
addTrees2(850, -200);
addDiamond(900, -200, 0);
addDiamond(600, -25, 0);
addTrees(725, -250);
addTrees(700, -300);
addDiamond(500, 0, 0);

//arrow bit
addTrees2(-400, 950); //arrow tip
addTrees(-500, 800); //right
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

addTrees2(-600, 50);
addTrees(-550, -200);
addTrees3(-500, -325);

//loop two
addTrees(-750, 50);
addDiamond(-700, 75, 0);
addTrees3(-850, 50);
addDiamond(-800, 100, 0);
addTrees2(-875, 150);
addDiamond(-900, 200, 0);
addTrees(-900, 250);
addTrees(-900, 300);
addDiamond(-900, 275, 0);
addTrees2(-900, 400);
addTrees(-650, 500);
addDiamond(-600, 425, 0);
addDiamond(-600, 475, 0);
addTrees3(-600, 350);
addDiamond(-800, 475, 0);
addTrees2(-700, 500);

addCave(-480, -680);

//Set up trees
// let arrTreePositions = [
//   [0, 0], [50, 50], [200, 200], [525, 50], [25, 500], [300, 150]
// ];




let arrTreePositions = [
  [-420,700]
];

for (var i = 0; i < arrTreePositions.length; i++){
  addTrees(arrTreePositions[i][0], arrTreePositions[i][1]);
}

//Add mushrooms

let arrMushroomPositions = [
  [-345, 818, true], [-363, 865, true], [-380, 914, true], [-395, 798, true], [-431, 898, true], [-415, 850, true], [170, 200, true], 
  [170, 340, true], [-720, 60, true], [220, 175, true], [540, 200, false], [560, 205, false], [550, 180, false], [575, 230, false], 
  [350, 230, true], [-700, 90, true], [-650, 100, true], [-680, 150, true], [-600, 120, true], [-660, 200, true], [-750, 250, true],
  [350, 0, true], [790, -480, true], [830, -300, false], [920, -450, true], [870, -250, false], [960, -250, true], [850, -350, false],
  [450, -450, true], [270, -250, false], [160, -250, true], [50, -350, false],
];

for (var i = 0; i < arrMushroomPositions.length; i++){
  addMushroom(arrMushroomPositions[i][0], arrMushroomPositions[i][1], arrMushroomPositions[i][2]);
}

// Add flowers



let arrFlowerPositions = [
  [-310, 710], [100, -15], [10, -10], [-5, -150], [15, -455], [-230, 400], [-15, 250], [-500, 15], [-60, 10], [650, 120], [75, 425],
  [350, -610], [620, 20], [430, -30], [80, -450], [40, 450], [270, -20], [60, -50], [50, -300], [70, -50], [60, -20], 
  [500, 400], [-50, 120]
];

let arrFlowerInfo = [
  [false, purpleFlower, 80], [false, purpleFlower, 80], [false, purpleFlower, 80], [false, purpleFlower, 80], 
  [false, orangeFlower, 15], [false, orangeFlower, 15], [false, orangeFlower, 15], [false, purpleFlower, 80], 
  [false, orangeFlower, 15], [false, purpleFlower, 80], [false, orangeFlower, 15], [false, purpleFlower, 80],
  [false, purpleFlower, 80], [false, purpleFlower, 80], [false, purpleFlower, 80], [false, purpleFlower, 80],
  [false, orangeFlower, 15], [false, purpleFlower, 80], [false, orangeFlower, 15], [false, orangeFlower, 15],
  [false, orangeFlower, 15], [false, orangeFlower, 15], [false, orangeFlower, 15]
];

for (var i = 0; i < arrFlowerPositions.length; i++){
  addFlowers(arrFlowerPositions[i][0], arrFlowerPositions[i][1], arrFlowerInfo[i][0], arrFlowerInfo[i][1], arrFlowerInfo[i][2]);
}


//Add bushes

let arrBushPositions = [
  [-420,700,0], [125,310,Math.PI/6],[125,190,-Math.PI/6]
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
	
	}

}

//Hierachial Modelling Enemy
function addEnemy(x,y,z){
  //Entire Enemy Object
  enemy = new THREE.Group();


  //Big Body
  let geometry = new THREE.SphereGeometry(5,32,32);
  let material = new THREE.MeshStandardMaterial({color: 0xff0000, emissive: 0xff3c00});
  let bigBody = new THREE.Mesh(geometry, material);
  bigBody.scale.set(1,2,1);

  enemy.add(bigBody);

  //Face Game object
  let face = new THREE.Group();

  
  geometry = new THREE.SphereGeometry(3,32,32);
  material = new THREE.MeshStandardMaterial({color: 0xff0000, emissive: 0xff3c00});
  let faceNoEyes = new THREE.Mesh(geometry, material);


  let eye1 = enemyEye();
  
  let eye2 = enemyEye();

  face.add(faceNoEyes);

  eye1.position.set(0.5*4,0.5,1*1.5);

  eye2.position.set(-0.5*4,0.5,1*1.5);

  face.add(eye1);
  face.add(eye2);

  //Adding face to enemy

  face.position.set(0,11.5,0)
  enemy.add(face);

  enemy.position.set(x,y,z);
  enemy.scale.set(2,2,2);
  enemy.userData.tag = "enemy";

  scene.add(enemy);
}

function enemyEye(){
  let geometry = new THREE.SphereGeometry(1,32,32);
  let material = new THREE.MeshStandardMaterial({color: 0x000000});

  let eye = new Mesh(geometry, material);

  eye.scale.set(1,1,0.5);

  return eye;
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

