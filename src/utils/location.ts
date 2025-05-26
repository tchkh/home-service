export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    }
  })
}

// Helper function to geocode address using OpenStreetMap Nominatim API (Free)
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number }> => {
  const encodedAddress = encodeURIComponent(address)

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&accept-language=th&limit=1`,
      {
        headers: {
          'User-Agent': 'HomeService/1.0 (homeservice@example.com)',
          'Accept': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()

    if (data && data[0]) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      return { lat, lng }
    }

    throw new Error('Address not found')
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}

// Helper function to geocode address using Google Maps API (if API key is available)
export const geocodeAddressGoogle = async (
  address: string
): Promise<{ lat: number; lng: number }> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured')
  }
  
  const encodedAddress = encodeURIComponent(address)

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
    )
    const data = await response.json()

    if (data.results && data.results[0]) {
      const location = data.results[0].geometry.location
      return { lat: location.lat, lng: location.lng }
    }

    throw new Error('Address not found')
  } catch (error) {
    console.error('Geocoding error:', error)
    throw error
  }
}
