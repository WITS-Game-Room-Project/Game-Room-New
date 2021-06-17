import './style.css';

import {GameLoop as Level1Loop} from "./scenes/Level1.js";
import {GameLoop as Level2Loop} from "./scenes/Level2.js";

Ammo().then(Level1Loop);
//Ammo().then(Level2Loop);