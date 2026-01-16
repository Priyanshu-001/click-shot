<template>
    <div :class="['d-flex', horizontal ? 'flex-row' : 'flex-column', 'align-center']"  style="gap: 4px;">
           <span>{{ text }}</span>
          <v-hotkey :keys="keyCode"/>
         </div>
</template>

<script setup>
    import { VHotkey } from 'vuetify/components';
    defineProps(['text', "keyCode", "horizontal"])
</script>
