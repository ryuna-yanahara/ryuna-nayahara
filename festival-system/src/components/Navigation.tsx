'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingCart, LayoutPanelLeft, Settings, Home } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: '注文画面', href: '/order', icon: <ShoppingCart size={20} /> },
    { name: 'キッチンモニター', href: '/kitchen', icon: <LayoutPanelLeft size={20} /> },
    { name: '管理画面', href: '/admin', icon: <Settings size={20} /> },
  ]

  return (
    <div className="relative z-[100]">
      {/* ハンバーガーボタン (画面右上に固定) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 p-3 bg-white/80 backdrop-blur shadow-lg rounded-full text-gray-800 hover:bg-gray-100 transition-all border border-gray-200"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* メニューの中身 */}
      {isOpen && (
        <>
          {/* 背景のオーバーレイ */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* サイドメニュー */}
          <nav className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl p-6 flex flex-col gap-4 transform transition-transform animate-in slide-in-from-right">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 text-gray-800">Menu</h2>
            
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-4 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium border border-transparent hover:border-orange-100"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            <div className="mt-auto pt-6 border-t">
              <p className="text-xs text-gray-400 text-center font-mono">Festival System v1.0</p>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
