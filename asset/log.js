/* BackEnd Logic of the page */
import { socket } from "./connect.js";

window.addEventListener("DOMContentLoaded", () => {

    let userName = ""

    socket.onmessage = function (event) {
        let data = event.data

        if (data.type == "room") {

            navigateTo(data.type)

        } else {

            let button = document.getElementById("button")
            let input = document.querySelector(".input")
            button.addEventListener("click", () => {
                console.log("values of the input", input)
                console.log("value in input", input.value)
                userName = input.value;

                if (userName != "") {

                    const data = {
                        type: "UserLog",
                        name: userName
                    }
                    socket.send(JSON.stringify(data))
                    userName = ""
                }
            })
        }
    }

})

 function navigateTo(route) {
    history.pushState(null, null, route);
    loadPage(route);
}

/****************************/