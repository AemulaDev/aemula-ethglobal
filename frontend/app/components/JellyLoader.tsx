import { useEffect } from 'react';

export function JellyLoader() {
    useEffect(() => {
      async function getLoader() {
        const { jellyTriangle } = await import('ldrs')
        jellyTriangle.register()
      }
      getLoader()
    }, [])
    return <l-jelly-triangle speed="1.1" color="#27272a"></l-jelly-triangle>
};