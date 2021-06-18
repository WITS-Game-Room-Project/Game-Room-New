import './style.css';

import {GameLoop as Level1Loop, changeLevelFunc as changeLevelFunc1} from "./scenes/Level1.js";
import {GameLoop as Level2Loop} from "./scenes/Level2.js";
// import {GameLoop as Level3Loop} from './scenes/Level3.js';

let levelNumber = 2;

export default function changeLevelNumber(newLevelNumber){
    this.levelNumber = newLevelNumber;
}

console.log(levelNumber);
if (levelNumber == 1){
    changeLevelFunc1(changeLevelNumber);
    Ammo().then(Level1Loop);

}else if (levelNumber == 2){
    Ammo().then(Level2Loop);
}
// else if (levelNumber == 3){
//     Ammo().then(Leve3Loop);
// }


// function levelOne(){
//     Ammo().then(Level1Loop);
// }


// levelOne();

// export function levelTwo() {Ammo().then(Level2Loop);}







