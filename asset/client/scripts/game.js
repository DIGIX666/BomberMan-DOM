import { socket } from "../connexion.js";
import { player } from "./room.js";

const bomberMan = document.querySelector('.game');
const character1 = document.createElement('div');
const character2 = document.createElement('div');
const character3 = document.createElement('div');
const character4 = document.createElement('div');

character1.classList.add('character1');
character2.classList.add('character2');
character3.classList.add('character3');
character4.classList.add('character4');
bomberMan.appendChild(character1);

const characterWidth = 10; // Largeur du personnage
const characterHeight = 67; // Hauteur du personnage
const charWidth = characterWidth;
const charHeight = characterHeight;

let brickBox = []
let wallBox = []

let character = null

document.querySelectorAll(".wall").forEach((element) => {

    let left = element.getBoundingClientRect().left;
    let right = element.getBoundingClientRect().right;
    let bottom = element.getBoundingClientRect().bottom;
    let top = element.getBoundingClientRect().top;

    wallBox.push(left);
    wallBox.push(top);
    wallBox.push(bottom);
    wallBox.push(right);
});

let charLeft = 0
let charTop = 0
let currentLife = player.lives;

export function GameInit(players, i) {
    let mapData = [
        ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
        ['#', ' ', '#', ' ', ' ', ' ', ' ', '#', ' ', '#'],
        ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
        ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
        ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
        ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    ];

    for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (mapData[row][col] === '#') {
                cell.classList.add('wall');

            } else if (mapData[row][col] === 'b') {
                cell.setAttribute('data-row', row); // Ajouter l'attribut de données pour la ligne
                cell.setAttribute('data-col', col); // Ajouter l'attribut de données pour la colonne
                cell.classList.add('brick');
            }
            bomberMan.appendChild(cell);
        }
    }
    //Ajout des joueurs

    if (players.length == 2) {
        bomberMan.appendChild(character2);
    } else if (players.length == 3) {
        bomberMan.appendChild(character2);
        bomberMan.appendChild(character3);
    } else if (players.length == 4) {
        bomberMan.appendChild(character2);
        bomberMan.appendChild(character3);
        bomberMan.appendChild(character4);
    }

    for (let k = 1; k <=players.length; k++) {
        const item = document.getElementById("item--"+k.toString());
        console.log("item:", item);
        // const textItem = document.getElementsByClassName(".text--"+k.toString());
        let life = document.createElement('span');
        life.classList.add('life'+k.toString());
        life.textContent = "3";
        item.appendChild(life);
    }

    character = document.querySelector(".character" + ((i + 1).toString()))
    console.log("indice dans GamePlay:", i)

    let docCharacter = getComputedStyle(character)

    // currentLife = player.lives

    charLeft = parseInt(docCharacter.left.replace("px", ""));
    charTop = parseInt(docCharacter.top.replace("px", ""));

    //Send to server that the Initialization it's done

    socket.send(JSON.stringify({
        Type: "GameSet",
        Data: {
            map: mapData
        }
    }))
}

export function GetNameAndAdress(activeCo) {

    const result = {
        Name: activeCo.name,
        Adress: activeCo.adress,
    }

    return result
}




////////// Player Moved //////////////
export function PlayerMoved(socket, player, data, mapData) {

    
    let playerName = player.namePlayer
    console.log("dataServer:", data.who)
    console.log("data.who:", data.who)
    character = document.querySelector(".character" + ((data.who + 1).toString()))
    // console.log("character:", character);
    let docCharacter = getComputedStyle(character);
    
    let left = parseInt(docCharacter.left.replace("px", ""));
    let top = parseInt(docCharacter.top.replace("px", ""));

    console.log("data from moving:", data);
    console.log("mapData from moving:", mapData);

    // Vérifier si le mouvement est possible
    if (data.direction == "Up" && data.move) {
        if (Collision(left, data.position - 10, mapData)) {
            // player.positionTop = data.position - 10;
            // character.style.top = player.positionTop + 'px';
            top = data.position - 10;
            character.style.top = top + 'px';
        }
    }
    if (data.direction == "Down" && data.move) {
        if (Collision(left, data.position + 10, mapData)) {
            // player.positionTop = data.position + 10;
            // character.style.top = player.positionTop + 'px';
            top = data.position + 10;
            character.style.top = top + 'px';
        }

    }

    if (data.direction == "Left" && data.move) {
        if (Collision(data.position - 10, top, mapData)) {
            // player.positionLeft = data.position - 10;
            // character.style.left = player.positionLeft + 'px';
            left = data.position - 10;
            character.style.left = left + 'px';
        }
    }

    if (data.direction == "Right" && data.move) {
        if (Collision(data.position + 10, top, mapData)) {
            // player.positionLeft = data.position + 10;
            // character.style.left = player.positionLeft + 'px';
            left = data.position + 10;
            character.style.left = left + 'px';
        }
    }

    console.log("character before bomb ws:", character);


    if (player.bomb && character != null) {

        dropBomb(character, data.x, data.y, data.currentLife, player, mapData,data.who)
        UpdateBricks()
        player.bomb = false
    }
}
//////////////////////////////////////


export function GamePlay(socket, player, mapData, i) {

    document.addEventListener('keydown', (event) => {

        // Vérifier si le mouvement est possible
        UpdateBricks()
        UpdatePlayers()

        character = document.querySelector(".character" + ((i + 1).toString()))

        let docCharacter = getComputedStyle(character);

        charLeft = parseInt(docCharacter.left.replace("px", ""));
        charTop = parseInt(docCharacter.top.replace("px", ""));

        // charLeft = getComputedStyle(character).left.replace("px", "");
        // charTop = getComputedStyle(character).top.replace("px", "");
        // let charLeft = character.getBoundingClientRect().left
        // let charTop = character.getBoundingClientRect().top


        if (event.key === 'ArrowRight') {
            console.log("charLeft:", charLeft)
            console.log("charTop:", charTop)
            console.log("character:", character)
            console.log("Right")
            if (Collision(charLeft + 10, charTop, mapData)) {
                charLeft += 10
                player.positionLeft = charLeft
                character.style.left = charLeft + 'px'
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Right",
                        player: player.adress,
                        name: player.playerName,
                        position: charLeft,
                        move: true,
                        map: mapData,
                        who: i
                        // currentLife: currentLife
                    }
                }))
            }
        } else if (event.key === 'ArrowLeft') {
            console.log("Left")
            console.log("charLeft:", charLeft);
            console.log("charTop:", charTop);
            console.log("character:", character)
            if (Collision(charLeft - 10, charTop, mapData)) {
                charLeft -= 10
                player.positionLeft = charLeft
                character.style.left = charLeft + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Left",
                        player: player.adress,
                        name: player.playerName,
                        position: charLeft,
                        move: true,
                        map: mapData,
                        who: i
                        // currentLife: currentLife
                    }
                }))
            }
        } else if (event.key === 'ArrowUp') {
            console.log("Up")
            console.log("charLeft:", charLeft);
            console.log("charTop:", charTop);
            console.log("character:", character)
            if (Collision(charLeft, charTop - 10, mapData)) {
                charTop -= 10;
                player.positionTop = charTop
                character.style.top = charTop + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Up",
                        player: player.adress,
                        name: player.playerName,
                        position: charTop,
                        move: true,
                        map: mapData,
                        who: i
                        // currentLife: currentLife
                    }
                }))
            }
        } else if (event.key === 'ArrowDown') {
            console.log("Down")
            console.log("charLeft:", charLeft);
            console.log("charTop:", charTop);
            console.log("character:", character)
            if (Collision(charLeft, charTop + 10, mapData)) {
                charTop += 10;
                player.positionTop = charTop
                character.style.top = charTop + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Down",
                        player: player.adress,
                        name: player.playerName,
                        position: charTop,
                        move: true,
                        map: mapData,
                        who: i
                        // currentLife: currentLife
                    }
                }))
            }
        }
        console.log("character before bomb:", character);
        // Ajouter la logique pour déposer une bombe avec la touche Espace
        if (event.key === ' ' && character != null) { // Touche Espace
            dropBomb(character, charLeft + charWidth / 2, charTop + charHeight / 2, currentLife, player, mapData,i);
            UpdateBricks();
          
            socket.send(JSON.stringify({
                Type: "Player Dropped Bomb",
                data: {
                    name: player.playerName,
                    adress: player.playerAdress,
                    x: charLeft + charWidth / 2,
                    y: charTop + charHeight / 2,
                    currentLife: player.lives,
                    updateMap: mapData,
                    who: i,
                }
            }));
        }
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let countTouch = 0
///////// Drop Bomb ///////////////
function dropBomb(character, x, y, currentLife, player, mapData,i) {
    const bomb = document.createElement('div');
    bomb.classList.add('bombe');
    bomb.style.left = x + 'px';
    bomb.style.top = y + 'px';
    bomberMan.appendChild(bomb);

    // Programmer l'animation d'explosion après 3 secondes
    setTimeout(function () {
        bomberMan.removeChild(bomb); // Supprimer l'élément de la bombe

        // Créer l'élément d'explosion
        const explosion = document.createElement('div');
        explosion.classList.add('explosion');
        explosion.style.left = bomb.style.left;
        explosion.style.top = bomb.style.top;
        bomberMan.appendChild(explosion);

        // Vérifier les collisions avec les briques
        const bricks = document.querySelectorAll('.brick');
        bricks.forEach((brick) => {
            if (checkCollision(explosion, brick)) {
                const brickRow = parseInt(brick.getAttribute('data-row'));
                const brickCol = parseInt(brick.getAttribute('data-col'));
                brick.style.visibility = 'hidden'; // Cacher la brique visuellement
                // brick.classList.remove('brick'); // Cette ligne n'est plus nécessaire, car nous masquons la brique

                // Créer un tableau pour suivre les récompenses déjà créées
                const createdRewards = [];

                if (Math.random() < 0.5 && createdRewards.length < 3) {
                    const randomNumber = Math.random();
                    // Créer un élément pour le sprite à faire apparaître (reward)
                    const rewardspeed = document.createElement('div');
                    const rewardfire = document.createElement('div');
                    const rewardbomb = document.createElement('div');

                    if (randomNumber < 0.33 && createdRewards.indexOf('reward-speed') === -1) {
                        createdRewards.push('reward-speed');
                        rewardspeed.classList.add('reward-speed');
                    } else if (randomNumber < 0.66 && createdRewards.indexOf('reward-bomb') === -1) {
                        createdRewards.push('reward-bomb');
                        rewardbomb.classList.add('reward-bomb');
                    } else if ( randomNumber < 1.2 && createdRewards.indexOf('reward-fire') === -1) {
                        createdRewards.push('reward-fire');
                        rewardfire.classList.add('reward-fire');
                    }

                    rewardspeed.style.left = bomb.style.left;
                    rewardspeed.style.top = bomb.style.top;

                    rewardbomb.style.left = bomb.style.left;
                    rewardbomb.style.top = bomb.style.top;

                    rewardfire.style.left = bomb.style.left;
                    rewardfire.style.top = bomb.style.top;

                    bomberMan.appendChild(rewardspeed); // Ajoutez le sprite au conteneur
                    bomberMan.appendChild(rewardbomb); // Ajoutez le sprite au conteneur
                    bomberMan.appendChild(rewardfire); // Ajoutez le sprite au conteneur
                    console.log("reward:", createdRewards)
                }

                mapData[brickRow][brickCol] = ' '; // Mettre à jour le modèle de données en supprimant la brique
            }
        });
        if (
            checkCollision(explosion, character) 
        ) {
            player.hitPlayer = true// Marquer que le joueur a été touché
            countTouch = countTouch + 1 
            reduceLife(currentLife, player,i); // Appeler la fonction pour réduire la vie du joueur
            console.log("vie perdu");
            
        }

        // Supprimer l'élément d'explosion après un délai
        setTimeout(function () {
            bomberMan.removeChild(explosion);
        }, 1000); // Supprimer l'explosion après 1 seconde
    }, 2000); // 3 secondes
}
///////////////////////////////////


///////// Reduce Life //////////////
function reduceLife(currentLife, player,i,countTouch) {
    const lifeElement = document.querySelector('.life'+(i+1).toString());
    console.log("lifeElement:", lifeElement);
    console.log("lifeElement.textContent:", lifeElement.textContent);
    currentLife = parseInt(lifeElement.textContent);
    
    if (currentLife > 0) {
        player.lives--;

        lifeElement.textContent = currentLife
        console.log("currentLife:", currentLife);

        if (currentLife === 0) {
            const characterLife = document.querySelector('.character'+(i+1).toString());
            bomberMan.removeChild(characterLife);
            console.log("Game over!");
            socket.send(JSON.stringify({
                Type: "GAME OVER",
                Data: {
                    name: player.namePlayer,
                    adress: player.playerAdress,
                }
            }))
        }
    }
}
///////////////////////////////////////


///////// Check Collision /////////////
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}
///////////////////////////////////////


///////// Collision /////////////
function Collision(positionLeft, positionTop, mapData) {

    let newRow = Math.floor(positionTop / 100);
    let newCol = Math.floor(positionLeft / 98);
    let bottomRow = Math.floor((positionTop + characterHeight) / 100);
    let rightCol = Math.floor((positionLeft + characterWidth) / 98);

    if (
        newRow >= 0 && newCol >= 0 &&
        bottomRow < mapData.length &&
        rightCol < mapData[0].length &&
        mapData[newRow][newCol] !== '#' &&
        mapData[newRow][rightCol] !== '#' &&
        mapData[bottomRow][newCol] !== '#' &&
        mapData[bottomRow][rightCol] !== '#' &&
        mapData[newRow][newCol] !== 'b' &&
        mapData[newRow][rightCol] !== 'b' &&
        mapData[bottomRow][newCol] !== 'b' &&
        mapData[bottomRow][rightCol] !== 'b'
    ) {
        return true
    } else {
        return false
    }
}
//////////////////////////////////


///////// Update Bricks /////////////
function UpdateBricks() {
    brickBox = []
    document.querySelectorAll(".brick").forEach((element) => {
        let x = element.getBoundingClientRect().x;
        let y = element.getBoundingClientRect().y;
        let left = element.getBoundingClientRect().left;
        let right = element.getBoundingClientRect().right;
        let bottom = element.getBoundingClientRect().bottom;
        let top = element.getBoundingClientRect().top;

        let gauche = x / left;
        let haut = y / top;

        brickBox.push(left);
        brickBox.push(top);
        brickBox.push(bottom);
        brickBox.push(right);
    });

    return brickBox
}


function UpdatePlayers(){
    let players = []
    document.querySelectorAll(".character").forEach((element) => {
        let x = element.getBoundingClientRect().x;
        let y = element.getBoundingClientRect().y;
        let left = element.getBoundingClientRect().left;
        let right = element.getBoundingClientRect().right;
        let bottom = element.getBoundingClientRect().bottom;
        let top = element.getBoundingClientRect().top;

        let gauche = x / left;
        let haut = y / top;

        players.push(left);
        players.push(top);
        players.push(bottom);
        players.push(right);
    });

    return players
}


///////////// FPS /////////////// 
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.ieRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60); 
        };
})();
let fpsElement = document.getElementById("fps");

let then = Date.now() / 1000;  // get time in seconds

let render = function() {
    let now = Date.now() / 1000;  // get time in seconds

    // compute time since last frame
    let elapsedTime = now - then;
    then = now;

    // compute fps
    let fps = 1 / elapsedTime;
    fpsElement.innerText = fps.toFixed(2);

    requestAnimFrame(render);
};
render();
///////////////////////////////////////