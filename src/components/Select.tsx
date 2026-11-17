import { ChevronDown, ArrowUpDown } from 'lucide-react';

interface Option<T extends string | number> {
    label: string;
    value: T;
}

interface SelectProps<T extends string | number> {
    options: Option<T>[];
    selected: T;
    onChange: (selected: T) => void;
    label?: string;
}

const Select = <T extends string | number>({ options, selected, onChange, label }: SelectProps<T>) => {
    return (
        <div className="relative flex items-center">
            <ArrowUpDown aria-hidden="true" className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <select
                aria-label={label ?? 'Sort plugins'}
                name="sort-select"
                value={String(selected)}
                onChange={(e) => {
                    const match = options.find((opt) => String(opt.value) === e.target.value);
                    if (match !== undefined) onChange(match.value);
                }}
                className="brand-select rounded-l-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus-visible:outline-none transition-colors"
            >
                {options.map((option) => (
                    <option key={String(option.value)} value={String(option.value)}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
        </div>
    );
};

export default Select;
