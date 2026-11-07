/* GENERIERT aus ld-admin-design 1.0.0 (cef5da4) – nicht hier ändern, sondern in ~/projekte/ld-admin-design/vorlage und ./sync.sh ausführen. */
import { TRANSPORTS } from '../../constants';

/**
 * Übertragungsweg als Chip – Farbe, Icon und Bezeichnung sind in allen Plugins gleich.
 *
 * transport: email | ftp | sftp | portal_manual | rest_api | soap | webhook
 */
export default {
    template: `
<lv-chip
    :label="label"
    :color="config.color"
    :icon="config.icon"
    :title="title"
/>`,

    props: {
        transport: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: false,
            default: null,
        },
    },

    computed: {
        config() {
            return TRANSPORTS[this.transport] ?? { color: 'c4', icon: 'regular-plug' };
        },

        label() {
            const key = `lv-design.transports.${this.transport}`;

            return this.$te(key) ? this.$tc(key) : this.transport;
        },
    },
};
