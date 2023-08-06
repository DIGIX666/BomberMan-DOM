import { socket } from "./scripts/connect.js"
/* BackEnd Logic of the page */

function GetUserName() {
    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", (input) => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        return input.value;
    })
}

function SendUserName(Name = "") {

    const data = {
        type: "UserLog",
        UserInfo: {
            UserName: Name,
        }
    }

    socket.send(JSON.stringify(data))

}
SendUserName(GetUserName())
/****************************/