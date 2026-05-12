import { createContext, useContext, type ReactNode } from "react";
import { View, Text } from "react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

/**
 * Minimal context for form fields. Mounts via {@link Form}; every {@link FormField} reads its
 * `name` so the layout, error display, and required-mark stay consistent.
 *
 * Designed as a thin shell on top of react-hook-form — it doesn't replace `useForm`, just
 * supplies the visual chrome (labels, hints, errors). Wrap inputs in a {@link FormField} and
 * pass the rendered input as children:
 *
 * ```tsx
 *  <Form>
 *    <FormField name="email" label="E-Mail" error={errors.email?.message} required>
 *      <TextInput ... />
 *    </FormField>
 *  </Form>
 * ```
 */
interface FormContextValue {
  density: "compact" | "comfortable";
}

const FormContext = createContext<FormContextValue>({ density: "comfortable" });

export function Form({
  children,
  density = "comfortable",
  className = "",
}: {
  children: ReactNode;
  density?: "compact" | "comfortable";
  className?: string;
}) {
  return (
    <FormContext.Provider value={{ density }}>
      <View className={className}>{children}</View>
    </FormContext.Provider>
  );
}

interface FormFieldProps {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  name,
  label,
  hint,
  error,
  required,
  children,
}: FormFieldProps) {
  const { isDark } = useThemeStore();
  const { density } = useContext(FormContext);
  const gap = density === "compact" ? 4 : 8;
  const padBottom = density === "compact" ? 12 : 16;

  return (
    <View style={{ marginBottom: padBottom }}>
      {label && (
        <View
          accessibilityRole="text"
          style={{ flexDirection: "row", alignItems: "center", marginBottom: gap }}
        >
          <Text
            className={`text-[13.5px] font-semibold ${
              isDark ? "text-dark-text" : "text-gray-700"
            }`}
          >
            {label}
          </Text>
          {required && (
            <Text className="text-[13.5px] font-semibold text-accent-500 ml-0.5">
              {"*"}
            </Text>
          )}
        </View>
      )}
      <View accessibilityLabel={label} accessibilityHint={hint}>
        {children}
      </View>
      {error ? (
        <Text className="text-[12px] font-medium text-accent-600 mt-1.5">
          {error}
        </Text>
      ) : hint ? (
        <Text
          className={`text-[11.5px] mt-1 ${
            isDark ? "text-dark-muted" : "text-gray-500"
          }`}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
