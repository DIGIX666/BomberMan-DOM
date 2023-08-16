// Fonction pour masquer les éléments avec des classes spécifiques
function masquerElementsParClasse(nomClasse) {
    const elements = document.querySelectorAll('.' + nomClasse);
    elements.forEach(element => {
        element.style.display = 'none';
    });
}

// Appeler la fonction pour masquer les éléments
masquerElementsParClasse('room');
masquerElementsParClasse('bomberman');


/////////////////////////////////////////////////////////////
// CACHER LA PAGE DE REGISTER ET AFFICHER LA PAGE D'ATTENTE /
/////////////////////////////////////////////////////////////

// Sélectionnez le bouton par son ID
const button = document.getElementById('button');

// Sélectionnez la div avec la classe "room"
const roomDiv = document.querySelector('.room');

// Sélectionnez la section avec la classe "log"
const logSection = document.querySelector('.log');

// Ajoutez un gestionnaire d'événement pour le clic sur le bouton
button.addEventListener('click', () => {
    // Affichez la div de la salle
    roomDiv.style.display = 'block';
    // Masquez la section de journal
    logSection.style.display = 'none';
});


///////////////////////////////////////////////////
// CACHER LA PAGE D'ATTENTE ET AFFICHER LA DE JEU /
///////////////////////////////////////////////////


// Sélectionnez le bouton par son ID
const buttonGame = document.getElementById('button-game');

// Sélectionnez la div avec la classe "bomberman"
const bombermanDiv = document.querySelector('.bomberman');

buttonGame.addEventListener('click', () => {
    // Affichez la div de la salle
    bombermanDiv.style.display = 'block';
    // Masquez la section de journal
    roomDiv.style.display = 'none';
});

