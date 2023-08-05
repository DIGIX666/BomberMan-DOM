// Sélectionnez la div avec la classe "room"
const roomDiv = document.querySelector('.room');

// Créez un élément h1
const heading = document.createElement('h1');
heading.classList.add('players_heading');

// Définissez le texte à l'intérieur de l'élément h1
heading.textContent = 'Players';

// Ajoutez l'élément h1 à l'intérieur de la div avec la classe "room"
roomDiv.appendChild(heading);


