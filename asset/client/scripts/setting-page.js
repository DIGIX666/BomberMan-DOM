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


