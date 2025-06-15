
-- Fix critical security issues with proper constraint checking

-- 1. Add missing RLS policies for conversations (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can view their own conversations') THEN
        CREATE POLICY "Users can view their own conversations" ON public.conversations
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can create their own conversations') THEN
        CREATE POLICY "Users can create their own conversations" ON public.conversations
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can update their own conversations') THEN
        CREATE POLICY "Users can update their own conversations" ON public.conversations
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can delete their own conversations') THEN
        CREATE POLICY "Users can delete their own conversations" ON public.conversations
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Add missing RLS policies for messages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
        CREATE POLICY "Users can view messages in their conversations" ON public.messages
          FOR SELECT USING (
            auth.uid() = user_id OR 
            EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can create messages in their conversations') THEN
        CREATE POLICY "Users can create messages in their conversations" ON public.messages
          FOR INSERT WITH CHECK (
            auth.uid() = user_id AND
            EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update their own messages') THEN
        CREATE POLICY "Users can update their own messages" ON public.messages
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can delete their own messages') THEN
        CREATE POLICY "Users can delete their own messages" ON public.messages
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Add missing RLS policies for workflows
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users can view their own workflows') THEN
        CREATE POLICY "Users can view their own workflows" ON public.workflows
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Anyone can view public workflows') THEN
        CREATE POLICY "Anyone can view public workflows" ON public.workflows
          FOR SELECT USING (is_public = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users can create their own workflows') THEN
        CREATE POLICY "Users can create their own workflows" ON public.workflows
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users can update their own workflows') THEN
        CREATE POLICY "Users can update their own workflows" ON public.workflows
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users can delete their own workflows') THEN
        CREATE POLICY "Users can delete their own workflows" ON public.workflows
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Add missing RLS policies for workflow_interactions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_interactions' AND policyname = 'Users can view their own workflow interactions') THEN
        CREATE POLICY "Users can view their own workflow interactions" ON public.workflow_interactions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_interactions' AND policyname = 'Users can create their own workflow interactions') THEN
        CREATE POLICY "Users can create their own workflow interactions" ON public.workflow_interactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_conversation_id ON public.workflows(conversation_id);
CREATE INDEX IF NOT EXISTS idx_workflow_interactions_user_id ON public.workflow_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_interactions_workflow_id ON public.workflow_interactions(workflow_id);

-- 6. Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
