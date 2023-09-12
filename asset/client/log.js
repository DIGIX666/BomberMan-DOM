/* BackEnd Logic of the page */
import { socket } from "./connect.js";
import { masquerElementsParClasse } from "./scripts/setting-page.js";

document.addEventListener("DOMContentLoaded", () => {

    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", () => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        
        if (input.value != "") {

            socket.send(JSON.stringify({
                type: "UserLog",
                data: {
                    name: input.value,
                }
            }))
            masquerElementsParClasse('log')
        }
    })
})






/****************************/