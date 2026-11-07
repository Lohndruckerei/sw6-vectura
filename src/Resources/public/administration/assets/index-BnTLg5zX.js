import{S as s,a}from"./ld-vectura-DQOk9lU1.js";const n={template:`
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
</span>`,props:{state:{type:String,required:!0,validator:t=>a.includes(t)},label:{type:String,required:!0}},computed:{icon(){return s[this.state]}}};export{n as default};
