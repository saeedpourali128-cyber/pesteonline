import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

const HistoricalCharts = lazy(
  () => import("./HistoricalCharts"),
);

export default function DeferredHistoricalCharts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || shouldLoad) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <div
              className="flex min-h-[420px] items-center justify-center"
              dir="rtl"
              role="status"
            >
              <span className="text-sm text-gray-500">
                در حال بارگذاری نمودارها...
              </span>
            </div>
          }
        >
          <HistoricalCharts />
        </Suspense>
      ) : (
        <div
          className="min-h-[420px]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}