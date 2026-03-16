const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export const productsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${API_URL}/products?${query}`)
    return res.json()
  },

  getBySlug: async (slug) => {
    const res = await fetch(`${API_URL}/products/${slug}`)
    return res.json()
  },

  getFeatured: async () => {
    const res = await fetch(`${API_URL}/products/featured`)
    return res.json()
  },

  search: async (q) => {
    const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(q)}`)
    return res.json()
  }
}

export const categoriesApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/categories`)
    return res.json()
  }
}

export const cartApi = {
  getCart: async () => {
    const res = await fetch(`${API_URL}/cart`)
    return res.json()
  },

  addItem: async (data) => {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }
}

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  },

  register: async (data) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }
}

export const rfqApi = {
  create: async (data) => {
    const res = await fetch(`${API_URL}/rfq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  createBulk: async (data) => {
    const res = await fetch(`${API_URL}/rfq/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  }
}

export const vehicleApi = {
  lookupVIN: async (vin) => {
    const res = await fetch(`${API_URL}/vehicles/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vin })
    })
    return res.json()
  },

  getMakes: async () => {
    const res = await fetch(`${API_URL}/vehicles/makes`)
    return res.json()
  }
}
