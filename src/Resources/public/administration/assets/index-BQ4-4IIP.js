import{C as l}from"./ld-vectura-C-be09-b.js";const i={template:`
<span
    class="lv-chip"
    :style="{ '--lv-t': 'var(--lv-' + color + ')' }"
    :title="title"
>
    <mt-icon
        v-if="icon"
        class="lv-chip__icon"
        :name="icon"
        size="12px"
    />
    <span class="lv-chip__label">{{ label }}</span>
</span>`,props:{label:{type:String,required:!0},color:{type:String,required:!1,default:"c1",validator:e=>l.includes(e)},icon:{type:String,required:!1,default:null},title:{type:String,required:!1,default:null}}};export{i as default};
//# sourceMappingURL=index-BQ4-4IIP.js.map
