import { mergeGirlfriend, type GirlfriendProfile } from "../lib/portfolioData.ts";

/**
 * Load the girlfriend/profile row from Supabase and subscribe to live changes.
 * Used by the private /mygirlfirends page so edits saved in /admin appear
 * without waiting for a redeploy.
 */
export function subscribeGirlfriend(onData: (g: GirlfriendProfile) => void) {
  let cancelled = false;
  let client: any;
  let channel: any;

  const load = async () => {
    try {
      const s = client ?? (await import("../db/supabase.js")).supabase;
      client = s;
      const { data } = await s
        .from("portfolio_profile")
        .select("data")
        .eq("id", "main")
        .maybeSingle();
      if (cancelled || !data?.data?.girlfriend) return;
      onData(mergeGirlfriend(data.data.girlfriend));
    } catch {
      // Keep the server-rendered content if the live fetch fails.
    }
  };

  void (async () => {
    const s = (await import("../db/supabase.js")).supabase;
    if (cancelled) return;
    client = s;
    await load();
    channel = s
      .channel("girlfriend-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolio_profile" },
        () => void load()
      )
      .subscribe();
  })();

  return () => {
    cancelled = true;
    try {
      if (client && channel) client.removeChannel(channel);
    } catch {
      /* noop */
    }
  };
}
