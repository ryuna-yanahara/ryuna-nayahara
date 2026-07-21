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
  
  // 注文完了後の情報を保持するステート
  const [lastOrder, setLastOrder] = useState<{ id: number } | null>(null)

  const fetchData = useCallback(async () => {
    // メニュー取得（在庫が0のものも含めて取得し、UIで出し分ける）
    const { data: menuData } = await supabase.from('menus').select('*').order('id')
    if (menuData) setMenus(menuData as Menu[])

    // 待ち時間計算
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
  }, [fetchData])

  const addToCart = (item: Menu | CartItem) => {
    // 在庫チェック（メニューから追加する場合のみ）
    const targetMenu = menus.find(m => m.id === item.id)
    if (targetMenu && targetMenu.stock <= 0) return

    setCart(prev => {
      const exist = prev.find(i => i.id === item.id)
      if (exist) {
        // カート内の数＋1 が在庫を超えないかチェック
        if (targetMenu && exist.qty >= targetMenu.stock) {
          alert('在庫数を超えて注文することはできません')
          return prev
        }
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

   const submitOrder = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      // 1. 注文(orders)の作成
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ customer_memo: memo, total_price: total, status: 'pending' }])
        .select()

      if (orderError || !orderData) throw orderError

      

     const orderItems = cart.map(item => ({
        order_id: orderData[0].id,
        menu_id: item.id,
        quantity: item.qty
      }))
      await supabase.from('order_items').insert(orderItems)

      await supabase.from('order_items').insert(orderItems)

      // 在庫減算処理
       for (const item of cart) {
        const { error: rpcError } = await supabase.rpc('decrement_stock', {
          row_id: item.id,
          quantity_to_sub: item.qty
        })
        if (rpcError) console.error('在庫更新エラー:', rpcError)
      }

      // 完了画面を表示するために注文IDを保存
      setLastOrder({ id: orderData[0].id })
      setCart([])
      setMemo('')
      await fetchData() // メニュー情報を再取得して表示を更新
    } catch (e) {
      console.error(e)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // --- 注文完了画面（サンクスページ） ---
  if (lastOrder) {
    return (
      <div className="h-screen bg-orange-500 flex flex-col items-center justify-center p-6 text-white text-center">
        <CheckCircle2 size={120} className="mb-6 animate-bounce" />
        <h1 className="text-4xl font-black mb-2">ご注文ありがとうございます！</h1>
        <p className="text-xl opacity-90 mb-8">お料理ができるまでそのままお待ちください</p>
        
        <div className="bg-white text-orange-600 rounded-3xl p-10 shadow-2xl mb-10 w-full max-w-sm">
          <p className="text-sm font-bold uppercase tracking-widest mb-1">受付番号</p>
          <p className="text-8xl font-black">#{lastOrder.id}</p>
        </div>

        <button 
          onClick={() => setLastOrder(null)}
          className="bg-white text-orange-600 px-10 py-5 rounded-full text-2xl font-bold shadow-lg hover:bg-orange-50 transition-colors flex items-center gap-2"
        >
          <ShoppingBag /> 次の注文へ
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* 左側：メニュー選択 */}
      <div className="flex-1 p-4 grid grid-cols-3 gap-4 overflow-y-auto">
        {menus.map(menu => {
          const isSoldOut = menu.stock <= 0
          return (
            <button 
              key={menu.id} 
              onClick={() => !isSoldOut && addToCart(menu)} 
              disabled={isSoldOut}
              className={`relative h-40 shadow-md rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                isSoldOut 
                  ? 'bg-gray-200 border-gray-300 grayscale cursor-not-allowed' 
                  : 'bg-white border-orange-200 active:scale-95'
              }`}
            >
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-black text-2xl rotate-[-10deg] shadow-xl border-2 border-white">完売 / SOLD OUT</span>
                </div>
              )}
              <span className="text-xl font-bold">{menu.name}</span>
              <span className="text-orange-600 font-bold">{menu.price}円</span>
              <span className="text-sm text-gray-500">在庫: {menu.stock}</span>
            </button>
          )
        })}
      </div>

      {/* 右側：注文確認 */}
      <div className="w-96 bg-white shadow-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold border-b pb-4 mb-4">注文カート</h2>
        
        <div className="bg-orange-50 p-4 rounded-xl mb-4 border border-orange-200 flex items-center gap-3">
          <Clock className="text-orange-500" />
          <div>
            <p className="text-orange-800 text-xs font-bold uppercase">予想待ち時間</p>
            <p className="text-2xl font-black text-orange-600">約 {waitTime} 分</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="py-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg">{item.name}</span>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={20} /></button>
              </div>
              <div className="flex justify-between items-center text-black">
                <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => decreaseQty(item.id)} className="p-2 bg-white rounded shadow text-black"><Minus size={16}/></button>
                  <span className="text-xl font-bold w-8 text-center">{item.qty}</span>
                  <button onClick={() => addToCart(item)} className="p-2 bg-white rounded shadow text-black"><Plus size={16}/></button>
                </div>
                <span className="text-lg font-bold">{item.price * item.qty}円</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-2xl font-bold mb-4">
            <span>合計</span>
            <span>{cart.reduce((s, i) => s + i.price * i.qty, 0)}円</span>
          </div>
          <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="客の特徴" className="border-2 p-3 mb-4 rounded-xl w-full text-black" />
          <button 
            onClick={() => { void submitOrder() }} 
            disabled={cart.length === 0 || loading} 
            className="w-full bg-orange-500 text-white py-5 rounded-2xl text-2xl font-bold shadow-lg disabled:bg-gray-300"
          >
            {loading ? '送信中...' : '注文を確定する'}
          </button>
        </div>
      </div>
    </div>
  )
}