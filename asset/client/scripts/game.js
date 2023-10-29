import { socket } from "../connexion.js";


const bomberMan = document.querySelector('.game');
const character = document.createElement('div');

character.classList.add('character');
bomberMan.appendChild(character);

const characterBox = character.getBoundingClientRect();

let docCharacter = document.querySelector(".character")

const characterStyle = getComputedStyle(docCharacter);
const characterLeft = parseInt(characterStyle.left.replace("px", ""));
const characterTop = parseInt(characterStyle.top.replace("px", ""));
// const characterBottom = parseInt(characterStyle.bottom.replace("px", ""));
// const characterRight = parseInt(characterStyle.right.replace("px", ""));

let brickBox = []
let wallBox = []

const characterWidth = 10; // Largeur du personnage
const characterHeight = 67; // Hauteur du personnage

export class Player {
    constructor(namePlayer, adress, direction, lives, bombe, positionLeft, positionRight, positionBottom, positionTop, hitPlayer, canMove) {

        this.namePlayer = namePlayer = ""
        this.adress = adress = ""
        this.direction = direction = ""
        this.lives = lives = 3
        this.bombe = bombe = false
        this.positionLeft = positionLeft = characterLeft
        this.positionTop = positionTop = characterTop
        // this.positionRight = positionRight = characterRight
        // this.positionBottom = positionBottom = characterBottom
        this.hitPlayer = hitPlayer = false
        this.canMove = canMove = false

    }
}

export class Bomb {
    constructor(positionLeft, positionTop, positionRight, positionBottom, currentLife) {

        this.positionLeft = positionLeft = 0
        this.positionTop = positionTop = 0
        this.positionRight = positionRight = 0
        this.positionBottom = positionBottom = 0
        this.currentLife = currentLife = 0
    }
}

export const mapData = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
];

let count = 0

export function GameInit(mapData) {

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

    //Send to server that the Initialization it's done
    socket.send(JSON.stringify({
        Type: "GameSet",
        Data: null
    }))
}

export function GetNameAndAdress(activeCo) {

    const result = {
        Name: activeCo.name,
        Adress: activeCo.adress,
    }

    return result
}

export function PlayerMoved(socket, player, data, mapData) {

    let currentLife = player.lives
    let playerName = player.namePlayer


    console.log("data from moving:", data)


    // Gérer le mouvement du personnage avec les flèches du clavier


    // Vérifier les collisions avec les murs et les briques
    const newRow = Math.floor(player.positionTop / 100);
    const newCol = Math.floor(player.positionLeft / 98);
    const bottomRow = Math.floor((player.positionTop + characterHeight) / 100);
    const rightCol = Math.floor((player.positionLeft + characterWidth) / 98);

    // Vérifier si le mouvement est possible


    if (data.direction == "Up" && data.move) {
        if (Collision(player.positionLeft, data.position - 10, mapData)) {
            player.positionTop = data.position - 10;
            character.style.top = player.positionTop + 'px';
        }
    } else if (data.direction == "Down" && data.move) {
        if (Collision(player.positionLeft, data.position + 10, mapData)) {
            player.positionTop = data.position + 10;
            character.style.top = player.positionTop + 'px';
        }
    } else if (data.direction == "Left" && data.move) {
        if (Collision(data.position - 10, player.positionTop, mapData)) {
            player.positionLeft = data.position - 10;
            character.style.left = player.positionLeft + 'px';
        } 
    } else if (data.direction == "Right" && data.move) {
        if (Collision(data.position + 10, player.positionTop, mapData)) {
            player.positionLeft = data.position + 10;
            character.style.left = player.positionLeft + 'px';
        }
    }

    if (player.bomb) {
        console.log("bomb dropped") 
        console.log("bomb.x:", data.data.x)
        console.log("bomb.y:", data.data.y)
        dropBomb(character, data.data.x, data.data.y, currentLife, player)
        UpdateBricks()
        player.bomb = false
    }

    // document.addEventListener('keydown', (event) => {

    //     // Ajouter la logique pour déposer une bombe avec la touche Espace
    //     if (event.key === ' ') { // Touche Espace
    //         dropBomb(character, characterLeft + characterWidth / 2, characterTop + characterHeight / 2, currentLife, player)
    //         UpdateBricks()
    //         socket.send(JSON.stringify({
    //             Type: "Player Dropped Bomb",
    //             data: {
    //                 name: player.playerName,
    //                 adress: player.playerAdress,
    //                 x: characterLeft + characterWidth / 2,
    //                 y: characterTop + characterHeight / 2,
    //                 currentLife: currentLife
    //             }
    //         }))
    //     }
    // });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function GamePlay(socket, player, mapData) {
    let currentLife = player.lives;

    const charWidth = characterWidth;
    const charHeight = characterHeight;
    let charTop = characterBox.top;
    let charLeft = characterBox.left;

    
    //let wallBox = [];

    UpdateBricks()

    document.querySelectorAll(".wall").forEach((element) => {
        // let x = element.getBoundingClientRect().x;
        // let y = element.getBoundingClientRect().y;
        let left = element.getBoundingClientRect().left;
        let right = element.getBoundingClientRect().right;
        let bottom = element.getBoundingClientRect().bottom;
        let top = element.getBoundingClientRect().top;
        // let gauche = x / left;
        // let haut = y / top;
        wallBox.push(left);
        wallBox.push(top);
        wallBox.push(bottom);
        wallBox.push(right);
    });

    document.addEventListener('keydown', (event) => {
        const walls = wallBox.sort();
        const bricks = brickBox.sort();

        if (event.key === 'ArrowRight') {
            if (Collision(charLeft + 10, charTop, mapData) && !walls.includes(charLeft + 10) && !bricks.includes(charLeft + 10)) {
                charLeft += 10
                character.style.left = charLeft + 'px'
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Right",
                        player: player.adress,
                        name: player.playerName,
                        position: player.positionLeft,
                        move: true
                    }
                }))
            }
        } else if (event.key === 'ArrowLeft') {
            if (Collision(charLeft - 10, charTop, mapData) && !walls.includes(charLeft - 10) && !bricks.includes(charLeft - 10)) {
                charLeft -= 10;
                character.style.left = charLeft + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Left",
                        player: player.adress,
                        name: player.playerName,
                        position: player.positionLeft,
                        move: true
                    }
                }))
            }
        } else if (event.key === 'ArrowUp') {
            if (Collision(charLeft, charTop - 10, mapData) && !walls.includes(charTop - 10) && !bricks.includes(charTop - 10)) {
                charTop -= 10;
                character.style.top = charTop + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Up",
                        player: player.adress,
                        name: player.playerName,
                        position: player.positionTop,
                        move: true
                    }
                }))
            }
        } else if (event.key === 'ArrowDown') {
            if (Collision(charLeft, charTop + 10, mapData) && !walls.includes(charTop + 10) && !bricks.includes(charTop + 10)) {
                charTop += 10;
                character.style.top = charTop + 'px';
                // Envoyez la position mise à jour au serveur
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    Data: {
                        direction: "Down",
                        player: player.adress,
                        name: player.playerName,
                        position: player.positionTop,
                        move: true
                    }
                }))
            }
        }
        // Ajouter la logique pour déposer une bombe avec la touche Espace
        if (event.key === ' ') { // Touche Espace
            dropBomb(character, charLeft + charWidth / 2, charTop + charHeight / 2, currentLife, player);
            UpdateBricks();
            socket.send(JSON.stringify({
                Type: "Player Dropped Bomb",
                data: {
                    name: player.playerName,
                    adress: player.playerAdress,
                    x: charLeft + charWidth / 2,
                    y: charTop + charHeight / 2,
                    currentLife: currentLife
                }
            }));
        }
    });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dropBomb(character, x, y, currentLife,player) {
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
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        bomberMan.appendChild(explosion);

        // Vérifier les collisions avec les briques
        const bricks = document.querySelectorAll('.brick');
        bricks.forEach((brick) => {
            if (checkCollision(explosion, brick)) {
                const brickRow = parseInt(brick.getAttribute('data-row'));
                const brickCol = parseInt(brick.getAttribute('data-col'));
                brick.style.visibility = 'hidden'; // Cacher la brique visuellement
                brick.classList.remove('brick'); // Retirer la classe "brick"

                mapData[brickRow][brickCol] = ' '; // Mettre à jour le modèle de données
                if (
                    checkCollision(explosion, character) &&
                    !player.hitPlayer
                ) {
                    player.hitPlayer = true // Marquer que le joueur a été touché
                    reduceLife(currentLife, player); // Appeler la fonction pour réduire la vie du joueur
                    console.log("vie perdu");
                }
            }
        });

        // Supprimer l'élément d'explosion après un délai
        setTimeout(function () {
            bomberMan.removeChild(explosion);
        }, 1000); // Supprimer l'explosion après 1 seconde
    }, 2000); // 3 secondes
}
/////////////////////////////////////////////////////////////////////////////////////////////////

function reduceLife(currentLife, player) {
    const lifeElement = document.querySelector('.life');
    currentLife = parseInt(lifeElement.textContent);

    if (currentLife > 0) {
        currentLife--;
        lifeElement.textContent = currentLife;

        if (currentLife === 0) {
            const characterLife = document.querySelector('.character');
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
/////////////////////////////////////////////////////////////////////////////////////////////////

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
////////////////////////////////////////////////////////////////////////////////////////////////////

function UpdateBricks(){
    brickBox = []
    document.querySelectorAll(".brick").forEach((element) => {
        let left = element.getBoundingClientRect().left;
        let right = element.getBoundingClientRect().right;
        let bottom = element.getBoundingClientRect().bottom;
        let top = element.getBoundingClientRect().top;
        brickBox.push(left);
        brickBox.push(top);
        brickBox.push(bottom);
        brickBox.push(right);
    });
    console.log(brickBox);
}