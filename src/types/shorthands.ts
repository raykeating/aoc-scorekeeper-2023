import type { Database } from "./database";

//export Database for convenience
export type { Database } from "./database";

//export tables and enums. ex: Tables<'Language'>, Enums<'Difficulty'>
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

//table types
export type Language = Tables<'Language'>
export type Submission = Tables<'Submission'>
export type User = Tables<'User'>
