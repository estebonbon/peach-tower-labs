<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const emit = defineEmits(['toggle-sidebar']);
const route = useRoute();
const isMobileOpen = ref(false);
const isCollapsed = ref(false);

function toggleSidebar() {
    if (window.matchMedia('(max-width: 768px)').matches) {
        isMobileOpen.value = !isMobileOpen.value;
        document.body.style.overflow = isMobileOpen.value ? 'hidden' : '';
        return;
    }

    isCollapsed.value = !isCollapsed.value;
    emit('toggle-sidebar');
}

function closeMobileMenu() {
    isMobileOpen.value = false;
    document.body.style.overflow = '';
}

function handleKeydown(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
}

onMounted(() => document.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
});

watch(() => route.fullPath, closeMobileMenu);
</script>


<template>
    <aside id="sidebar-navigation" class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">
        <button class="logo" type="button" aria-label="Toggle navigation" @click="toggleSidebar">
            <img src="/images/Crossfire%20Logo.PNG" alt="CrossFire Canada Logo">
            <span class="crossfire-info">
                <span class="brand-name">CrossFire Canada</span>
                <span class="brand-description">Non-Conformance Report System</span>
            </span>
        </button>
        <nav aria-label="Main navigation">
            <ul>
                <li>
                    <RouterLink to="/" exact-active-class="active">
                        <i class="fas fa-home" aria-hidden="true"></i><span>Home</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/reports/log" active-class="active">
                        <i class="fas fa-file-alt" aria-hidden="true"></i><span>NCR Log</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/reports/create" active-class="active">
                        <i class="fas fa-plus-circle" aria-hidden="true"></i><span>Create NCR</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/reports/archive" active-class="active">
                        <i class="fas fa-archive" aria-hidden="true"></i><span>Archive</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/reports/engineering-review" active-class="active">
                        <i class="fas fa-drafting-compass" aria-hidden="true"></i><span>Engineering</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </aside>

    <button
        class="mobile-toggle-btn"
        type="button"
        :aria-expanded="isMobileOpen"
        aria-controls="sidebar-navigation"
        :aria-label="isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="toggleSidebar"
    >
        <i :class="isMobileOpen ? 'fas fa-xmark' : 'fas fa-bars'" aria-hidden="true"></i>
    </button>
    <button
        class="sidebar-overlay"
        :class="{ show: isMobileOpen }"
        type="button"
        aria-label="Close navigation menu"
        @click="closeMobileMenu"
    ></button>
</template>
