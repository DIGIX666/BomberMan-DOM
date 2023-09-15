/* BackEnd Logic of the page */
import { socket } from "./connexion.js";
import { loadPage } from "./route.js";
import { masquerElementsParClasse } from "./scripts/setting-page.js";

window.addEventListener("DOMContentLoaded", () => {

    let userName = ""
    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", () => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        
        if (input.value != "") {
            userName = input.value;

            socket.send(JSON.stringify({
                type: "UserLog",
                data: {
                    name: userName,
                }
            }))
            masquerElementsParClasse('log')
        }
    })
})

function navigateTo(route) {
    history.pushState(null, null, route);
    loadPage(route);
}




/****************************/