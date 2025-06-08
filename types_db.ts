export type Database = {
  public: {
    Tables: {
      subscriptions: { Row: any };
      prices: { Row: any };
      products: { Row: any };
      user_generated_titles: { Row: any };
      title_votes: { Row: any };
      profiles: { Row: any };
      api_usage: { Row: any };
      download_logs: { Row: any };
      book_generations: { Row: any };
      purchases: { Row: any };
      assets: { Row: any };
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends string> = any;
export type TablesUpdate<T extends string> = any;