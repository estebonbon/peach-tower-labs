//Starts Vue and mounts the component
import { createApp } from "vue";
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import CreateNCR from "./components/CreateNCR.vue";

const app = createApp(CreateNCR);
console.log("Vue is starting!");
app.use(Toast);
app.mount('#CreatePage')