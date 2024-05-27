<script setup>
import { ref } from 'vue'
const props = defineProps({
    message: {
        type: String,
        default: 'hello world'
    }
})
const count = ref(0)
</script>
<template>
    <div>
        <button @click="count++">{{props.message}}{{ count }}</button>
    </div>
</template>