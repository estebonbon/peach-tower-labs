import { createRouter, createWebHistory } from 'vue-router';
//Here we are importing all the pages we want to be able to navigate to, and giving them a variable name we can use to navigate to them. 
// It stores the vue component aka(page? in a variable name of your choice
import ArchiveNCR from './pages/ArchiveNCR.vue';
import CreateNCR from './pages/CreateNCR.vue';
import DetailsNCR from './pages/DetailsNCR.vue';
import EditNCR from './pages/EditNCR.vue';
import EngineeringReviewNCR from './pages/EngineeringReviewNCR.vue';
import Home from './pages/Home.vue';
import NcrLog from './pages/NcrLog.vue';

//CreateRouter is a function that sets up the navigation functionality of the app. It takes an object with two properties: history and routes.
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: Home }, //Component represents the page that will be displayed when the user navigates to that path.
        { path: '/reports/log', name: 'ncr-log', component: NcrLog },
        { path: '/reports/create', name: 'create', component: CreateNCR },
        { path: '/reports/details', name: 'details', component: DetailsNCR },
        { path: '/reports/edit', name: 'edit', component: EditNCR },
        { path: '/reports/archive', name: 'archive', component: ArchiveNCR },
        { path: '/reports/archive/details', name: 'archive-details', component: DetailsNCR },
        { path: '/reports/engineering-review', name: 'engineering-review', component: EngineeringReviewNCR },
        { path: '/:pathMatch(.*)*', redirect: '/' } // Redirect any unknown routes to the home page
    ],
    scrollBehavior() {
        return { top: 0 }; //This scroll the user to the top of the page every time.
    }
});

export default router; //This makes your router available to other files.
//Router needs to be availble so main.js can initialize it. 
// And App.Vue can use it to display the correct page based on what the user clicks, or the next page after an event finishes like submit create ncr.


/* How everything works together:
RouterLink = Where you want to go. ex: in SidebarNavigation.vue, the user clicks on a link to go to the create ncr page.
router.js = The page you are CURRENTLY ON. Which component/page belongs to that path. ex: in router.js, the create ncr page is associated with the CreateNCR.vue component.
RouterView = Where that component appears on the screen. ex: in App.vue, the RouterView is where the CreateNCR.vue component will be displayed when the user clicks on the link to go to the create ncr page. */