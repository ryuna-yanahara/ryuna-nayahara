'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Minus, Plus, Trash2, Clock, CheckCircle2, ShoppingBag } from 'lucide-react'

interface Menu {
  id: number; name: string; price: number; stock: number; prep_time: number;
}

interface CartItem {
  id: number; name: string; qty: number; price: number;
}

interface OrderWaitInfo {
  order_items: {
    quantity: number;
    menus: { prep_time: number } | null;
  }[];
}

export default function OrderPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitTime, setWaitTime] = useState(0)
  const [lastOrder, setLastOrder] = useState<{ id: number } | null>(null)

  const fetchData = useCallback(async () => {
    const { data: menuData } = await supabase.from('menus').select('*').order('id')
    if (menuData) setMenus(menuData as Menu[])

    const { data: waitData } = await supabase
      .from('orders')
      .select('order_items ( quantity, menus ( prep_time ) )')
      .neq('status', 'completed')
    
    if (waitData) {
      const typedWaitData = waitData as unknown as OrderWaitInfo[]
      let totalMinutes = 0
      typedWaitData.forEach(order => {
        order.order_items.forEach(item => {
          totalMinutes += (item.menus?.prep_time || 0) * item.quantity
        })
      })
      setWaitTime(Math.ceil(totalMinutes / 2))
    }
  }, [])

  useEffect(() => {
    const init = async () => { await fetchData() }
    void init()

    const channel = supabase.channel('menu-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, () => { void fetchData() })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [fetchData])

  const addToCart = (item: Menu | CartItem) => {
    const targetMenu = menus.find(m => m.id === item.id)
    if (targetMenu && targetMenu.stock <= 0) return

    setCart(prev => {
      const exist = prev.find(i => i.id === item.id)
      if (exist) {
        if (targetMenu && exist.qty >= targetMenu.stock) return prev
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, qty: 1, price: item.price }]
    })
  }

  const decreaseQty = (id: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item
    ))
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  // --- 注文確定処理（重複防止強化版） ---
  const submitOrder = async () => {
    // すでに処理中なら何もしない（連打防止）
    if (loading || cart.length === 0) return
    
    setLoading(true)
    
    try {
      // 1. カート内の重複を念のためここで最終合算する
      const consolidatedCart: Record<number, CartItem> = {}
      cart.forEach(item => {
        if (consolidatedCart[item.id]) {
          consolidatedCart[item.id].qty += item.qty
        } else {
          consolidatedCart[item.id] = { ...item }
        }
      })
      const finalCartItems = Object.values(consolidatedCart)
      const total = finalCartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)

      // 2. 注文(orders)の作成
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ customer_memo: memo, total_price: total, status: 'pending' }])
        .select()

      if (orderError || !orderData || orderData.length === 0) throw orderError

      const orderId = orderData[0].id

      // 3. 注文明細(order_items)の一括作成
      const orderItemsToInsert = finalCartItems.map(item => ({
        order_id: orderId,
        menu_id: item.id,
        quantity: item.qty
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert)
      if (itemsError) throw itemsError

      // 4. 在庫の減算
      for (const item of finalCartItems) {
        await supabase.rpc('decrement_stock', {
          row_id: item.id,
          quantity_to_sub: item.qty
        })
      }

      // 5. 成功時のリセット
      setLastOrder({ id: orderId })
      setCart([])
      setMemo('')
      await fetchData()
    } catch (e) {
      console.error('注文エラー:', e)
      alert('注文処理中にエラーが発生しました。もう一度お試しください。')
    } finally {
      // 少し間を置いてからロックを解除（より安全に）
      setTimeout(() => setLoading(false), 1000)
    }
  }

  if (lastOrder) {
    return (
      <div className="h-screen bg-orange-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle2 size={120} className="mb-6 animate-bounce" />
        <h1 className="text-4xl font-black mb-2">ご注文ありがとうございます！</h1>
        <div className="bg-white text-orange-600 rounded-3xl p-10 shadow-2xl mb-10 w-full max-w-sm">
          <p className="text-sm font-bold mb-1">受付番号</p>
          <p className="text-8xl font-black">#{lastOrder.id}</p>
        </div>
        <button onClick={() => setLastOrder(null)} className="bg-white text-orange-600 px-10 py-5 rounded-full text-2xl font-bold shadow-lg hover:bg-orange-50 flex items-center gap-2">
          <ShoppingBag /> 次の注文へ
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 overflow-hidden">
      <div className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-y-auto">
        {menus.map(menu => {
          const isSoldOut = menu.stock <= 0
          return (
            <button key={menu.id} onClick={() => !isSoldOut && !loading && addToCart(menu)} disabled={isSoldOut || loading} className={`relative h-40 shadow-md rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${isSoldOut ? 'bg-gray-200 border-gray-300 grayscale cursor-not-allowed' : 'bg-white border-orange-200 active:scale-95'}`}>
              {isSoldOut && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"><span className="bg-red-600 text-white px-4 py-2 rounded-lg font-black text-2xl rotate-[-10deg] border-2 border-white uppercase">完売</span></div>}
              <span className="text-xl font-bold">{menu.name}</span>
              <span className="text-orange-600 font-bold">{menu.price}円</span>
              <span className="text-sm text-gray-500 font-mono">在庫: {menu.stock}</span>
            </button>
          )
        })}
      </div>

      <div className="w-96 bg-white shadow-xl p-6 flex flex-col border-l border-gray-200">
        <h2 className="text-2xl font-bold border-b pb-4 mb-4 flex items-center gap-2"><ShoppingBag className="text-orange-500" /> 注文カート</h2>
        <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-200 flex items-center gap-3">
          <Clock className="text-orange-500" /><div className="font-bold"><p className="text-orange-800 text-xs uppercase">Wait Time</p><p className="text-2xl text-orange-600">約 {waitTime} 分</p></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="py-4 border-b">
              <div className="flex justify-between items-start mb-2"><span className="font-bold text-lg">{item.name}</span><button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={20} /></button></div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => decreaseQty(item.id)} className="p-2 bg-white rounded shadow" disabled={loading}><Minus size={16}/></button>
                  <span className="text-xl font-bold w-8 text-center">{item.qty}</span>
                  <button onClick={() => addToCart(item)} className="p-2 bg-white rounded shadow" disabled={loading}><Plus size={16}/></button>
                </div>
                <span className="text-lg font-bold">{item.price * item.qty}円</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-2xl font-bold mb-4"><span>合計</span><span>{cart.reduce((s, i) => s + i.price * i.qty, 0)}円</span></div>
          <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="客の特徴（メモ）" className="border-2 p-3 mb-4 rounded-xl w-full text-black outline-none focus:border-orange-500" disabled={loading} />
          <button onClick={() => { void submitOrder() }} disabled={cart.length === 0 || loading} className={`w-full py-5 rounded-2xl text-2xl font-bold shadow-lg transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white active:scale-95 hover:bg-orange-600'}`}>
            {loading ? '送信中...' : '注文を確定する'}
          </button>
        </div>
      </div>
    </div>
  )
}