/* BackEnd Logic of the page */
import { socket } from "./connect.js";


window.addEventListener("DOMContentLoaded", ()=>{

    let userName = ""
    
    let button = document.getElementById("button")
    let input = document.querySelector(".input")
    button.addEventListener("click", () => {
        console.log("values of the input", input)
        console.log("value in input", input.value)
        userName = input.value;
        
        if (userName != "") {
    
            const data = {
                type: "UserLog",
                UserInfo: {
                    UserName: userName,
                }
            }
            socket.send(JSON.stringify(data))
            userName = ""
        }
    })
})

/****************************/