'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Clock, PlayCircle, History, ClipboardList } from 'lucide-react'

interface OrderResponse {
  id: number;
  customer_memo: string | null;
  status: string;
  created_at: string;
  order_items: {
    quantity: number;
    menus: {
      name: string;
    } | null;
  }[];
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active')
  
  // --- 【新設】1分ごとに更新するためのステート ---
  const [now, setNow] = useState(new Date())

  const fetchOrders = useCallback(async () => {
    let query = supabase
      .from('orders')
      .select(`
        id, customer_memo, status, created_at,
        order_items ( quantity, menus ( name ) )
      `)

    if (viewMode === 'active') {
      query = query.neq('status', 'completed').order('created_at', { ascending: true })
    } else {
      query = query.eq('status', 'completed').order('created_at', { ascending: false }).limit(50)
    }

    const { data, error } = await query
    if (data) setOrders(data as unknown as OrderResponse[])
    if (error) console.error(error)
  }, [viewMode])

  useEffect(() => {
    (async () => { await fetchOrders() })()

    // 1. リアルタイムDB監視
    const channel = supabase.channel('kitchen-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { void fetchOrders() })
      .subscribe()

    // 2. 【重要】1分ごとに「現在時刻」を更新するタイマー
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000) // 60000ms = 1分

    return () => { 
      void supabase.removeChannel(channel)
      clearInterval(timer) // クリーンアップ
    }
  }, [fetchOrders])

  const updateStatus = async (orderId: number, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    await fetchOrders()
  }

  // 時刻表示用
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // --- 【修正】引数に now を使うように変更 ---
  const getWaitTime = (createdAt: string) => {
    const diffMs = now.getTime() - new Date(createdAt).getTime()
    // 60000ms（1分）で割り、Math.max(0, ...) で最低値を0に固定する
    const diffMin = Math.floor(diffMs / 60000)
    return `${Math.max(0, diffMin)}分`
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pr-16">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          {viewMode === 'active' ? <Clock className="text-orange-500" /> : <History className="text-emerald-500" />}
          {viewMode === 'active' ? 'キッチンモニター' : '提供済み履歴'}
        </h1>

        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-xl">
          <button onClick={() => setViewMode('active')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'active' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <ClipboardList size={20} /> 稼働中
          </button>
          <button onClick={() => setViewMode('history')} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${viewMode === 'history' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
            <CheckCircle size={20} /> 履歴
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-gray-900">
        {orders.map((order) => (
          <div key={order.id} className={`flex flex-col rounded-2xl p-5 border-t-8 shadow-2xl bg-slate-800 ${order.status === 'pending' ? 'border-red-500' : order.status === 'cooking' ? 'border-yellow-500' : 'border-emerald-500 opacity-90'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-4xl font-black text-slate-500">#{order.id}</span>
                <p className="text-xs text-slate-400 font-bold mt-1 tracking-widest">{formatTime(order.created_at)} 注文</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-black uppercase shadow-inner ${
                  order.status === 'pending' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {/* ここが1分ごとに自動更新されます */}
                  {getWaitTime(order.created_at)} 経過
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-orange-400 font-bold mb-1 text-xs uppercase tracking-wider">Memo</p>
              <p className="text-xl bg-white p-3 rounded-xl font-black shadow-inner min-h-[3rem]">
                {order.customer_memo || "---"}
              </p>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider font-mono">Order List</p>
              {order.order_items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-2xl border-b border-slate-700/50 pb-1 text-white">
                  <span className="font-bold">{item.menus?.name || '不明'}</span>
                  <span className="font-black text-yellow-400 text-3xl">×{item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-auto pt-4">
              {order.status === 'pending' && (
                <button onClick={() => { void updateStatus(order.id, 'cooking') }} className="flex-1 bg-yellow-600 hover:bg-yellow-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xl text-white shadow-lg active:scale-95 transition-all">
                  <PlayCircle /> 調理開始
                </button>
              )}
              {order.status === 'cooking' && (
                <button onClick={() => { void updateStatus(order.id, 'completed') }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xl text-white shadow-lg active:scale-95 transition-all">
                  <CheckCircle /> 調理完了
                </button>
              )}
              {order.status === 'completed' && (
                <button onClick={() => { void updateStatus(order.id, 'cooking') }} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-xl font-bold text-xs text-slate-400">
                  調理中に戻す
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}