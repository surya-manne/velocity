import DefaultTheme from "vitepress/theme";
import VelocityHome from "./components/VelocityHome.vue";
import VelocityFlowDiagram from "./components/VelocityFlowDiagram.vue";
import VelocityOverview from "./components/VelocityOverview.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component("VelocityHome", VelocityHome);
    app.component("VelocityFlowDiagram", VelocityFlowDiagram);
    app.component("VelocityOverview", VelocityOverview);
  },
};
