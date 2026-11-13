<script setup>
import { ref } from 'vue'; //Lets vue remember values, like whether the sidebar is expanded or not, and updates the view when they change
import SidebarNavigation from './pages/SidebarNavigation.vue'; //Imports the sidebar from the pages folder

const contentExpanded = ref(false); //False means the sidebar is not expanded, true means it is expanded
</script>

<!-- This acts like the index page for the app 
    Every page we navigate to will be displayed inside the RouterView 
    And the RouterView will always be displayed, here in the App.vue -->
<template>
    <SidebarNavigation @toggle-sidebar="contentExpanded = !contentExpanded" /> <!-- Displays the sidebar, and listens for an event called toggle sidebar -->
    <!--IMPORTANT THE CLASS **CONTENT** in the css file .content has width: calc(100% - 330px); these lines change the width of the content area based on the sidebar's expanded state. Thats how it becomes responsive-->
    <div class="content" :class="{ expanded: contentExpanded }"> <!-- "[:class]" adds the CSS class expanded only when contentExpanded is true. It basically resizes the content area-->
        <RouterView />
        <!-- The app automatically displays the correct component/page inside the RouterView -->
        <!-- RouterView is like an empty picture frame, 
             The file called router.js display the appropriate vue file based on what the user clicks, or the next page after an event finishes let submit create ncr -->

        <!-- Both Sidebar and RouterView will ALWAYS be displayed, the only content that changes is the content inside [RouterView] -->
    </div>
</template>
