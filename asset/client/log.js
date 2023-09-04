/* BackEnd Logic of the page */
import { socket } from "./connect.js";
import { displayRoom, masquerElementsParClasse } from "./scripts/setting-page.js";

window.addEventListener("DOMContentLoaded", () => {

    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", () => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        
        if (input.value != "") {

            masquerElementsParClasse('log')
            socket.send(JSON.stringify({
                type: "UserLog",
                data: {
                    name: input.value,
                }
            }))
        }
    })

})



/****************************/