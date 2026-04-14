type LanguageSwitcherProps = {
  value: 'it' | 'en'
  label: string
  onChange: (language: 'it' | 'en') => void
}

export function LanguageSwitcher({ value, label, onChange }: LanguageSwitcherProps) {
  return (
    <div className="lang-select">
      <span>{label}</span>
      <div className="picker-row">
        <button type="button" className={value === 'it' ? '' : 'secondary'} onClick={() => onChange('it')}>
          IT
        </button>
        <button type="button" className={value === 'en' ? '' : 'secondary'} onClick={() => onChange('en')}>
          EN
        </button>
      </div>
    </div>
  )
}
