import { socket } from "../connect";


////////////////Player//////////////////
class Player {
    constructor(namePlayer,adress,direction,lives,bombe){

        this.namePlayer = namePlayer = ""
        this.adress = adress = ""
        this.direction = direction = ""
        this.lives = lives = 3
        this.bombe = bombe = false
    }
}
///////////////////////////////////////



//////////////////////// CREATE MAP //////////////
const mapData = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', ' ', '#', ' ', ' ', ' ', ' ', '#', ' ', '#'],
    ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', 'b', '#', '#', 'b', 'b', '#', '#', 'b', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
];
//////////////////////////////////////////////////////////////////////////////////



document.addEventListener('DOMContentLoaded', () => {
    const bomberMan = document.querySelector('.game');
    const character = document.createElement('div');
    const characterWidth = 10; // Largeur du personnage
    const characterHeight = 67; // Hauteur du personnage
    let hitPlayer = false;
    let P1 = document.querySelector(".Player1")
    let P2 = document.querySelector(".Player2")
    let P3 = document.querySelector(".Player3")
    let P4 = document.querySelector(".Player4")

    const characterStyle = getComputedStyle(character);
    const characterLeft = parseInt(characterStyle.left);
    const characterTop = parseInt(characterStyle.top);

    const player = new Player
    let Direction = player.direction
    let currentLife = player.lives
    let playerName = player.namePlayer
    let adress = player.namePlayer
    let newLeft = 0
    let newTop = 0


    // Créer le personnage
    character.classList.add('character');
    bomberMan.appendChild(character);

    ///////////////////Recevoir les joueurs///////////////////////////////////////////
    socket.onmessage = function (event) {
        let Server = JSON.parse(event.data)
        if (Server.type == "Players") {
            let Players = []
            console.log("Server In Game:", Server)
            Server.data.allPlayers.forEach(element => {
                Players.push(element)
            });

            console.log("Players tab:", Players)
            P1.innerHTML = Players[0]
            P2.innerHTML = Players[1]
            P3.innerHTML = Players[2]
            P4.innerHTML = Players[3]
            playerName = Server.data.name
            adress = Server.data.clientAdress

        }
    }

    ///////////////////////////////////////////////////////////////////////////////////

    function createMap() {
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


    }
    function Moving(character, socket) {
        
        socket.onmessage = (event) => {
            let ServerMovement = JSON.parse(event.data)
            
            if (ServerMovement.Type === "playerMoved") {
                
                
                if (ServerMovement.data.name === playerName) {
                    if (ServerMovement.data.direction === "Right" || ServerMovement.data.direction === "Left") {
                        Direction = ServerMovement.data.direction
                        newLeft = characterLeft
                        newLeft += ServerMovement.data.direction 
                    }

                    if (ServerMovement.data.direction === "Up" || ServerMovement.data.direction === "Down") {
                        Direction = ServerMovement.data.direction
                        newTop = characterTop
                        newTop += ServerMovement.data.direction 
                    }
                }
            }  
        }
        
        // Gérer le mouvement du personnage avec les flèches du clavier
        document.addEventListener('keydown', (event) => {
            // const characterStyle = getComputedStyle(character);
            // const characterLeft = parseInt(characterStyle.left);
            // const characterTop = parseInt(characterStyle.top);

            newLeft = characterLeft;
            newTop = characterTop;
            hitPlayer = false;

            if (event.key === 'ArrowRight') {
                newLeft += 10;
                Direction = "Right"
                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    data: {
                        direction: Direction,
                        player: adress,
                        name: playerName,


                    }
                }))
            } else if (event.key === 'ArrowLeft') {
                newLeft -= 10;
                Direction = "Left"

                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    data: {
                        direction: Direction,
                        player: adress,
                        name: playerName

                    }
                }))
            } else if (event.key === 'ArrowUp') {
                newTop -= 10;
                Direction  = "Up"

                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    data: {
                        direction: Direction,
                        player: adress,
                        name: playerName


                    }
                }))
            } else if (event.key === 'ArrowDown') {
                newTop += 10;
                Direction = "Down"

                socket.send(JSON.stringify({
                    Type: "PlayerMoving",
                    data: {
                        direction: Direction,
                        player: adress,
                        name: playerName

                    }
                }))
            }

            // Vérifier les collisions avec les murs et les briques
            const newRow = Math.floor(newTop / 100);
            const newCol = Math.floor(newLeft / 98);
            const bottomRow = Math.floor((newTop + characterHeight) / 100);
            const rightCol = Math.floor((newLeft + characterWidth) / 98);

            // Vérifier si le mouvement est possible
            let canMove = true;

            if (
                newRow >= 0 && newCol >= 0 && bottomRow < mapData.length && rightCol < mapData[0].length &&
                mapData[newRow][newCol] !== '#' &&
                mapData[newRow][rightCol] !== '#' &&
                mapData[bottomRow][newCol] !== '#' &&
                mapData[bottomRow][rightCol] !== '#' &&
                mapData[newRow][newCol] !== 'b' &&
                mapData[newRow][rightCol] !== 'b' &&
                mapData[bottomRow][newCol] !== 'b' &&
                mapData[bottomRow][rightCol] !== 'b'
            ) {
                character.style.left = newLeft + 'px';
                character.style.top = newTop + 'px';
            }


            // Ajouter la logique pour déposer une bombe avec la touche Espace
            if (event.key === ' ') { // Touche Espace
                dropBomb(character, characterLeft + characterWidth / 2, characterTop + characterHeight / 2,currentLife);
                socket.send(JSON.stringify({
                    Type: "Player Dropped Bomb",
                    data:{
                        name: playerName,
                        adress: playerAdress,
                        x:characterLeft + characterWidth / 2,
                        y:characterTop + characterHeight / 2,
                        currentLife: currentLife

                    }
                }))
            }
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function dropBomb(character, x, y,currentLife) {
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
                        !hitPlayer
                    ) {
                        hitPlayer = true; // Marquer que le joueur a été touché
                        reduceLife(currentLife); // Appeler la fonction pour réduire la vie du joueur
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

    function reduceLife(currentLife) {
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
                        name: namePlayer,
                        adress: playerAdress,
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


    createMap();
    Moving(character,socket);


});
//////////////////////////////// FIN JEU ////////////////////////////////