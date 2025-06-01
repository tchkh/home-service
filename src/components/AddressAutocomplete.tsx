import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: NominatimResult) => void;
  placeholder?: string;
  className?: string;
};

const AddressAutocomplete: React.FC<Props> = ({ value, onChange, onSelect, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    fetch(
      `/api/address-autocomplete?q=${encodeURIComponent(value)}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setSuggestions(data);
        setLoading(false);
        setShowSuggestions(true);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn("border px-3 py-2 rounded-xl", className)}
        onFocus={() => value.length >= 3 && setShowSuggestions(true)}
      />
      {loading && <div className="absolute left-0 mt-1 bg-[var(--gray-200)] text-[var(--gray-500)] px-3 py-2 text-sm">Loading...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-42 md:w-120 max-h-60 bg-[var(--white)] border border-[var(--gray-200)] overflow-auto shadow-lg mt-1">
          {suggestions.map((s, idx) => (
            <li
              key={s.display_name + idx}
              className="hover:bg-[var(--gray-100)] px-3 py-2 text-sm cursor-pointer"
              onClick={() => {
                onChange(s.display_name);
                if (onSelect) onSelect(s);
                setShowSuggestions(false);
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
