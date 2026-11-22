import { createClient } from "@supabase/supabase-js";

// Supports both Astro server-side frontmatter and client-side browser bundles
const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
  "https://bzdsqdorqpwjkdioopzk.supabase.co";

const supabaseKey =
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.PUBLIC_SUPABASE_KEY || import.meta.env.SUPABASE_KEY)) ||
  "sb_publishable_NYRy_5uBmCXgr3N4XG6mcA_74XzYcu5";

export const supabase = createClient(supabaseUrl, supabaseKey);
