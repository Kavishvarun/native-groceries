import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Product = {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  stock: number
  unit: string
  price: number
}

const app = express()
const port = Number(process.env.API_PORT ?? 3001)
const databasePath = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'products.json')
const messagesPath = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'messages.json')
const ordersPath = resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'orders.json')

const seedProducts: Omit<Product, 'id'>[] = [
  { name: 'Ponni boiled rice', sku: 'TN-RC-001', category: 'Rice & Grains', supplier: 'Cauvery Delta Growers', stock: 34, unit: '5 kg', price: 380 },
  { name: 'Idli rice', sku: 'TN-RC-002', category: 'Rice & Grains', supplier: 'Thanjavur Farm Collective', stock: 26, unit: '5 kg', price: 320 },
  { name: 'Dosa rice', sku: 'TN-RC-003', category: 'Rice & Grains', supplier: 'Thanjavur Farm Collective', stock: 22, unit: '5 kg', price: 340 },
  { name: 'Seeraga samba rice', sku: 'TN-RC-004', category: 'Rice & Grains', supplier: 'Dindigul Harvest', stock: 18, unit: '1 kg', price: 165 },
  { name: 'Red rice', sku: 'TN-RC-005', category: 'Rice & Grains', supplier: 'Cauvery Delta Growers', stock: 28, unit: '1 kg', price: 142 },
  { name: 'Raw rice', sku: 'TN-RC-006', category: 'Rice & Grains', supplier: 'Thanjavur Farm Collective', stock: 19, unit: '1 kg', price: 74 },
  { name: 'Foxtail millet (Thinai)', sku: 'TN-RC-007', category: 'Rice & Grains', supplier: 'Salem Millet Collective', stock: 22, unit: '1 kg', price: 115 },
  { name: 'Maize grain', sku: 'TN-RC-008', category: 'Rice & Grains', supplier: 'Salem Grain Mill', stock: 18, unit: '1 kg', price: 72 },
  { name: 'Toor dal', sku: 'TN-PL-001', category: 'Pulses', supplier: 'Native Grocery Market', stock: 28, unit: '1 kg', price: 165 },
  { name: 'Chana dal', sku: 'TN-PL-002', category: 'Pulses', supplier: 'Native Grocery Market', stock: 26, unit: '1 kg', price: 95 },
  { name: 'Whole green gram', sku: 'TN-PL-003', category: 'Pulses', supplier: 'Native Grocery Market', stock: 24, unit: '1 kg', price: 135 },
  { name: 'Whole urad dal', sku: 'TN-PL-004', category: 'Pulses', supplier: 'Native Grocery Market', stock: 22, unit: '1 kg', price: 145 },
  { name: 'Red masoor dal', sku: 'TN-PL-005', category: 'Pulses', supplier: 'Native Grocery Market', stock: 20, unit: '1 kg', price: 110 },
  { name: 'Whole wheat atta', sku: 'TN-WF-001', category: 'Wheat & Flours', supplier: 'Salem Grain Mill', stock: 31, unit: '5 kg', price: 265 },
  { name: 'Whole wheat berries', sku: 'TN-WF-002', category: 'Wheat & Flours', supplier: 'Salem Grain Mill', stock: 24, unit: '1 kg', price: 82 },
  { name: 'Wheat flour', sku: 'TN-WF-003', category: 'Wheat & Flours', supplier: 'Coimbatore Flour Mill', stock: 27, unit: '1 kg', price: 68 },
  { name: 'Ragi flour', sku: 'TN-WF-004', category: 'Wheat & Flours', supplier: 'Salem Millet Collective', stock: 28, unit: '500 g', price: 58 },
  { name: 'Kambu flour', sku: 'TN-WF-005', category: 'Wheat & Flours', supplier: 'Salem Millet Collective', stock: 19, unit: '500 g', price: 62 },
  { name: 'Cholam flour', sku: 'TN-WF-006', category: 'Wheat & Flours', supplier: 'Salem Millet Collective', stock: 21, unit: '500 g', price: 66 },
  { name: 'Dark chocolate bar', sku: 'TN-CH-001', category: 'Chocolate', supplier: 'Native Pantry', stock: 24, unit: '100 g', price: 120 },
  { name: 'Milk chocolate bar', sku: 'TN-CH-002', category: 'Chocolate', supplier: 'Native Pantry', stock: 28, unit: '100 g', price: 110 },
  { name: 'Chocolate chips', sku: 'TN-CH-003', category: 'Chocolate', supplier: 'Native Pantry', stock: 18, unit: '200 g', price: 185 },
  { name: 'Cocoa powder', sku: 'TN-CH-004', category: 'Chocolate', supplier: 'Native Pantry', stock: 20, unit: '100 g', price: 95 },
  { name: 'Filter coffee powder', sku: 'TN-BV-001', category: 'Beverages', supplier: 'Coimbatore Coffee Works', stock: 30, unit: '250 g', price: 145 },
  { name: 'Herbal tea', sku: 'TN-BV-002', category: 'Beverages', supplier: 'Nilgiri Tea Collective', stock: 25, unit: '100 g', price: 125 },
  { name: 'Coca-Cola soft drink', sku: 'TN-BV-003', category: 'Beverages', supplier: 'Native Grocery Market', stock: 36, unit: '750 ml', price: 45 },
  { name: 'Pepsi soft drink', sku: 'TN-BV-004', category: 'Beverages', supplier: 'Native Grocery Market', stock: 32, unit: '750 ml', price: 45 },
  { name: 'Maa Mango drink', sku: 'TN-BV-005', category: 'Beverages', supplier: 'Native Grocery Market', stock: 24, unit: '600 ml', price: 40 },
  { name: 'Maaza mango drink', sku: 'TN-BV-006', category: 'Beverages', supplier: 'Native Grocery Market', stock: 28, unit: '600 ml', price: 40 },
  { name: 'Slice mango drink', sku: 'TN-BV-007', category: 'Beverages', supplier: 'Native Grocery Market', stock: 25, unit: '600 ml', price: 40 },
  { name: 'Fresh cow milk', sku: 'TN-DA-001', category: 'Dairy Products', supplier: 'Thiruvannamalai Dairy Farm', stock: 30, unit: '1 L', price: 60 },
  { name: 'Thick curd', sku: 'TN-DA-002', category: 'Dairy Products', supplier: 'Thiruvannamalai Dairy Farm', stock: 24, unit: '500 g', price: 50 },
  { name: 'Fresh buttermilk', sku: 'TN-DA-003', category: 'Dairy Products', supplier: 'Thiruvannamalai Dairy Farm', stock: 24, unit: '500 ml', price: 30 },
  { name: 'Cheddar cheese', sku: 'TN-DA-004', category: 'Dairy Products', supplier: 'Native Dairy', stock: 16, unit: '200 g', price: 180 },
  { name: 'Salted butter', sku: 'TN-DA-005', category: 'Dairy Products', supplier: 'Native Dairy', stock: 18, unit: '100 g', price: 60 },
  { name: 'Fresh paneer', sku: 'TN-DA-006', category: 'Dairy Products', supplier: 'Thiruvannamalai Dairy Farm', stock: 15, unit: '200 g', price: 90 },
  { name: 'Pure cow ghee', sku: 'TN-DA-007', category: 'Dairy Products', supplier: 'Thiruvannamalai Dairy Farm', stock: 12, unit: '200 ml', price: 220 },
  { name: 'Dishwash liquid', sku: 'TN-HC-001', category: 'Home Care', supplier: 'Native Home Essentials', stock: 24, unit: '500 ml', price: 95 },
  { name: 'Laundry detergent', sku: 'TN-HC-002', category: 'Home Care', supplier: 'Native Home Essentials', stock: 20, unit: '1 kg', price: 145 },
  { name: 'Bathing soap', sku: 'TN-TL-001', category: 'Toiletries', supplier: 'Native Daily Care', stock: 36, unit: '100 g', price: 45 },
  { name: 'Toothpaste', sku: 'TN-TL-002', category: 'Toiletries', supplier: 'Native Daily Care', stock: 22, unit: '150 g', price: 85 },
  { name: 'Clinic Plus shampoo', sku: 'TN-TL-003', category: 'Toiletries', supplier: 'Native Daily Care', stock: 20, unit: '340 ml', price: 190 },
  { name: 'Head & Shoulders shampoo', sku: 'TN-TL-004', category: 'Toiletries', supplier: 'Native Daily Care', stock: 18, unit: '340 ml', price: 260 },
  { name: 'Coconut hair oil', sku: 'TN-BP-001', category: 'Beauty Products', supplier: 'Native Beauty Care', stock: 20, unit: '200 ml', price: 135 },
  { name: 'Aloe vera gel', sku: 'TN-BP-002', category: 'Beauty Products', supplier: 'Native Beauty Care', stock: 18, unit: '100 g', price: 115 },
  { name: 'Cadbury Dairy Milk chocolate', sku: 'TN-CH-005', category: 'Chocolate', supplier: 'Native Grocery Market', stock: 30, unit: '100 g', price: 100 },
  { name: 'Nestle Milkybar white chocolate', sku: 'TN-CH-006', category: 'Chocolate', supplier: 'Native Grocery Market', stock: 26, unit: '100 g', price: 90 },
  { name: 'KitKat chocolate', sku: 'TN-CH-007', category: 'Chocolate', supplier: 'Native Grocery Market', stock: 32, unit: 'pack', price: 40 },
  { name: 'Cadbury 5 Star chocolate', sku: 'TN-CH-008', category: 'Chocolate', supplier: 'Native Grocery Market', stock: 28, unit: 'pack', price: 30 },
  { name: 'Nestle Munch chocolate', sku: 'TN-CH-009', category: 'Chocolate', supplier: 'Native Grocery Market', stock: 28, unit: 'pack', price: 25 },
  { name: 'Marie Biscuits', sku: 'TN-BI-001', category: 'Biscuits', supplier: 'Native Grocery Market', stock: 32, unit: '200 g', price: 35 },
  { name: 'Digestive Biscuits', sku: 'TN-BI-002', category: 'Biscuits', supplier: 'Native Grocery Market', stock: 24, unit: '250 g', price: 65 },
  { name: 'Assorted Crackers', sku: 'TN-BI-003', category: 'Biscuits', supplier: 'Native Grocery Market', stock: 20, unit: '200 g', price: 55 },
  { name: 'Chocolate Chip Cookies', sku: 'TN-CO-001', category: 'Cookies', supplier: 'Native Bakery', stock: 22, unit: '200 g', price: 95 },
  { name: 'Butter Cookies', sku: 'TN-CO-002', category: 'Cookies', supplier: 'Native Bakery', stock: 20, unit: '200 g', price: 85 },
  { name: 'Assorted Cookies', sku: 'TN-CO-003', category: 'Cookies', supplier: 'Native Bakery', stock: 18, unit: '250 g', price: 120 },
  { name: 'Murungai keerai', sku: 'TN-LG-001', category: 'Leafy Greens', supplier: 'Madurai Market Garden', stock: 17, unit: 'bunch', price: 30 },
  { name: 'Arai keerai', sku: 'TN-LG-002', category: 'Leafy Greens', supplier: 'Kanchipuram Greens', stock: 24, unit: 'bunch', price: 25 },
  { name: 'Siru keerai', sku: 'TN-LG-003', category: 'Leafy Greens', supplier: 'Kanchipuram Greens', stock: 20, unit: 'bunch', price: 25 },
  { name: 'Fresh spinach', sku: 'TN-LG-004', category: 'Leafy Greens', supplier: 'Nilgiri Leaf Farms', stock: 28, unit: '250 g', price: 32 },
  { name: 'Fresh curry leaves', sku: 'TN-LG-005', category: 'Leafy Greens', supplier: 'Kanchipuram Greens', stock: 45, unit: 'bunch', price: 20 },
  { name: 'Poovan bananas', sku: 'TN-FR-001', category: 'Fruits', supplier: 'Pollachi Fruit Growers', stock: 32, unit: 'bunch', price: 48 },
  { name: 'Salem mangoes', sku: 'TN-FR-002', category: 'Fruits', supplier: 'Salem Orchard Collective', stock: 18, unit: 'kg', price: 110 },
  { name: 'Guava', sku: 'TN-FR-003', category: 'Fruits', supplier: 'Madurai Market Garden', stock: 22, unit: 'kg', price: 72 },
  { name: 'Papaya', sku: 'TN-FR-004', category: 'Fruits', supplier: 'Pollachi Fruit Growers', stock: 16, unit: 'each', price: 55 },
  { name: 'Sweet lime', sku: 'TN-FR-005', category: 'Fruits', supplier: 'Dindigul Orchard', stock: 19, unit: 'kg', price: 85 },
  { name: 'Tender coconut', sku: 'TN-FR-006', category: 'Fruits', supplier: 'Pollachi Coconut Co-op', stock: 32, unit: 'each', price: 48 },
  { name: 'Jackfruit bulbs', sku: 'TN-FR-007', category: 'Fruits', supplier: 'Cuddalore Orchard Collective', stock: 14, unit: '250 g', price: 85 },
  { name: 'Farm tomatoes', sku: 'TN-VG-001', category: 'Vegetables', supplier: 'Kanchipuram Greens', stock: 42, unit: 'kg', price: 38 },
  { name: 'Small onions', sku: 'TN-VG-002', category: 'Vegetables', supplier: 'Perambalur Farmers', stock: 23, unit: '500 g', price: 70 },
  { name: 'Purple brinjal', sku: 'TN-VG-003', category: 'Vegetables', supplier: 'Madurai Market Garden', stock: 20, unit: '500 g', price: 38 },
  { name: 'Fresh okra', sku: 'TN-VG-004', category: 'Vegetables', supplier: 'Kanchipuram Greens', stock: 18, unit: '500 g', price: 35 },
  { name: 'Drumstick (murungakkai)', sku: 'TN-VG-005', category: 'Vegetables', supplier: 'Madurai Market Garden', stock: 17, unit: '250 g', price: 40 },
  { name: 'Carrots', sku: 'TN-VG-006', category: 'Vegetables', supplier: 'Ooty Vegetable Farms', stock: 25, unit: '500 g', price: 36 },
  { name: 'Potatoes', sku: 'TN-VG-007', category: 'Vegetables', supplier: 'Ooty Vegetable Farms', stock: 33, unit: '1 kg', price: 46 },
  { name: 'Cucumber', sku: 'TN-VG-008', category: 'Vegetables', supplier: 'Kanchipuram Greens', stock: 21, unit: '500 g', price: 32 },
]

async function writeProducts(products: Product[]) {
  await mkdir(dirname(databasePath), { recursive: true })
  await writeFile(databasePath, `${JSON.stringify(products, null, 2)}\n`, 'utf8')
}

async function readProducts(): Promise<Product[]> {
  try {
    return JSON.parse(await readFile(databasePath, 'utf8')) as Product[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const products = seedProducts.map((product) => ({ ...product, id: randomUUID() }))
    await writeProducts(products)
    return products
  }
}

function cleanProduct(input: Partial<Product>) {
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const sku = typeof input.sku === 'string' ? input.sku.trim() : ''
  const category = typeof input.category === 'string' ? input.category.trim() : ''
  const supplier = typeof input.supplier === 'string' ? input.supplier.trim() : ''
  const unit = typeof input.unit === 'string' ? input.unit.trim() : ''
  const stock = Number(input.stock)
  const price = Number(input.price)
  if (!name || !sku || !category || !supplier || !unit || !Number.isFinite(stock) || stock < 0 || !Number.isFinite(price) || price < 0) return null
  return { name, sku, category, supplier, unit, stock: Math.floor(stock), price }
}

app.use(cors())
app.use(express.json())

app.get('/api/products', async (request, response) => {
  const products = await readProducts()
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? '1'), 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(request.query.limit ?? '8'), 10) || 8))
  const search = String(request.query.search ?? '').trim().toLocaleLowerCase()
  const category = String(request.query.category ?? '')
  const availability = String(request.query.availability ?? '')
  const requestedSort = String(request.query.sort ?? 'name-asc')
  const sort = ['name-asc', 'name-desc', 'price-asc', 'price-desc'].includes(requestedSort) ? requestedSort : 'name-asc'
  const filtered = products.filter((product) => {
    const matchesSearch = !search || [product.name, product.sku, product.supplier].some((value) => value.toLocaleLowerCase().includes(search))
    const matchesAvailability = availability !== 'in-stock' || product.stock > 0
    return matchesSearch && matchesAvailability && (!category || product.category === category)
  }).sort((first, second) => {
    if (sort === 'price-asc') return first.price - second.price || first.name.localeCompare(second.name)
    if (sort === 'price-desc') return second.price - first.price || first.name.localeCompare(second.name)
    return sort === 'name-desc' ? second.name.localeCompare(first.name) : first.name.localeCompare(second.name)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * limit
  response.json({ items: filtered.slice(start, start + limit), page: currentPage, limit, total: filtered.length, totalPages })
})

app.get('/api/summary', async (_request, response) => {
  const products = await readProducts()
  response.json({
    totalProducts: products.length,
    inventoryValue: products.reduce((total, product) => total + product.stock * product.price, 0),
    lowStock: products.filter((product) => product.stock <= 12).length,
    categoryCount: new Set(products.map((product) => product.category)).size,
  })
})

app.post('/api/products', async (request, response) => {
  const input = cleanProduct(request.body as Partial<Product>)
  if (!input) return response.status(400).json({ error: 'Enter all fields and use valid non-negative stock and price.' })
  const products = await readProducts()
  if (products.some((product) => product.sku.toLocaleLowerCase() === input.sku.toLocaleLowerCase())) return response.status(409).json({ error: 'That SKU is already in use.' })
  const product = { ...input, id: randomUUID() }
  products.push(product)
  await writeProducts(products)
  return response.status(201).json(product)
})

app.patch('/api/products/:id', async (request, response) => {
  const input = cleanProduct(request.body as Partial<Product>)
  if (!input) return response.status(400).json({ error: 'Enter all fields and use valid non-negative stock and price.' })
  const products = await readProducts()
  const index = products.findIndex((product) => product.id === request.params.id)
  if (index < 0) return response.status(404).json({ error: 'Product not found.' })
  if (products.some((product, productIndex) => productIndex !== index && product.sku.toLocaleLowerCase() === input.sku.toLocaleLowerCase())) return response.status(409).json({ error: 'That SKU is already in use.' })
  const updated = { ...input, id: products[index].id }
  products[index] = updated
  await writeProducts(products)
  return response.json(updated)
})

app.delete('/api/products/:id', async (request, response) => {
  const products = await readProducts()
  const remaining = products.filter((product) => product.id !== request.params.id)
  if (remaining.length === products.length) return response.status(404).json({ error: 'Product not found.' })
  await writeProducts(remaining)
  return response.status(204).end()
})

app.post('/api/orders', async (request, response) => {
  const body = (request.body ?? {}) as Record<string, unknown>
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const address = typeof body.address === 'string' ? body.address.trim() : ''
  const instructions = typeof body.instructions === 'string' ? body.instructions.trim() : ''
  if (!customerName || !/^[6-9]\d{9}$/.test(phone) || address.length < 12 || address.length > 500 || instructions.length > 250) {
    return response.status(400).json({ error: 'Enter your name, a valid 10-digit Indian mobile number, and a complete delivery address.' })
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return response.status(400).json({ error: 'Your basket must contain between 1 and 30 products.' })
  }

  const quantities = new Map<string, number>()
  for (const value of body.items) {
    if (!value || typeof value !== 'object') return response.status(400).json({ error: 'The basket contains an invalid item.' })
    const item = value as Record<string, unknown>
    if (typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || Number(item.quantity) < 1) {
      return response.status(400).json({ error: 'Each basket item needs a product and a positive whole-number quantity.' })
    }
    const quantity = (quantities.get(item.productId) ?? 0) + Number(item.quantity)
    if (quantity > 50) return response.status(400).json({ error: 'A maximum of 50 units per product can be ordered.' })
    quantities.set(item.productId, quantity)
  }

  const products = await readProducts()
  const selected: Array<{ id: string; name: string; category: string; quantity: number; unit: string; unitPrice: number }> = []
  for (const [productId, quantity] of quantities) {
    const product = products.find((item) => item.id === productId)
    if (!product) return response.status(404).json({ error: 'A product in your basket is no longer available. Please refresh your basket.' })
    if (product.stock < quantity) return response.status(409).json({ error: `Only ${product.stock} ${product.unit} of ${product.name} are currently available.` })
    selected.push({ id: product.id, name: product.name, category: product.category, quantity, unit: product.unit, unitPrice: product.price })
  }

  const subtotal = selected.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const deliveryFee = subtotal >= 50 ? 0 : 40
  const orderNumber = `NG-${Date.now().toString(36).toUpperCase()}`
  const order = {
    id: randomUUID(),
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName,
    phone,
    address,
    instructions,
    paymentMethod: 'Cash on delivery',
    status: 'placed',
    items: selected,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }

  let orders: Array<typeof order> = []
  try {
    orders = JSON.parse(await readFile(ordersPath, 'utf8')) as typeof orders
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  for (const { id, quantity } of selected) {
    const product = products.find((item) => item.id === id)!
    product.stock -= quantity
  }
  await writeProducts(products)
  orders.push(order)
  await mkdir(dirname(ordersPath), { recursive: true })
  await writeFile(ordersPath, `${JSON.stringify(orders, null, 2)}\n`, 'utf8')
  return response.status(201).json({ orderNumber, subtotal, deliveryFee, total: order.total })
})

app.post('/api/contact', async (request, response) => {
  const { name, email, topic, message } = request.body as Record<string, unknown>
  if (typeof name !== 'string' || typeof email !== 'string' || typeof topic !== 'string' || typeof message !== 'string') {
    return response.status(400).json({ error: 'Complete each contact field.' })
  }
  const contact = {
    name: name.trim(),
    email: email.trim(),
    topic: topic.trim(),
    message: message.trim(),
  }
  if (!contact.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || !contact.topic || contact.message.length < 8 || contact.message.length > 2000) {
    return response.status(400).json({ error: 'Check the name, email, topic, and message and try again.' })
  }
  let messages: Array<typeof contact & { id: string; createdAt: string }> = []
  try {
    messages = JSON.parse(await readFile(messagesPath, 'utf8')) as typeof messages
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
  messages.push({ ...contact, id: randomUUID(), createdAt: new Date().toISOString() })
  await mkdir(dirname(messagesPath), { recursive: true })
  await writeFile(messagesPath, `${JSON.stringify(messages, null, 2)}\n`, 'utf8')
  return response.status(201).json({ message: 'Contact message received.' })
})

export default app

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath === fileURLToPath(import.meta.url)) {
  app.listen(port, () => console.log(`Inventory API listening on http://localhost:${port}`))
}
