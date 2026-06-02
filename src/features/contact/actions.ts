'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import { contactMessageSchema, type ContactMessageValues } from './schema';

export async function submitContactMessageAction(input: ContactMessageValues) {
  const values = contactMessageSchema.parse(input);
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from('contact_messages').insert({
    title: values.title,
    email: values.email,
    content: values.content,
  });

  if (error) throw error;
}

