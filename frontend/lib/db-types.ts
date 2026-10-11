export type Category = {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  sortOrder: number
}

export type Product = {
  id: string
  name: string
  slug: string
  brand: string
  description: string
  price: number
  compareAtPrice: number | null
  stock: number
  condition: string
  images: string
  specs: string
  featured: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  phone: string | null
  role: string
  createdAt: Date
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string | null
  name: string
  slug: string
  image: string | null
  price: number
  qty: number
}

export type Order = {
  id: string
  orderNumber: string
  userId: string | null
  customerName: string
  phone: string
  email: string | null
  address: string
  city: string
  notes: string | null
  paymentMethod: string
  /** `/uploads/...` path of the bank-transfer receipt, when one was attached. */
  paymentProof: string | null
  subtotal: number
  shipping: number
  total: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export type Inquiry = {
  id: string
  type: string
  name: string
  phone: string
  email: string | null
  device: string | null
  condition: string | null
  message: string | null
  handled: boolean
  createdAt: Date
}
