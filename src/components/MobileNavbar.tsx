import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useModal } from '../hooks/useModal'
import type { ModalType } from '../context/ModalContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const navItems = [
    { label: 'Overview', path: '/dashboard', icon: 'dashboard' },
    { label: 'Wishlist', path: '/wishlist', icon: 'favorite' },
    { label: 'Budget', path: '/budget', icon: 'account_balance_wallet' },
    { label: 'Insights', path: '/insights', icon: 'monitoring' },
]

const quickActions: { label: string; icon: string; color: string; type: NonNullable<ModalType> }[] = [
    { label: 'Expense', icon: 'receipt_long', color: 'text-red-400', type: 'expense' },
    { label: 'Savings', icon: 'savings', color: 'text-emerald-400', type: 'savings-expense' },
    { label: 'Income', icon: 'payments', color: 'text-green-400', type: 'income' },
    { label: 'Transfer', icon: 'swap_horiz', color: 'text-blue-400', type: 'transfer' },
    { label: 'Goal', icon: 'add_circle', color: 'text-purple-400', type: 'goal' },
]

export default function MobileNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { openModal } = useModal()
    const containerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const actionButtonsRef = useRef<(HTMLButtonElement | null)[]>([])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useGSAP(() => {
        if (isMenuOpen) {
            // Open Menu
            gsap.to(menuRef.current, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: 'back.out(1.7)',
                pointerEvents: 'auto'
            });

            // Stagger items
            gsap.fromTo(actionButtonsRef.current,
                { x: 20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'power2.out', delay: 0.1 }
            );

            // Rotate button
            gsap.to(buttonRef.current, {
                rotate: 360,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        } else {
            // Close Menu
            gsap.to(menuRef.current, {
                opacity: 0,
                scale: 0.95,
                y: 10,
                duration: 0.3,
                ease: 'power2.in',
                pointerEvents: 'none'
            });

            // Rotate button back
            gsap.to(buttonRef.current, {
                rotate: 0,
                duration: 0.4,
                ease: 'back.out(1.7)'
            });
        }
    }, { dependencies: [isMenuOpen], scope: containerRef });

    const handleActionClick = (type: NonNullable<ModalType>) => {
        openModal(type)
        setIsMenuOpen(false)
    }

    return (
        <div className="fixed bottom-6 inset-x-0 z-50 px-3 pointer-events-none sm:px-4">
            <div className="relative mx-auto flex w-full max-w-md items-center gap-2" ref={containerRef}>
                {/* Dropdown Menu */}
                <div
                    ref={menuRef}
                    className="absolute bottom-[calc(100%+12px)] right-0 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c21]/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl origin-bottom-right pointer-events-auto opacity-0 scale-95 translate-y-4"
                >
                    <div className="flex flex-col p-1">
                        {quickActions.map((action, index) => (
                            <button
                                key={action.label}
                                ref={el => { actionButtonsRef.current[index] = el }}
                                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-colors hover:bg-white/5 active:bg-white/10"
                                onClick={() => handleActionClick(action.type)}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${action.color}`}>
                                    {action.icon}
                                </span>
                                <span className="text-[13px] font-bold text-on-surface">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <nav
                    className="pointer-events-auto flex h-14 min-w-0 flex-1 items-center justify-around gap-1 rounded-full border border-white/10 bg-[#1c1c21]/80 px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 ease-out"
                    aria-label="Primary navigation"
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? 'flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-1 text-primary transition-all duration-300'
                                    : 'flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-1 text-on-surface-variant transition-all duration-300 hover:text-on-surface'
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="mt-0.5 truncate font-['Inter'] text-[10px] font-black uppercase tracking-tighter transition-all duration-300">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
                <button
                    ref={buttonRef}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="pointer-events-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1c1c21]/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl active:scale-95"
                    aria-label="Quick action"
                >
                    <span className="flex flex-col items-center leading-none text-on-surface">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span className="mt-0.5 text-[10px] font-black uppercase tracking-tight">Add</span>
                    </span>
                </button>
            </div>
        </div>
    )
}
