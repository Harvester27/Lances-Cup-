import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useMapSlots = (options = {}) => {
  const { initialSlot = 0, slotCount = 5 } = options;
  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const selectedSlotRef = useRef(selectedSlot);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  const slots = useMemo(() => Array.from({ length: slotCount }, (_, index) => index), [slotCount]);

  const getCurrentMapKey = useCallback(
    () => `cityBuildings:slot${selectedSlotRef.current}`,
    []
  );

  const selectSlot = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  return {
    selectedSlot,
    selectSlot,
    slots,
    selectedSlotRef,
    getCurrentMapKey,
  };
};

