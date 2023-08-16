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
