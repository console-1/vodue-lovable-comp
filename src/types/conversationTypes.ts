
/**
 * Represents a conversation object as stored and retrieved from the database.
 */
export interface Conversation {
  /** The unique identifier for the conversation. */
  id: string;
  /** The title of the conversation. */
  title: string;
  /** The mode of the conversation, indicating its purpose (e.g., building a workflow or interacting with it). */
  mode: 'build' | 'interact';
  /** Timestamp of when the conversation was created. */
  created_at: string;
  /** Timestamp of when the conversation was last updated. */
  updated_at: string;
}

export interface ConversationCreateInput {
  title: string;
  mode: 'build' | 'interact';
}

export interface ConversationUpdateInput {
  title?: string;
  mode?: 'build' | 'interact';
}
