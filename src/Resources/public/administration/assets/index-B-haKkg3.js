import{T as r}from"./ld-vectura-DQOk9lU1.js";const o={template:`
<lv-chip
    :label="label"
    :color="config.color"
    :icon="config.icon"
    :title="title"
/>`,props:{transport:{type:String,required:!0},title:{type:String,required:!1,default:null}},computed:{config(){return r[this.transport]??{color:"c4",icon:"regular-plug"}},label(){const t=`lv-design.transports.${this.transport}`;return this.$te(t)?this.$tc(t):this.transport}}};export{o as default};
