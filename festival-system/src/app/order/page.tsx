'use client'
import { useState, useEffect, useCallback, useRef } from 'react' // useRefを追加
import { supabase } from '@/lib/supabase'
import { Minus, Plus, Trash2, Clock, CheckCircle2, ShoppingBag } from 'lucide-react'

interface Menu { id: number; name: string; price: number; stock: number; prep_time: number; }
interface CartItem { id: number; name: string; qty: number; price: number; }

export default function OrderPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitTime, setWaitTime] = useState(0)
  const [lastOrder, setLastOrder] = useState<{ id: number } | null>(null)

  // 【最重要】二重送信を物理的に防ぐためのフラグ
  const isSubmitting = useRef(false)

  const fetchData = useCallback(async () => {
    const { data: menuData } = await supabase.from('menus').select('*').order('id')
    if (menuData) setMenus(menuData as Menu[])
    const { data: waitData } = await supabase.from('orders').select('order_items(quantity,menus(prep_time))').neq('status', 'completed')
    if (waitData) {
      let totalMinutes = 0
      const typedWaitData = waitData as any[]
      typedWaitData.forEach(o => o.order_items.forEach((i: any) => totalMinutes += (i.menus?.prep_time || 0) * i.quantity))
      setWaitTime(Math.ceil(totalMinutes / 2))
    }
  }, [])

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('m-real').on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, () => { void fetchData() }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [fetchData])

  const addToCart = (item: Menu | CartItem) => {
    const target = menus.find(m => m.id === item.id)
    if (target && target.stock <= 0) return
    setCart(prev => {
      const exist = prev.find(i => i.id === item.id)
      if (exist) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: item.id, name: item.name, qty: 1, price: item.price }]
    })
  }

  const decreaseQty = (id: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty - 1) } : item))
  }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault(); // フォームのデフォルト動作を完全に停止

    // 【1】すでに送信中なら絶対に何もしない
    if (isSubmitting.current || cart.length === 0) return
    
    isSubmitting.current = true // 即座にロック
    setLoading(true)
    
    try {
      // 【2】カートの重複をここで強制的に排除して1つにまとめる
      const uniqueItems = Array.from(new Map(cart.map(item => [item.id, item])).values());
      const total = uniqueItems.reduce((s, i) => s + i.price * i.qty, 0)

      // 【3】orders の作成
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ customer_memo: memo, total_price: total, status: 'pending' }])
        .select()

      if (orderError || !orderData || orderData.length === 0) throw orderError
      const orderId = orderData[0].id

      // 【4】order_items の作成（一括で送る）
      const orderItems = uniqueItems.map(item => ({
        order_id: orderId,
        menu_id: item.id,
        quantity: item.qty
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      // 【5】在庫の減算
      for (const item of uniqueItems) {
        await supabase.rpc('decrement_stock', { row_id: item.id, quantity_to_sub: item.qty })
      }

      setLastOrder({ id: orderId })
      setCart([])
      setMemo('')
      await fetchData()
    } catch (err) {
      console.error(err)
      alert('エラーが発生しました')
      isSubmitting.current = false // 失敗した時だけロックを解除
    } finally {
      setLoading(false)
    }
  }

  if (lastOrder) {
    return (
      <div className="h-screen bg-orange-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle2 size={120} className="mb-6 animate-bounce" />
        <h1 className="text-4xl font-black mb-2 font-sans">ご注文ありがとうございます！</h1>
        <div className="bg-white text-orange-600 rounded-3xl p-10 shadow-2xl mb-10 w-full max-w-sm">
          <p className="text-sm font-bold mb-1">受付番号</p>
          <p className="text-8xl font-black">#{lastOrder.id}</p>
        </div>
        <button onClick={() => { isSubmitting.current = false; setLastOrder(null); }} className="bg-white text-orange-600 px-10 py-5 rounded-full text-2xl font-bold shadow-lg">次の注文へ</button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 overflow-hidden">
      {/* メニューエリア */}
      <div className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-y-auto">
        {menus.map(menu => (
          <button key={menu.id} onClick={() => addToCart(menu)} disabled={menu.stock <= 0 || loading} className={`h-40 bg-white shadow rounded-2xl border-2 ${menu.stock <= 0 ? 'opacity-50 grayscale' : 'border-orange-200 active:scale-95'}`}>
            <span className="text-xl font-bold block">{menu.name}</span>
            <span className="text-orange-600 font-bold">{menu.price}円</span>
            <span className="text-xs text-gray-500 block">在庫: {menu.stock}</span>
          </button>
        ))}
      </div>

      {/* カートエリア */}
      <div className="w-96 bg-white shadow-xl p-6 flex flex-col border-l">
        <h2 className="text-2xl font-bold border-b pb-4 mb-4">注文カート</h2>
        <div className="flex-1 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="py-2 border-b flex justify-between items-center text-black font-bold">
              <span>{item.name} x {item.qty}</span>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
        <form onSubmit={submitOrder} className="mt-4 pt-4 border-t">
          <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="客の特徴" className="border p-3 mb-4 rounded-xl w-full text-black" disabled={loading} />
          <button type="submit" disabled={cart.length === 0 || loading} className={`w-full py-5 rounded-2xl text-2xl font-bold shadow-lg ${loading ? 'bg-gray-400' : 'bg-orange-500 text-white'}`}>
            {loading ? '送信中...' : '注文を確定する'}
          </button>
        </form>
      </div>
    </div>
  )
}