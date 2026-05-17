import { Eye, Focus, Palette, RotateCcw, Rows3, Type, ZapOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import type { LayoutDensity, TextSize } from '../../context/AccessibilityContext';

const textSizeOptions: { label: string; value: TextSize }[] = [
  { label: 'Default', value: 'default' },
  { label: 'Large', value: 'large' },
  { label: 'Extra Large', value: 'extra-large' },
];

const densityOptions: { label: string; value: LayoutDensity }[] = [
  { label: 'Compact', value: 'compact' },
  { label: 'Comfortable', value: 'comfortable' },
];

interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  icon: ReactNode;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, title, description, checked, icon, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[8px] border border-[#e7dff0] bg-[#fdfcff] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#f3eff7] text-[#6a5182]">
          {icon}
        </span>
        <div>
          <label htmlFor={id} className="text-[14px] font-semibold text-[#4b3f68]">
            {title}
          </label>
          <p className="mt-1 text-[12px] font-medium leading-5 text-[#7c8697]">{description}</p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-[52px] shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#6a5182]/25 ${
          checked ? 'border-[#6a5182] bg-[#6a5182]' : 'border-[#ded4eb] bg-[#e9e2ef]'
        }`}
      >
        <span
          className={`absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(57,31,86,0.22)] transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function AccessibilitySettingsPanel() {
  const { preferences, updatePreference, resetPreferences } = useAccessibility();

  return (
    <section className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-sans text-[19px] font-bold text-[#4b3f68] tracking-tight">Accessibility</h2>
          <p className="mt-1 text-[13px] font-medium text-[#7c8697]">
            Tune readability, motion, spacing, and focus behavior for your account.
          </p>
        </div>
        <button
          type="button"
          onClick={resetPreferences}
          className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#ded4eb] bg-white px-3.5 py-2 text-[11.5px] font-semibold uppercase tracking-wider text-[#6a5182] transition hover:bg-[#f9f8fa]"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#778196]">
            <Type size={15} aria-hidden="true" />
            Text Size
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {textSizeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updatePreference('textSize', option.value)}
                aria-pressed={preferences.textSize === option.value}
                className={`rounded-[8px] border px-4 py-3 text-[13px] font-semibold transition ${
                  preferences.textSize === option.value
                    ? 'border-[#6a5182] bg-[#f3eff7] text-[#4b3f68]'
                    : 'border-[#e7dff0] bg-[#fdfcff] text-[#64748b] hover:border-[#cbbbdc]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#778196]">
            <Rows3 size={15} aria-hidden="true" />
            Layout Spacing
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {densityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updatePreference('layoutDensity', option.value)}
                aria-pressed={preferences.layoutDensity === option.value}
                className={`rounded-[8px] border px-4 py-3 text-[13px] font-semibold transition ${
                  preferences.layoutDensity === option.value
                    ? 'border-[#6a5182] bg-[#f3eff7] text-[#4b3f68]'
                    : 'border-[#e7dff0] bg-[#fdfcff] text-[#64748b] hover:border-[#cbbbdc]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <ToggleRow
            id="high-contrast"
            title="High Contrast"
            description="Strengthens text, borders, and important controls across dashboards."
            checked={preferences.highContrast}
            icon={<Eye size={17} aria-hidden="true" />}
            onChange={(checked) => updatePreference('highContrast', checked)}
          />
          <ToggleRow
            id="reduce-motion"
            title="Reduce Motion"
            description="Minimizes transitions and page animations for a steadier interface."
            checked={preferences.reduceMotion}
            icon={<ZapOff size={17} aria-hidden="true" />}
            onChange={(checked) => updatePreference('reduceMotion', checked)}
          />
          <ToggleRow
            id="readable-font"
            title="Readable Font"
            description="Uses a simpler system font stack with clearer letter forms."
            checked={preferences.readableFont}
            icon={<Type size={17} aria-hidden="true" />}
            onChange={(checked) => updatePreference('readableFont', checked)}
          />
          <ToggleRow
            id="enhanced-focus"
            title="Enhanced Focus"
            description="Adds stronger outlines for keyboard navigation."
            checked={preferences.enhancedFocus}
            icon={<Focus size={17} aria-hidden="true" />}
            onChange={(checked) => updatePreference('enhancedFocus', checked)}
          />
          <ToggleRow
            id="color-vision-support"
            title="Color Vision Support"
            description="Adds clearer outlines and labels so status is less dependent on color."
            checked={preferences.colorVisionSupport}
            icon={<Palette size={17} aria-hidden="true" />}
            onChange={(checked) => updatePreference('colorVisionSupport', checked)}
          />
        </div>
      </div>
    </section>
  );
}
