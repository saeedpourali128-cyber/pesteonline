import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_SITE_DESIGN,
  SiteDesignContext,
  applySiteDesignToDocument,
  normalizeSiteDesign,
  type SiteDesignSettings,
} from "@/lib/site-design";

const SETTING_KEY = "site_design";

export default function SiteDesignRuntime({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<SiteDesignSettings>(DEFAULT_SITE_DESIGN);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", SETTING_KEY)
      .eq("is_public", true)
      .maybeSingle();

    if (error) {
      console.error("Loading public site design failed", error);
      setLoading(false);
      return;
    }

    const next = normalizeSiteDesign(data?.setting_value ?? DEFAULT_SITE_DESIGN);
    setDesign(next);
    applySiteDesignToDocument(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    applySiteDesignToDocument(DEFAULT_SITE_DESIGN);
    void reload();
  }, [reload]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const next = normalizeSiteDesign(
        (event as CustomEvent<SiteDesignSettings>).detail,
      );
      setDesign(next);
      applySiteDesignToDocument(next);
    };

    window.addEventListener("site-design-updated", handleUpdate);
    return () => window.removeEventListener("site-design-updated", handleUpdate);
  }, []);

  return (
    <SiteDesignContext.Provider value={{ design, loading, reload }}>
      {children}
    </SiteDesignContext.Provider>
  );
}
