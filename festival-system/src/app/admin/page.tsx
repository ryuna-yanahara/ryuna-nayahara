'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Save, Trash2, TrendingUp, RefreshCcw, AlertTriangle } from 'lucide-react'

interface Menu {
  id: number; name: string; price: number; stock: number; prep_time: number;
}

export default function AdminPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(0)
  const [newStock, setNewStock] = useState(0)
  const [newTime, setNewTime] = useState(5)

  const fetchData = useCallback(async () => {
    const { data: menuData } = await supabase.from('menus').select('*').order('id')
    if (menuData) setMenus(menuData as Menu[])

    const { data: orderData } = await supabase.from('orders').select('total_price')
    if (orderData) {
      setTotalSales(orderData.reduce((sum, order) => sum + (order.total_price || 0), 0))
    }
  }, [])

  useEffect(() => {
    const init = async () => { await fetchData() }
    void init()
  }, [fetchData])

  const addMenu = async () => {
    if (!newName) return
    await supabase.from('menus').insert([{ name: newName, price: newPrice, stock: newStock, prep_time: newTime }])
    setNewName('')
    await fetchData()
  }

  const updateMenu = async (id: number, updates: Partial<Menu>) => {
    await supabase.from('menus').update(updates).eq('id', id)
    await fetchData()
  }

  // 削除機能（エラーハンドリング付き）
  const deleteMenu = async (id: number) => {
    if (!confirm('本当にこのメニューを削除しますか？')) return

    const { error } = await supabase.from('menus').delete().eq('id', id)
    
    if (error) {
      alert('削除できませんでした。\n理由: すでにこの商品の注文データが存在します。代わりに在庫を0にするか、データをリセットしてください。')
      console.error(error)
    } else {
      await fetchData()
    }
  }

  // 【新機能】注文データのみを全削除（リセット）
  const resetOrders = async () => {
    if (!confirm('【警告】すべての注文履歴と売上データを完全に削除し、注文番号を#1にリセットします。よろしいですか？')) return
    if (!confirm('本当の本当によろしいですか？（メニューは消えません）')) return

    try {
      // さきほどSupabaseで作ったSQL関数(RPC)を呼び出す
      const { error } = await supabase.rpc('reset_all_orders_and_identity')
      
      if (error) throw error

      alert('すべてのデータをリセットし、注文番号を#1に戻しました。')
      await fetchData()
    } catch (e) {
      console.error(e)
      alert('リセット中にエラーが発生しました。SQL Editorで関数を作成したか確認してください。')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-black">
            <Save className="text-blue-600" /> 管理画面
          </h1>
          {/* リセットボタン */}
          <button 
            onClick={() => { void resetOrders() }}
            className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors"
          >
            <RefreshCcw size={18} /> 注文データリセット
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border-l-8 border-green-500 flex items-center justify-between">
          <div><p className="text-gray-500 font-bold">売上合計</p><p className="text-4xl font-black text-green-600">¥{totalSales.toLocaleString()}</p></div>
          <TrendingUp size={48} className="text-green-100" />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-black">新規メニュー追加</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 ml-1">商品名</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="border p-2 rounded text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 ml-1">価格</label>
              <input type="number" value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className="border p-2 rounded text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 ml-1">在庫数</label>
              <input type="number" value={newStock} onChange={e => setNewStock(Number(e.target.value))} className="border p-2 rounded text-black" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 ml-1">調理時間(分)</label>
              <input type="number" value={newTime} onChange={e => setNewTime(Number(e.target.value))} className="border p-2 rounded text-black" />
            </div>
            <button onClick={() => { void addMenu() }} className="bg-blue-600 text-white font-bold h-10 self-end rounded-xl flex items-center justify-center gap-2">
              <Plus size={20} /> 追加
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr className="text-gray-600 uppercase text-sm">
                <th className="p-4">商品名</th>
                <th className="p-4">価格</th>
                <th className="p-4">在庫</th>
                <th className="p-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
  {menus.map(menu => {
    // 在庫が0かどうか判定
    const isSoldOut = menu.stock <= 0;

    return (
      <tr 
        key={menu.id} 
        // 在庫0なら bg-red-100 (薄い赤) に、そうでなければ白かホバー時の色にする
        className={`border-t transition-colors ${
          isSoldOut ? 'bg-red-100' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <td className="p-4">
          <span className={`font-bold ${isSoldOut ? 'text-red-700' : 'text-gray-900'}`}>
            {menu.name}
            {isSoldOut && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full uppercase">完売</span>}
          </span>
        </td>
        
        <td className="p-4">
          <input 
            type="number" 
            defaultValue={menu.price} 
            onBlur={e => { void updateMenu(menu.id, { price: Number(e.target.value) }) }} 
            className="w-20 border p-1 rounded" 
          /> 円
        </td>

        <td className="p-4">
          <input 
            type="number" 
            key={menu.stock} // 在庫が減った時に表示を同期させるため
            defaultValue={menu.stock} 
            onBlur={e => { void updateMenu(menu.id, { stock: Number(e.target.value) }) }} 
            // 在庫0の時は入力欄の枠線も赤くする
            className={`w-20 border p-1 rounded font-bold ${
              isSoldOut ? 'border-red-500 text-red-600' : 'border-gray-300'
            }`} 
          /> 個
        </td>

        <td className="p-4 text-center">
          <button onClick={() => { void deleteMenu(menu.id) }} className="text-red-400 hover:text-red-600">
            <Trash2 size={20} />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
          {menus.length === 0 && (
            <div className="p-10 text-center text-gray-400">メニューが登録されていません</div>
          )}
        </div>
      </div>
    </div>
  )
}