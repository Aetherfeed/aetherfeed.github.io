import { useState, useRef, useId, type ToggleEvent as ReactToggleEvent } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

interface Option<T extends string | number> {
    label: string;
    value: T;
    tooltip?: string;
}

interface MultiSelectProps<T extends string | number> {
    options: Option<T>[];
    selected: T[];
    onChange: (selected: T[]) => void;
    label: string;
}

const positionPopoverFallback = (
    triggerRect: DOMRect,
    popoverEl: HTMLElement,
    preferredSide: 'bottom-end' | 'top-center',
    gap: number
) => {
    popoverEl.style.position = 'fixed';
    popoverEl.style.inset = 'auto';
    popoverEl.style.margin = '0';

    const popoverRect = popoverEl.getBoundingClientRect();
    const margin = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top: number;
    let left: number;

    if (preferredSide === 'bottom-end') {
        top = triggerRect.bottom + gap;
        if (top + popoverRect.height > viewportH - margin && triggerRect.top - gap - popoverRect.height >= margin) {
            top = triggerRect.top - gap - popoverRect.height;
        }
        left = triggerRect.right - popoverRect.width;
    } else {
        top = triggerRect.top - gap - popoverRect.height;
        if (top < margin && triggerRect.bottom + gap + popoverRect.height <= viewportH - margin) {
            top = triggerRect.bottom + gap;
        }
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
    }

    const maxLeft = Math.max(margin, viewportW - popoverRect.width - margin);
    left = Math.min(Math.max(margin, left), maxLeft);
    const maxTop = Math.max(margin, viewportH - popoverRect.height - margin);
    top = Math.min(Math.max(margin, top), maxTop);

    popoverEl.style.top = `${top}px`;
    popoverEl.style.left = `${left}px`;
};

const clearInlinePopoverPosition = (popoverEl: HTMLElement) => {
    popoverEl.style.position = '';
    popoverEl.style.inset = '';
    popoverEl.style.margin = '';
    popoverEl.style.top = '';
    popoverEl.style.left = '';
};

const MultiSelect = <T extends string | number>({ options, selected, onChange, label }: MultiSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openTipId, setOpenTipId] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const baseId = useId();
    const panelId = `${baseId}-panel`;

    const toggleOption = (value: T) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const handlePanelToggle = (event: ReactToggleEvent<HTMLDivElement>) => {
        const opening = event.newState === 'open';
        setIsOpen(opening);

        const panelEl = panelRef.current;
        const triggerEl = triggerRef.current;
        if (!panelEl) return;

        if (opening && triggerEl && typeof CSS !== 'undefined' && !CSS.supports('position-area', 'block-end')) {
            positionPopoverFallback(triggerEl.getBoundingClientRect(), panelEl, 'bottom-end', 8);
        } else if (!opening) {
            clearInlinePopoverPosition(panelEl);
        }
    };

    const handleTipToggle = (event: ReactToggleEvent<HTMLDivElement>, tipId: string) => {
        const opening = event.newState === 'open';
        setOpenTipId((prev) => (opening ? tipId : prev === tipId ? null : prev));

        const tipEl = event.currentTarget;
        if (opening && typeof CSS !== 'undefined' && !CSS.supports('position-area', 'block-start')) {
            const triggerEl = document.querySelector<HTMLElement>(`[popovertarget="${CSS.escape(tipId)}"]`);
            if (triggerEl) {
                positionPopoverFallback(triggerEl.getBoundingClientRect(), tipEl, 'top-center', 6);
            }
        } else if (!opening) {
            clearInlinePopoverPosition(tipEl);
        }
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                popoverTarget={panelId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="relative flex items-center gap-2 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-aether-500 focus-visible:border-transparent outline-hidden hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter aria-hidden="true" className="h-4 w-4 text-slate-400" />
                </span>
                <span className="truncate">
                    {selected.length === 0 ? label : `${selected.length} selected`}
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                ref={panelRef}
                id={panelId}
                popover="auto"
                onToggle={handlePanelToggle}
                className="popover-surface anchored-dropdown w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl text-slate-700 dark:text-slate-200 overflow-hidden"
            >
                <div className="filter-popover-list thin-scrollbar max-h-64 overflow-y-auto py-1">
                    {options.map((option, index) => {
                        const isSelected = selected.includes(option.value);
                        const tipId = `${baseId}-tip-${index}`;

                        return (
                            <div
                                key={String(option.value)}
                                className="flex items-center justify-between gap-2 px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <label className="flex items-center gap-3 grow min-h-9 py-1 cursor-pointer text-sm text-slate-700 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        className="checkbox-custom border-slate-300 dark:border-slate-600"
                                        checked={isSelected}
                                        onChange={() => toggleOption(option.value)}
                                    />
                                    <span className="grow">{option.label}</span>
                                </label>

                                {option.tooltip && (
                                    <>
                                        <button
                                            type="button"
                                            popoverTarget={tipId}
                                            popoverTargetAction="show"
                                            {...({ interestfor: tipId } as Record<string, string>)}
                                            aria-label={`More about ${option.label}`}
                                            aria-expanded={openTipId === tipId}
                                            className="shrink-0 inline-flex items-center justify-center min-w-6 min-h-6 rounded-full border border-slate-300 dark:border-slate-600 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aether-500"
                                        >
                                            <span aria-hidden="true">?</span>
                                        </button>
                                        <div
                                            id={tipId}
                                            role="tooltip"
                                            popover={'hint' as 'auto'}
                                            onToggle={(e) => handleTipToggle(e, tipId)}
                                            className="popover-surface anchored-tooltip max-w-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-100 px-3 py-2 text-xs leading-relaxed text-white dark:text-slate-900 shadow-lg"
                                        >
                                            {option.tooltip}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {options.length === 0 && (
                        <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                            No options available
                        </div>
                    )}
                </div>

                {selected.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/50">
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="w-full text-xs text-slate-500 hover:text-aether-500 dark:text-slate-400 dark:hover:text-aether-400 font-medium py-1.5 rounded-lg"
                        >
                            Clear Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiSelect;
