"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Internal view.
 *
 * Production cost and margin are internal economics. The brand rule is
 * explicit: never state margin, cost, or internal pricing logic in anything
 * customer-facing — talk only about what the customer receives. So every
 * cost readout in this app sits behind this flag, which is off by default.
 */
const KEY = "internal-view";

export function useInternalView(): [boolean, () => void] {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(localStorage.getItem(KEY) === "1");
    } catch {
      /* default to the customer view */
    }
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        /* the toggle still works for this session */
      }
      return next;
    });
  }, []);

  return [on, toggle];
}
