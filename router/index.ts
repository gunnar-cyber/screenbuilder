import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../components/Home/Home.vue";
import Monitoring from "../components/Monitoring/Monitoring.vue";
import MainMode from "../components/MainMode/MainMode.vue";
import System from "../components/System/System.vue";
import MainCenter from "../components/MainCenter/MainCenter.vue";
import Graphics from "../components/Graphics/Graphics.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/Monitoring",
    name: "Monitoring",
    component: Monitoring
  },
  {
    path: "/MainMode",
    name: "MainMode",
    component: MainMode
  },
  {
    path: "/System",
    name: "System",
    component: System
  },
  {
    path: "/MainCenter",
    name: "MainCenter",
    component: MainCenter
  },
  {
    path: "/Graphics",
    name: "Graphics",
    component: Graphics
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
