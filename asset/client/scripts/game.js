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

    function createMap() {
        for (let row = 0; row < mapData.length; row++) {
            for (let col = 0; col < mapData[row].length; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                if (mapData[row][col] === '#') {
                    cell.classList.add('wall');
                } else if (mapData[row][col] === 'b') {
                    cell.classList.add('brick');
                }
                bomberMan.appendChild(cell);
            }
        }
        // Créer le personnage
        const character = document.createElement('div');
        character.classList.add('character'); // Ajoutez des styles pour positionner le personnage
        bomberMan.appendChild(character); // Ajoutez le personnage à l'élément parent
    }

    createMap();
});
//////////////////////////////////////////////////////////////


////////////////// DIRECTION DU PERSONNAGE /////////////////////

document.addEventListener('keydown', (event) => {
    const character = document.querySelector('.character');
    const characterStyle = getComputedStyle(character);
    const characterLeft = parseInt(characterStyle.left);
    const characterTop = parseInt(characterStyle.top);
    const characterWidth = parseInt(characterStyle.width); // Nouvelle ligne
    const characterHeight = parseInt(characterStyle.height); // Nouvelle ligne

    const newPosition = { left: characterLeft, top: characterTop };

    if (event.key === 'ArrowRight') {
        newPosition.left += 10; // Ajustez la valeur de déplacement
    }

    // Vérifier si la nouvelle position contient un mur ou un obstacle
    const newRow = Math.floor(newPosition.top / 96); // Taille d'une cellule
    const newCol = Math.floor(newPosition.left / 60); // Taille d'une cellule

    // Vérifier toutes les coins du personnage pour collision
    if (
        mapData[newRow][newCol] !== '#' &&
        mapData[newRow][newCol] !== 'b' &&
        mapData[newRow][newCol + Math.floor(characterWidth / 60)] !== '#' &&
        mapData[newRow][newCol + Math.floor(characterWidth / 60)] !== 'b' &&
        mapData[newRow + Math.floor(characterHeight / 96)][newCol] !== '#' &&
        mapData[newRow + Math.floor(characterHeight / 96)][newCol] !== 'b' &&
        mapData[newRow + Math.floor(characterHeight / 96)][newCol + Math.floor(characterWidth / 60)] !== '#' &&
        mapData[newRow + Math.floor(characterHeight / 96)][newCol + Math.floor(characterWidth / 60)] !== 'b'
    ) {
        // Mettre à jour la position seulement si la nouvelle position est libre
        character.style.left = newPosition.left + 'px';
    }
});
//////////////////////////////////////////////////////////////////////////////////////////