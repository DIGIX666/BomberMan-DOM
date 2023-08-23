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
// document.addEventListener('DOMContentLoaded', () => {
//     const bomberMan = document.querySelector('.game');
//
//     function createMap() {
//         for (let row = 0; row < mapData.length; row++) {
//             for (let col = 0; col < mapData[row].length; col++) {
//                 const cell = document.createElement('div');
//                 cell.classList.add('cell');
//
//                 if (mapData[row][col] === '#') {
//                     cell.classList.add('wall');
//                 } else if (mapData[row][col] === 'b') {
//                     cell.classList.add('brick');
//                 }
//                 bomberMan.appendChild(cell);
//             }
//         }
//         // Créer le personnage
//         const character = document.createElement('div');
//         character.classList.add('character'); // Ajoutez des styles pour positionner le personnage
//         bomberMan.appendChild(character); // Ajoutez le personnage à l'élément parent
//     }
//
//     createMap();
// });

document.addEventListener('DOMContentLoaded', () => {
    const bomberMan = document.querySelector('.game');
    const characterWidth = 10; // Largeur du personnage
    const characterHeight = 67; // Hauteur du personnage

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
        character.classList.add('character');
        bomberMan.appendChild(character);

        // Gérer le mouvement du personnage avec les flèches du clavier
        document.addEventListener('keydown', (event) => {
            const characterStyle = getComputedStyle(character);
            const characterLeft = parseInt(characterStyle.left);
            const characterTop = parseInt(characterStyle.top);

            let newLeft = characterLeft;
            let newTop = characterTop;

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
            const newCol = Math.floor(newLeft / 96);
            const bottomRow = Math.floor((newTop + characterHeight) / 100);
            const rightCol = Math.floor((newLeft + characterWidth) / 96);

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
        });
    }

    createMap();
});

//////////////////////////////////////////////////////////////


////////////////// DIRECTION DU PERSONNAGE /////////////////////
// document.addEventListener('keydown', (event) => {
//     const character = document.querySelector('.character');
//     const characterStyle = getComputedStyle(character);
//     const characterLeft = parseInt(characterStyle.left);
//     const characterTop = parseInt(characterStyle.top);
//     const characterWidth = parseInt(characterStyle.width);
//     const characterHeight = parseInt(characterStyle.height); // Nouvelle ligne
//
//     const newPosition = { left: characterLeft, top: characterTop };
//
//     if (event.key === 'ArrowRight') {
//         newPosition.left += 10; // Ajustez la valeur de déplacement
//     }
//     if (event.key === 'ArrowLeft') {
//         newPosition.left -= 10;
//     }
//     if (event.key === 'ArrowUp') {
//         newPosition.top -= 10;
//     }
//     if (event.key === 'ArrowDown') {
//         newPosition.top += 10;
//     }
//
//     // Vérifier si la nouvelle position contient un mur ou un obstacle
//     const newRow = Math.floor(newPosition.top / 97); // Taille d'une cellule
//     const newCol = Math.floor(newPosition.left / 96);  // Taille d'une cellule
//
// // Vérifier toutes les coins du personnage pour collision
//     const characterBottomRow = newRow + Math.floor(characterHeight / 97);
//     const characterRightCol = newCol + Math.floor(characterWidth / 96);
//
//
//     const bottomRow = Math.floor((newPosition.top + characterHeight) / 97); // Nouvelle ligne
//     const rightCol = Math.floor((newPosition.left + characterWidth) / 96); // Nouvelle colonne
//
//
//     if (
//         mapData[newRow][newCol] !== '#' &&
//         mapData[newRow][characterRightCol] !== '#' &&
//         mapData[characterBottomRow][newCol] !== '#' &&
//         mapData[characterBottomRow][characterRightCol] !== '#' &&
//         mapData[newRow][newCol] !== 'b' &&
//         mapData[newRow][characterRightCol] !== 'b' &&
//         mapData[characterBottomRow][newCol] !== 'b' &&
//         mapData[characterBottomRow][characterRightCol] !== 'b'
//     ) {
//         // Mettre à jour la position seulement si la nouvelle position est libre
//         character.style.left = newPosition.left + 'px';
//         character.style.top = newPosition.top + 'px';
//     }
//
// });
//////////////////////////////////////////////////////////////////////////////////////////