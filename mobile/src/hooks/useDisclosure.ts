import { useCallback, useState } from "react";

/**
 * Tiny open/close hook for sheets, modals, and dialogs. Same shape as Chakra UI's hook, kept
 * dependency-free.
 *
 * <pre>
 *   const sheet = useDisclosure();
 *   &lt;BottomSheet open={sheet.isOpen} onClose={sheet.close}&gt; … &lt;/BottomSheet&gt;
 *   &lt;Button onPress={sheet.open}&gt; Open &lt;/Button&gt;
 * </pre>
 */
export function useDisclosure(initial = false) {
  const [isOpen, setOpen] = useState(initial);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  return { isOpen, open, close, toggle, setOpen };
}
