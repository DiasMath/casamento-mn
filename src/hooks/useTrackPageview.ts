import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "@/lib/firestoreService";

function getVisitorId(): string {
  const key = "mn_visitor_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useTrackPageview() {
  const { pathname } = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const visitorId = getVisitorId();
    const pageKey = `${visitorId}:${pathname}`;

    if (lastTracked.current === pageKey) return;
    lastTracked.current = pageKey;

    const pageName = pathname === "/" ? "index" : pathname.replace(/^\//, "").replace(/\/.*/, "") || "index";
    trackPageview(pageName);
  }, [pathname]);
}
