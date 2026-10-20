//Starts Vue and mounts the component
import { createApp } from "vue";
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import CreateNCR from "./components/CreateNCR.vue";
import EditNCR from "./components/EditNCR.vue";
import DetailsNCR from "./components/DetailsNCR.vue";

// Check which page is open and mount the correct Vue component
if (document.getElementById('CreatePage')) {
    const app = createApp(CreateNCR);
    app.use(Toast);
    app.mount('#CreatePage');
}

if (document.getElementById('EditPage')) {
    const app = createApp(EditNCR);
    app.use(Toast);
    app.mount('#EditPage');
}

// NCR Details page
if (document.getElementById('DetailsPage')) {
    const app = createApp(DetailsNCR);
    console.log("DETAILS PAGE FOUND!");
    app.use(Toast);
    app.mount('#DetailsPage');
}

//Archive Detials
if (document.getElementById('ArchiveDetailsPage')) {
    const app = createApp(DetailsNCR);
    app.use(Toast);
    app.mount('#ArchiveDetailsPage');
}