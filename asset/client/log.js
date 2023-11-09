/* BackEnd Logic of the page */
<<<<<<< HEAD
import { socket } from "./connect.js";
import { displayRoom, masquerElementsParClasse } from "./scripts/setting-page.js";
=======
import { socket } from "./connexion.js";
import { loadPage } from "./route.js";
import { masquerElementsParClasse } from "./scripts/setting-page.js";
>>>>>>> lives

document.addEventListener("DOMContentLoaded", () => {

    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", () => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        
        if (input.value != "") {
<<<<<<< HEAD

=======
            userName = input.value;
>>>>>>> lives
            masquerElementsParClasse('log')

            socket.send(JSON.stringify({
                type: "UserLog",
                data: {
                    name: input.value,
                }
            }))
            input.value = "";
        }
    })
})

<<<<<<< HEAD





=======
function navigateTo(route) {
    history.pushState(null, null, route);
    loadPage(route);
}
>>>>>>> lives
/****************************/