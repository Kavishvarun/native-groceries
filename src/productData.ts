export type Product = {
  id: string
  name: string
  sku: string
  category: string
  supplier: string
  stock: number
  unit: string
  price: number
}

export type ProductPage = {
  items: Product[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const categories = ['All groceries', 'Rice & Grains', 'Pulses', 'Wheat & Flours', 'Chocolate', 'Biscuits', 'Cookies', 'Beverages', 'Dairy Products', 'Home Care', 'Toiletries', 'Beauty Products', 'Leafy Greens', 'Fruits', 'Vegetables']
export const currentYear = new Date().getFullYear()
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)

const categoryImages: Record<string, string> = {
  'Rice & Grains': '36346840',
  'Wheat & Flours': '6294374',
  Chocolate: '32402905',
  Biscuits: '31909870',
  Cookies: '15290322',
  Beverages: '29851973',
  'Dairy Products': '6585008',
  'Home Care': '28576621',
  Toiletries: '7440056',
  'Beauty Products': '5632335',
  'Leafy Greens': '38571502',
  Fruits: '3084068',
  Vegetables: '5425794',
}

const productImagesBySku: Record<string, string> = {
  'TN-RC-001': '36346840',
  'TN-RC-002': '7665442',
  'TN-RC-003': '38473601',
  'TN-RC-004': '6086556',
  'TN-RC-005': '7421207',
  'TN-RC-006': '18328392',
  'TN-RC-007': '10738421',
  'TN-RC-008': '5601957',
  'TN-PL-001': '11107219',
  'TN-PL-002': '28110905',
  'TN-PL-003': '36021103',
  'TN-PL-004': '35553032',
  'TN-PL-005': '11369845',
  'TN-WF-001': '32525228',
  'TN-WF-002': '6287581',
  'TN-WF-003': '6294374',
  'TN-WF-004': '11726089',
  'TN-WF-005': '6287219',
  'TN-WF-006': '11292843',
  'TN-CH-001': '32402905',
  'TN-CH-002': '39150141',
  'TN-CH-003': '4113363',
  'TN-CH-004': '4157763',
  'TN-CH-005': '6167328',
  'TN-CH-006': '4113295',
  'TN-CH-007': '8794060',
  'TN-CH-008': '14456511',
  'TN-CH-009': '4113345',
  'TN-BI-001': '31909870',
  'TN-BI-002': '39852860',
  'TN-BI-003': '37108654',
  'TN-CO-001': '35156663',
  'TN-CO-002': '5847103',
  'TN-CO-003': '15290322',
  'TN-BV-001': '16682442',
  'TN-BV-002': '14456919',
  'TN-BV-003': '29851973',
  'TN-BV-004': '8679336',
  'TN-BV-005': '8679349',
  'TN-BV-006': '5946781',
  'TN-BV-007': '4443492',
  'TN-DA-001': '4110199',
  'TN-DA-002': '566564',
  'TN-DA-003': '5947034',
  'TN-DA-004': '14326683',
  'TN-DA-005': '7965886',
  'TN-DA-006': '6585008',
  'TN-DA-007': '5946755',
  'TN-HC-001': '28576621',
  'TN-HC-002': '9462107',
  'TN-TL-001': '8167172',
  'TN-TL-002': '20849460',
  'TN-TL-003': '7440056',
  'TN-TL-004': '13516802',
  'TN-BP-001': '5632335',
  'TN-BP-002': '23228944',
  'TN-LG-001': '36251133',
  'TN-LG-002': '11509871',
  'TN-LG-003': '38571502',
  'TN-LG-004': '6280538',
  'TN-LG-005': '37215213',
  'TN-FR-001': '36204961',
  'TN-FR-002': '20987903',
  'TN-FR-003': '38542293',
  'TN-FR-004': '13306351',
  'TN-FR-005': '14627193',
  'TN-FR-006': '22468360',
  'TN-FR-007': '20274555',
  'TN-VG-001': '17674119',
  'TN-VG-002': '31834230',
  'TN-VG-003': '5425794',
  'TN-VG-004': '37321079',
  'TN-VG-005': '39206252',
  'TN-VG-006': '5425893',
  'TN-VG-007': '9098814',
  'TN-VG-008': '39154015',
}

export function productImage(product: Pick<Product, 'sku' | 'category'>) {
  const photo = productImagesBySku[product.sku] ?? categoryImages[product.category] ?? categoryImages.Vegetables
  return `https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=900`
}
