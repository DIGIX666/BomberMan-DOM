// import {createElement} from "../../framework/domUtils";
// import {appendChild} from "../../framework/domUtils";
// import {getElementById} from "../../framework/domUtils";

// script.js
const mapData = [
    ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', 'b', ' ', ' ', ' ', ' ', 'b', ' ', '#'],
    ['#', ' ', '#', '#', ' ', '#', ' ', '#', ' ', '#'],
    ['#', ' ', '#', ' ', 'b', ' ', ' ', '#', ' ', '#'],
    ['#', 'b', ' ', ' ', '#', ' ', ' ', ' ', 'b', '#'],
    ['#', '#', 'b', '#', ' ', '#', ' ', '#', '#', '#'],
    ['#', ' ', '#', ' ', ' ', '#', 'b', ' ', ' ', '#'],
    ['#', ' ', '#', ' ', ' ', '#', 'b', ' ', ' ', '#'],
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
                } else {
                    cell.classList.add('empty');
                }

                bomberMan.appendChild(cell);
            }
        }
    }

    createMap();
});