// import {createElement} from "../../framework/domUtils";
// import {appendChild} from "../../framework/domUtils";
// import {getElementById} from "../../framework/domUtils";


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

document.addEventListener('DOMContentLoaded', () => {
    const bomberMan = document.querySelector('.game');
    const characterWidth = 10; // Largeur du personnage
    const characterHeight = 67; // Hauteur du personnage
    let hitPlayer = false;
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
        // Créer le personnage
        const character = document.createElement('div');
        character.classList.add('character');
        bomberMan.appendChild(character);

        // Gérer le mouvement du personnage avec les flèches du clavier
        document.addEventListener('keydown', (event) => {
            const characterStyle = getComputedStyle(character);
            const characterLeft = parseInt(characterStyle.left);
            const characterTop = parseInt(characterStyle.top);

            let newLeft = characterLeft;
            let newTop = characterTop;
            hitPlayer = false;

            if (event.key === 'ArrowRight') {
                newLeft += 10;
            } else if (event.key === 'ArrowLeft') {
                newLeft -= 10;
            } else if (event.key === 'ArrowUp') {
                newTop -= 10;
            } else if (event.key === 'ArrowDown') {
                newTop += 10;
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
                    dropBomb(character,characterLeft + characterWidth / 2, characterTop + characterHeight / 2);
            }
        });
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function dropBomb(character,x, y) {
        const bomb = document.createElement('div');
        bomb.classList.add('bombe');
        bomb.style.left = x + 'px';
        bomb.style.top = y + 'px';
        bomberMan.appendChild(bomb);

        // Programmer l'animation d'explosion après 3 secondes
        setTimeout(function() {
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
                        reduceLife(); // Appeler la fonction pour réduire la vie du joueur
                        console.log("vie perdu");
                    }
                }
            });

            // Supprimer l'élément d'explosion après un délai
            setTimeout(function() {
                bomberMan.removeChild(explosion);
            }, 1000); // Supprimer l'explosion après 1 seconde
        }, 2000); // 3 secondes
    }

    function reduceLife() {
        const lifeElement = document.querySelector('.life');
        let currentLife = parseInt(lifeElement.textContent);

        if (currentLife > 0) {
            currentLife--;
            lifeElement.textContent = currentLife;

            if (currentLife === 0) {
                const characterLife = document.querySelector('.character');
                bomberMan.removeChild(characterLife);
                console.log("Game over!");
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
});
//////////////////////////////// FIN JEU ////////////////////////////////


