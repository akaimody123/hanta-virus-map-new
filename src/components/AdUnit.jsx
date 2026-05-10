import { useEffect, useRef } from 'react'

export function AdUnit({ slot, format = 'auto', style = {} }) {
  const adRef = useRef(null)

  useEffect(() => {
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({})
      }
    } catch {
      // AdSense not loaded in dev environment or blocked by ad blocker
    }
  }, [])

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
