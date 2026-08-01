export type UserRole = "super_admin" | "admin" | "moderator" | "user";
export type ContentTypeDB = "movie" | "series" | "documentary" | "reality";
export type SubscriptionTier = "free" | "standard" | "premium";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          role: UserRole;
          subscription_tier: SubscriptionTier;
          preferred_language: string;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      genres: {
        Row: { id: string; name: string; slug: string };
        Insert: Partial<Database["public"]["Tables"]["genres"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["genres"]["Row"]>;
      };
      titles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          original_title: string | null;
          type: ContentTypeDB;
          is_original: boolean;
          is_published: boolean;
          synopsis: string;
          short_synopsis: string;
          poster_url: string | null;
          backdrop_url: string | null;
          trailer_url: string | null;
          video_url: string | null;
          age_rating: string;
          duration_minutes: number | null;
          duration_label: string | null;
          release_year: number | null;
          release_date: string | null;
          director: string | null;
          language: string;
          country: string;
          average_rating: number;
          ratings_count: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["titles"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["titles"]["Row"]>;
      };
      title_genres: {
        Row: { title_id: string; genre_id: string };
        Insert: Database["public"]["Tables"]["title_genres"]["Row"];
        Update: Partial<Database["public"]["Tables"]["title_genres"]["Row"]>;
      };
      cast_members: {
        Row: { id: string; title_id: string; name: string; role_name: string; photo_url: string | null; sort_order: number };
        Insert: Partial<Database["public"]["Tables"]["cast_members"]["Row"]> & { title_id: string; name: string; role_name: string };
        Update: Partial<Database["public"]["Tables"]["cast_members"]["Row"]>;
      };
      episodes: {
        Row: {
          id: string;
          title_id: string;
          season_number: number;
          episode_number: number;
          title: string;
          synopsis: string;
          duration_minutes: number | null;
          thumbnail_url: string | null;
          video_url: string | null;
          release_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["episodes"]["Row"]> & { title_id: string; episode_number: number; title: string };
        Update: Partial<Database["public"]["Tables"]["episodes"]["Row"]>;
      };
      comments: {
        Row: {
          id: string;
          title_id: string;
          user_id: string;
          content: string;
          is_hidden: boolean;
          hidden_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> & { title_id: string; user_id: string; content: string };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
      };
      ratings: {
        Row: { id: string; title_id: string; user_id: string; score: number; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["ratings"]["Row"]> & { title_id: string; user_id: string; score: number };
        Update: Partial<Database["public"]["Tables"]["ratings"]["Row"]>;
      };
      my_list: {
        Row: { user_id: string; title_id: string; added_at: string };
        Insert: { user_id: string; title_id: string };
        Update: Partial<Database["public"]["Tables"]["my_list"]["Row"]>;
      };
      watch_progress: {
        Row: {
          id: string;
          user_id: string;
          title_id: string;
          episode_id: string | null;
          progress_seconds: number;
          duration_seconds: number;
          percent: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["watch_progress"]["Row"]> & { user_id: string; title_id: string };
        Update: Partial<Database["public"]["Tables"]["watch_progress"]["Row"]>;
      };
      notifications: {
        Row: { id: string; user_id: string; title: string; body: string; link: string | null; is_read: boolean; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & { user_id: string; title: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          tier: SubscriptionTier;
          price_xaf: number;
          billing_period: string;
          features: string[];
          is_active: boolean;
          sort_order: number;
          trial_days: number;
        };
        Insert: Partial<Database["public"]["Tables"]["subscription_plans"]["Row"]> & { name: string; tier: SubscriptionTier; price_xaf: number };
        Update: Partial<Database["public"]["Tables"]["subscription_plans"]["Row"]>;
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: SubscriptionStatus;
          current_period_end: string | null;
          payment_method: "mtn_momo" | "orange_money" | "cinetpay_card" | null;
          trial_ends_at: string | null;
          cancel_at_period_end: boolean;
          started_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_subscriptions"]["Row"]> & { user_id: string; plan_id: string };
        Update: Partial<Database["public"]["Tables"]["user_subscriptions"]["Row"]>;
      };
      banners: {
        Row: {
          id: string;
          heading: string;
          subheading: string;
          image_url: string;
          cta_label: string;
          title_id: string | null;
          external_link: string | null;
          is_active: boolean;
          sort_order: number;
          starts_at: string | null;
          ends_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["banners"]["Row"]> & { heading: string; image_url: string };
        Update: Partial<Database["public"]["Tables"]["banners"]["Row"]>;
      };
      payment_transactions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          subscription_id: string | null;
          provider: "mtn_momo" | "orange_money" | "cinetpay_card";
          amount_xaf: number;
          currency: string;
          status: "pending" | "successful" | "failed" | "cancelled" | "refunded";
          phone_number: string | null;
          provider_reference: string | null;
          provider_raw_response: unknown;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]> & {
          user_id: string;
          plan_id: string;
          provider: "mtn_momo" | "orange_money" | "cinetpay_card";
          amount_xaf: number;
        };
        Update: Partial<Database["public"]["Tables"]["payment_transactions"]["Row"]>;
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          transaction_id: string | null;
          invoice_number: string;
          amount_xaf: number;
          status: "paid" | "unpaid" | "void";
          plan_name: string;
          issued_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
          user_id: string;
          invoice_number: string;
          amount_xaf: number;
          plan_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      start_free_trial: { Args: { target_plan_id: string }; Returns: Database["public"]["Tables"]["user_subscriptions"]["Row"] };
      cancel_my_subscription: { Args: { target_subscription_id: string }; Returns: void };
      resume_my_subscription: { Args: { target_subscription_id: string }; Returns: void };
      generate_invoice_number: { Args: Record<string, never>; Returns: string };
    };
  };
}
