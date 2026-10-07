import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'

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

type ProductPage = {
  items: Product[]
  page: number
  limit: number
  total: number
  totalPages: number
}

async function readProducts(): Promise<Product[]> {
  return JSON.parse(await readFile(new URL('../server/data/products.json', import.meta.url), 'utf8')) as Product[]
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? '/', 'http://localhost')

  if (request.method !== 'GET') {
    sendJson(response, 503, { error: 'Order and inventory updates require persistent database storage.' })
    return
  }

  try {
    const products = await readProducts()

    if (url.pathname.endsWith('/summary')) {
      sendJson(response, 200, {
        totalProducts: products.length,
        inventoryValue: products.reduce((total, product) => total + product.stock * product.price, 0),
        lowStock: products.filter((product) => product.stock <= 12).length,
        categoryCount: new Set(products.map((product) => product.category)).size,
      })
      return
    }

    if (!url.pathname.endsWith('/products')) {
      sendJson(response, 404, { error: 'API endpoint not found.' })
      return
    }

    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get('limit') ?? '8', 10) || 8))
    const search = (url.searchParams.get('search') ?? '').trim().toLocaleLowerCase()
    const category = url.searchParams.get('category') ?? ''
    const inStockOnly = url.searchParams.get('availability') === 'in-stock'
    const requestedSort = url.searchParams.get('sort') ?? 'name-asc'
    const sort = ['name-asc', 'name-desc', 'price-asc', 'price-desc'].includes(requestedSort) ? requestedSort : 'name-asc'

    const filtered = products.filter((product) => {
      const matchesSearch = !search || [product.name, product.sku, product.supplier].some((value) => value.toLocaleLowerCase().includes(search))
      return matchesSearch && (!inStockOnly || product.stock > 0) && (!category || product.category === category)
    }).sort((first, second) => {
      if (sort === 'price-asc') return first.price - second.price || first.name.localeCompare(second.name)
      if (sort === 'price-desc') return second.price - first.price || first.name.localeCompare(second.name)
      return sort === 'name-desc' ? second.name.localeCompare(first.name) : first.name.localeCompare(second.name)
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
    const currentPage = Math.min(page, totalPages)
    const result: ProductPage = {
      items: filtered.slice((currentPage - 1) * limit, currentPage * limit),
      page: currentPage,
      limit,
      total: filtered.length,
      totalPages,
    }
    sendJson(response, 200, result)
  } catch (error) {
    console.error('Unable to load catalog data for Vercel API.', error)
    sendJson(response, 500, { error: 'Unable to load the product catalog.' })
  }
}
