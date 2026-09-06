import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { base44 } from '@/api/base44Client'
import { Package, ShoppingBag, Plus, Search, Trash2 } from 'lucide-react'
import PageHeader from '@/components/site/PageHeader'
import ProductForm from '@/components/admin/ProductForm'

export default function AdminProducts() {
  const qc = useQueryClient()
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.filter({}, '-created_date', 100),
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const openNew = () => { setEditing(null); setShowForm(true) }
  const openEdit = (p) => { setEditing(p); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const toggleActive = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { active: !product.active })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    } catch (err) {
      console.error('Failed to toggle product active', err)
    }
  }

  const toggleOutOfStock = async (product) => {
    try {
      await base44.entities.Product.update(product.id, { out_of_stock: !product.out_of_stock })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    } catch (err) {
      console.error('Failed to update product stock status', err)
    }
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name || 'Untitled product'}"?`)) return

    try {
      await base44.entities.Product.delete(product.id)
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }

  return (
    <div className="space-y-8 py-10">
      <PageHeader
        title="Products"
        description="Manage product catalogue and stock from the admin dashboard."
        icon={Package}
      />
      <section className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
            <span>Admin product overview ({products?.length || 0})</span>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-1/3 rounded-full bg-slate-200" />
            <div className="h-4 w-1/2 rounded-full bg-slate-200" />
          </div>
        ) : (
          <div className="grid gap-4">
            {products?.length ? (
              products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div onClick={() => openEdit(product)} className="flex min-w-0 cursor-pointer items-center gap-4">
                      <div className="h-16 w-12 shrink-0 overflow-hidden bg-muted">
                        {product.cover_image || product.images?.[0] ? (
                          <img
                            src={product.cover_image || product.images[0]}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] uppercase text-muted-foreground">No image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{product.name || 'Untitled product'}</p>
                        <p className="truncate text-sm text-muted-foreground">{product.slug || 'No slug'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => toggleOutOfStock(product)}
                        className={`underline underline-offset-2 ${product.out_of_stock ? 'text-red-700' : 'text-foreground/60 hover:text-foreground'}`}
                      >
                        {product.out_of_stock ? 'Out of stock' : 'In stock'}
                      </button>
                      <div className={`flex items-center gap-2 ${product.active ? 'text-emerald-700' : 'text-foreground/60'}`}>
                        <Search className="h-4 w-4" />
                        <button onClick={() => toggleActive(product)} className="text-sm underline underline-offset-2">
                          {product.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="inline-flex items-center gap-1.5 text-sm text-red-700 hover:text-red-800"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                No products found.
              </div>
            )}
          </div>
        )}
      </section>
      {showForm && <ProductForm product={editing} onClose={closeForm} />}
    </div>
  )
}
