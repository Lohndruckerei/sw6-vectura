import{D as s}from"./ld-vectura-C-be09-b.js";const n={template:`
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
</div>`,computed:{store(){return Shopware.Store.get("lvDesign")},current(){return this.store.design},designs(){return s.map(e=>{const t=e===this.store.defaultDesign;return{key:e,title:this.$tc(`lv-design.designs.${e}`)+(t?` (${this.$tc("lv-design.default")})`:"")}})}},created(){this.store.ensureLoaded()},methods:{async select(e){if(e!==this.current)try{await this.store.setDesign(e)}catch{}}}};export{n as default};
//# sourceMappingURL=index-B5DbIpbd.js.map
