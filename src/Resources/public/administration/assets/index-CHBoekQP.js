import{D as s}from"./ld-vectura-D-0r_CTT.js";const r={template:`
<div class="lv-design-switch" role="group" :aria-label="$tc('lv-design.switchLabel')">
    <span class="lv-design-switch__label">{{ $tc('lv-design.switchLabel') }}</span>
    <button
        v-for="design in designs"
        :key="design.key"
        v-tooltip.bottom="{ message: design.title, appearance: 'light' }"
        type="button"
        class="lv-design-switch__option"
        :class="{ 'is--active': design.key === current }"
        :aria-pressed="design.key === current ? 'true' : 'false'"
        @click="select(design.key)"
    >
        {{ design.key.toUpperCase() }}
    </button>
    <button
        v-tooltip.bottom="{ message: $tc('lv-design.marker.toggleTitle'), appearance: 'light' }"
        type="button"
        class="lv-design-switch__option lv-design-switch__marker"
        :class="{ 'is--active': markerActive }"
        :aria-pressed="markerActive ? 'true' : 'false'"
        @click="toggleMarker"
    >
        {{ $tc('lv-design.marker.toggle') }}
    </button>
</div>`,data(){var e;return{markerActive:((e=window.ldAdminMarker)==null?void 0:e.active)??!1,markerOff:null}},computed:{store(){return Shopware.Store.get("lvDesign")},current(){return this.store.design},designs(){return s.map(e=>{const t=e===this.store.defaultDesign;return{key:e,title:this.$tc(`lv-design.designs.${e}`)+(t?` (${this.$tc("lv-design.default")})`:"")}})}},created(){var e;this.store.ensureLoaded(),this.markerOff=((e=window.ldAdminMarker)==null?void 0:e.onChange(t=>{this.markerActive=t}))??null},unmounted(){var e;(e=this.markerOff)==null||e.call(this)},methods:{toggleMarker(){var e;(e=window.ldAdminMarker)==null||e.toggle()},async select(e){if(e!==this.current)try{await this.store.setDesign(e)}catch{}}}};export{r as default};
