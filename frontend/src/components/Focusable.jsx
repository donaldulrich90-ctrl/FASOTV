import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';

const FOCUS_CLS = 'ring-4 ring-gold scale-105 z-10 shadow-lg shadow-gold/30';

export function FocusableItem({
  onEnterPress,
  onClick,
  onFocus,
  onArrowPress,
  focusKey,
  className = '',
  focusClass,
  children,
  ...props
}) {
  const { ref, focused } = useFocusable({
    onEnterPress: onEnterPress ?? onClick,
    onFocus,
    onArrowPress,
    focusKey,
  });
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`${className} ${focused ? (focusClass ?? FOCUS_CLS) : ''} transition-all duration-150 outline-none`}
      {...props}
    >
      {children}
    </div>
  );
}

export function FocusableSection({ focusKey, children, className = '' }) {
  const { ref, focusKey: key } = useFocusable({
    focusKey,
    trackChildren: true,
    saveLastFocusedChild: true,
  });
  return (
    <FocusContext.Provider value={key}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </FocusContext.Provider>
  );
}
