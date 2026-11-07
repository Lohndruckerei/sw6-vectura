import{S as s,a}from"./ld-vectura-C-be09-b.js";const n={template:`
<span
    class="lv-status"
    :class="'lv-status--' + state"
>
    <mt-icon
        class="lv-status__icon"
        :name="icon"
        size="11px"
    />
    <span>{{ label }}</span>
</span>`,props:{state:{type:String,required:!0,validator:t=>s.includes(t)},label:{type:String,required:!0}},computed:{icon(){return a[this.state]}}};export{n as default};
//# sourceMappingURL=index-CEF0GLar.js.map
