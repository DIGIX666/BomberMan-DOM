import { socket } from "./connect.js";

let roomEnd = false
let playersIn = []



window.addEventListener("DOMContentLoaded", () => {

    setTimeout((timeWait, ) => {
    
        socket.onmessage = function (event) {
            let dataPlayerEnter = JSON.parse(event.Data)

            if (dataPlayerEnter!="") {
                
                playersIn.push(dataPlayerEnter)
            }
            console.log(dataPlayerEnter)
        }
    }, timeWait);
})







