import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { shadow } from "../../lib/shadows";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onPress: () => void };
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, action?: Toast["action"]) => void;
  success: (message: string, action?: Toast["action"]) => void;
  error: (message: string, action?: Toast["action"]) => void;
  info: (message: string, action?: Toast["action"]) => void;
  warning: (message: string, action?: Toast["action"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() must be used within <ToastProvider>");
  return ctx;
}

const DEFAULT_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ToastContextValue["show"]>(
    (message, variant = "info", action) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((t) => [...t, { id, message, variant, action }]);
    },
    [],
  );

  const value: ToastContextValue = {
    show,
    success: (m, a) => show(m, "success", a),
    error: (m, a) => show(m, "error", a),
    info: (m, a) => show(m, "info", a),
    warning: (m, a) => show(m, "warning", a),
  };

  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 items-center px-4 pb-4 gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, DEFAULT_DURATION_MS);
    return () => clearTimeout(id);
  }, []);

  const { bg, fg, Icon } = variantStyles(toast.variant);

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut}
      className={`flex-row items-start gap-3 rounded-2xl px-4 py-3 max-w-lg w-full ${bg}`}
      style={[
        Platform.OS === "web" ? undefined : shadow("lg"),
        Platform.OS === "web" ? { boxShadow: "0 6px 20px rgba(0,0,0,0.15)" } : undefined,
      ]}
    >
      <Icon size={18} color={fg} />
      <Text className="flex-1 text-[14px] font-semibold" style={{ color: fg }}>
        {toast.message}
      </Text>
      {toast.action && (
        <TouchableOpacity
          onPress={() => {
            toast.action!.onPress();
            onDismiss();
          }}
        >
          <Text className="text-[13px] font-bold underline" style={{ color: fg }}>
            {toast.action.label}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onDismiss}>
        <X size={16} color={fg} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function variantStyles(variant: ToastVariant): {
  bg: string;
  fg: string;
  Icon: typeof CheckCircle;
} {
  switch (variant) {
    case "success":
      return { bg: "bg-success-100", fg: "#047857", Icon: CheckCircle };
    case "error":
      return { bg: "bg-accent-50", fg: "#991b1b", Icon: AlertCircle };
    case "warning":
      return { bg: "bg-warning-100", fg: "#92400e", Icon: AlertCircle };
    case "info":
    default:
      return { bg: "bg-primary-50", fg: "#1d4ed8", Icon: Info };
  }
}
