/**
 * Drop-in replacement for React Native's `Alert.alert()`.
 *
 * The whole app swaps its import line from 'react-native' to this module; the
 * call sites keep the exact React Native signature:
 *   Alert.alert(title, message?, buttons?, options?)
 *
 * Requests are queued FIFO and rendered by `src/component/common/AlertModalHost.tsx`,
 * which is mounted once as a sibling of <App /> in `index.js`.
 */
export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

export interface AlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options: AlertOptions;
}

type AlertListener = (request: AlertRequest | null) => void;

let current: AlertRequest | null = null;
const pending: AlertRequest[] = [];
const listeners = new Set<AlertListener>();
let nextId = 1;

const emit = (): void => {
  listeners.forEach((listener) => listener(current));
};

const showNext = (): void => {
  current = pending.shift() ?? null;
  emit();
};

/** Host subscribes here; the current request is replayed so an alert fired before
 *  the host mounted is still shown. Returns the unsubscribe function. */
export const subscribeToAlert = (listener: AlertListener): (() => void) => {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
};

/** Host calls this when a button is pressed. */
export const resolveAlert = (button?: AlertButton): void => {
  const handler = button?.onPress;
  showNext();
  // Run the handler after the queue advanced, so an alert fired inside the
  // handler queues behind an already-visible dialog instead of replacing it.
  if (handler) handler();
};

/** Host calls this on backdrop press / Android hardware back. */
export const dismissAlert = (): void => {
  const onDismiss = current?.options.onDismiss;
  showNext();
  if (onDismiss) onDismiss();
};

export const Alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    const request: AlertRequest = {
      id: nextId++,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
      options: options ?? {},
    };

    if (current) {
      pending.push(request);
      return;
    }

    current = request;
    emit();
  },
};
