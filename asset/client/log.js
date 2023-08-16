/* BackEnd Logic of the page */
import { socket } from "./connect.js";
import { loadPage, navigateTo } from "./route.js";

loadPage("/")
// document.addEventListener("DOMContentLoaded", () => {
//     console.log("IN addEVENTListener")
//     let userName = ""
//     let button = document.getElementById("button")
//     let input = document.querySelector(".input")
//     button.addEventListener("click", () => {
//         console.log("values of the input", input)
//         console.log("value in input", input.value)
//         userName = input.value;

//         if (userName != "") {

//             socket.send(JSON.stringify({
//                 type: "UserLog",
//                 data: {
//                     name: userName,
//                 }
//             }))
//             userName = ""
//         }
//     })
// })

socket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    console.log("data from server:", data)

    if (data.type == "room") {
        navigateTo("/" + data.type)
    }
}

// function navigateTo(route) {
//     history.pushState(null, null, route);
//     loadPage(route);
// }

/****************************/