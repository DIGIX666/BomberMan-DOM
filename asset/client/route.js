// import { Router } from "../framework/router.js";

// import { createElement } from "../framework/domUtils.js";

const routes = {
    "/": "home.html",
    "/room": "room.html",
    "/game": "game.html"
};

// const route = new Router();
// route.addRoute("/", () => {

//     // loadPage("/");
//     navigateTo("/");

//     // Handle initial page load
//     window.addEventListener("load", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });

//     // Handle navigation when using browser back/forward buttons
//     window.addEventListener("popstate", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });
// })

// route.addRoute("/room", () => {
//     //loadPage("/room");
//     navigateTo("/room");

//     // Handle initial page load
//     window.addEventListener("load", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });

//     // Handle navigation when using browser back/forward buttons
//     window.addEventListener("popstate", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });

// })

// route.addRoute("/game", () => {
//     //loadPage("/game");
//     navigateTo("/game");

//     // Handle initial page load
//     window.addEventListener("load", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });

//     // Handle navigation when using browser back/forward buttons
//     window.addEventListener("popstate", () => {
//         const currentRoute = window.location.pathname;
//         loadPage(currentRoute);
//     });
// })


export function loadPage(route) {
//    const appDiv =  createElement("div", { id: "app" }, [])
//    document.body.appendChild(appDiv)
    const appContainer = document.getElementById("app");
    const filename = routes[route];

    console.log("filename:", filename)

    if (!filename) {
        console.log('error route not found !!!!!!!!')
        return;
    }

    fetch("/asset" + filename)
        .then(response => response.text())
        .then(content => {
            appContainer.innerHTML = content;
        })
        .catch(error => {
            console.error("Error loading page:", error);
        });
        console.log("fin de la function loadPage")
}

export function navigateTo(route) {
    history.pushState(null, null, route);
    //loadPage(route);
    console.log("fin fonction navigateTo")
}
