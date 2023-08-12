// Fichier ./src/routing/router.js
export class Router {
  constructor() {
    this.routes = [];
  }

  addRoute(route, action) {
    this.routes.push({ route, action });
  }

  navigate(url) {
    window.history.pushState(null, null, url);
    this.handleUrlChange();
  }

  handleUrlChange() {
    const currentUrl = window.location.pathname;

    for (const { route, action } of this.routes) {
      if (route === currentUrl) {
        action();
        break;
      }
    }
  }
}
