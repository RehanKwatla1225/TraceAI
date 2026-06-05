"use client";

import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
  id,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} role="group" aria-labelledby={id ? `${id}-label` : undefined}>
      <Label
        id={id ? `${id}-label` : undefined}
        htmlFor={id}
        className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}
      >
        {label}
      </Label>
      {children}
      {error && (
        <p
          className="flex items-center gap-1 text-xs text-red-500 font-medium"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// --- Convenience input wrappers ---

interface TextInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  required?: boolean;
  id?: string;
  disabled?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  icon: Icon,
  required,
  id,
  disabled,
}: TextInputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <FormField label={label} error={error} required={required} id={fieldId}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        <Input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(Icon && "pl-10")}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          disabled={disabled}
        />
      </div>
    </FormField>
  );
}

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  rows?: number;
}

export function TextAreaInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  id,
  rows = 4,
}: TextAreaInputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <FormField label={label} error={error} required={required} id={fieldId}>
      <Textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
        disabled={false}
      />
    </FormField>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  error,
  options,
  placeholder = "Select...",
  required,
  id,
}: SelectInputProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <FormField label={label} error={error} required={required} id={fieldId}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={fieldId} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
