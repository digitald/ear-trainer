type LanguageSwitcherProps = {
  value: 'it' | 'en'
  label: string
  onChange: (language: 'it' | 'en') => void
}

export function LanguageSwitcher({ value, label, onChange }: LanguageSwitcherProps) {
  return (
    <label className="lang-select">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as 'it' | 'en')}>
        <option value="it">IT</option>
        <option value="en">EN</option>
      </select>
    </label>
  )
}
