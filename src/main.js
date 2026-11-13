import { createApp } from "vue";
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from "./App.vue";
import router from "./router";
import "../css/style.css";

createApp(App)
    .use(router)
    .use(Toast)
    .mount("#app");

//THIS IS THAT SCRIPT TAG REFERENCE AT THE BOTTOM OF INDEX.HTML ********

//This page is responisble for initializing the app. It imports the App.vue file, which is the main page of the app
// It mounts it to the HTML element with the <id> of "app" inside of index.html. 
// It also imports the router.js file, which is responsible for handling navigation between different pages in the app. 
// The router is then used by the app to enable navigation functionality. 
// Additionally, it imports a CSS file for styling and a toast notification library for displaying notifications to the user.