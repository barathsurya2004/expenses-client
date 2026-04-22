import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useModal } from '../hooks/useModal'
import type { ModalType } from '../context/ModalContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const navItems = [
    { label: 'Overview', path: '/dashboard', icon: 'dashboard' },
    { label: 'Goals', path: '/wishlist', icon: 'flag' },
    { label: 'Budget', path: '/budget', icon: 'account_balance_wallet' },
    { label: 'Insights', path: '/insights', icon: 'monitoring' },
]

const quickActions: { label: string; icon: string; color: string; type: NonNullable<ModalType> }[] = [
    { label: 'Expense', icon: 'receipt_long', color: 'text-ledger-expense', type: 'expense' },
    { label: 'Savings', icon: 'savings', color: 'text-ledger-accent', type: 'savings-expense' },
    { label: 'Income', icon: 'payments', color: 'text-ledger-income', type: 'income' },
    { label: 'Transfer', icon: 'swap_horiz', color: 'text-ledger-accent', type: 'transfer' },
    { label: 'Goal', icon: 'add_circle', color: 'text-ledger-accent', type: 'goal' },
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
        const menuEl = menuRef.current
        const buttonEl = buttonRef.current
        const actionButtons = actionButtonsRef.current.filter((btn): btn is HTMLButtonElement => Boolean(btn))

        if (!menuEl || !buttonEl) return

        gsap.killTweensOf(menuEl)
        gsap.killTweensOf(buttonEl)
        gsap.killTweensOf(actionButtons)

        if (isMenuOpen) {
            gsap.to(menuEl, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: 'back.out(1.7)',
                pointerEvents: 'auto',
                overwrite: 'auto'
            })
            gsap.fromTo(actionButtons,
                { x: 20, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'power2.out', delay: 0.1 }
            )
            gsap.to(buttonEl, {
                rotate: '+=360',
                duration: 0.45,
                ease: 'power2.out',
                overwrite: 'auto'
            })
        } else {
            gsap.to(menuEl, {
                opacity: 0,
                scale: 0.95,
                y: 10,
                duration: 0.3,
                ease: 'power2.in',
                pointerEvents: 'none',
                overwrite: 'auto'
            })
            gsap.to(buttonEl, {
                rotate: '-=360',
                duration: 0.45,
                ease: 'power2.out',
                overwrite: 'auto'
            })
        }
    }, { dependencies: [isMenuOpen], scope: containerRef })

    const handleActionClick = (type: NonNullable<ModalType>) => {
        openModal(type)
        setIsMenuOpen(false)
    }

    return (
        <div className="fixed bottom-6 inset-x-0 z-50 px-4 pointer-events-none">
            <div className="relative mx-auto flex w-full max-w-md items-center gap-3" ref={containerRef}>
                {/* Dropdown Menu */}
                <div
                    ref={menuRef}
                    className="absolute bottom-[calc(100%+16px)] right-0 w-48 overflow-hidden rounded-2xl border border-white/10 bg-ledger-s1/90 shadow-2xl backdrop-blur-xl origin-bottom-right pointer-events-auto opacity-0 scale-95 translate-y-4"
                >
                    <div className="flex flex-col p-1.5">
                        {quickActions.map((action, index) => (
                            <button
                                key={action.label}
                                ref={el => { actionButtonsRef.current[index] = el }}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-ledger-s2 active:bg-ledger-s3"
                                onClick={() => handleActionClick(action.type)}
                            >
                                <span className={`material-symbols-outlined text-[20px] ${action.color}`}>
                                    {action.icon}
                                </span>
                                <span className="text-[13.5px] font-bold text-ledger-text">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <nav
                    className="pointer-events-auto flex h-16 min-w-0 flex-1 items-center justify-around gap-1 rounded-2xl border border-white/10 bg-ledger-s1/80 px-2 shadow-2xl backdrop-blur-xl"
                    aria-label="Primary navigation"
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? 'flex min-w-0 flex-1 flex-col items-center justify-center py-1 text-ledger-accent transition-all duration-300'
                                    : 'flex min-w-0 flex-1 flex-col items-center justify-center py-1 text-ledger-muted transition-all duration-300 hover:text-ledger-text'
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className="material-symbols-outlined text-[22px]"
                                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="mt-1 truncate font-body text-[10px] font-bold uppercase tracking-widest">
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
                    className="pointer-events-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-ledger-accent text-ledger-bg shadow-2xl active:scale-95"
                    aria-label="Quick action"
                >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                </button>
            </div>
        </div>
    )
}
