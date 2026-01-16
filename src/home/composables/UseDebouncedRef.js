import { ref, watch } from 'vue'

export function useDebouncedRef(sourceRef, delay = 300) {
  const debounced = ref(sourceRef.value)
  let timeoutId = null

  watch(
    sourceRef,
    (val) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        debounced.value = val
      }, delay)
    },
    { flush: 'post' }
  )

  return debounced
}
