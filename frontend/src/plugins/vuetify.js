import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as labsComponents from "vuetify/labs/components";
import * as directives from "vuetify/directives";
import { md2 } from "vuetify/blueprints";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";


export default createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
  },
  theme: {
    defaultTheme: "light",
  },
  blueprint: md2
});
