import { useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import type { ArubaPanel, Domain, Database, PecEmail, Subscription } from '../types';
import { useAuth } from './useAuth';

export function useInfrastructure() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Le operazioni di scrittura richiedono una sessione valida
  const requireUser = () => {
    if (!user) throw new Error('Utente non autenticato');
    return user;
  };

  // --- Panels ---
  const fetchPanels = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    const { data, error } = await supabase
      .from('aruba_panels')
      .select('*, domains(*), databases(*, db_slots(*))')
      .order('created_at', { ascending: false });
    
    setLoading(false);
    if (error) {
      setError(error.message);
      return [];
    }
    return data as ArubaPanel[];
  }, [user]);

  const fetchPecs = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    const { data, error } = await supabase
      .from('pec_emails')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);
    if (error) {
      setError(error.message);
      return [];
    }
    return data as PecEmail[];
  }, [user]);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);
    if (error) {
      setError(error.message);
      return [];
    }
    return data as Subscription[];
  }, [user]);

  const addPanel = async (panel: Partial<ArubaPanel>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('aruba_panels')
      .insert([{ ...panel, user_id: requireUser().id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ArubaPanel;
  };

  const updatePanel = async (id: string, updates: Partial<ArubaPanel>) => {
    const { data, error } = await supabase
      .from('aruba_panels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ArubaPanel;
  };

  const deletePanel = async (id: string) => {
    const { error } = await supabase
      .from('aruba_panels')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  };

  // --- Domains ---
  const addDomain = async (domain: Partial<Domain>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('domains')
      .insert([{ ...domain, user_id: requireUser().id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Domain;
  };

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    const { data, error } = await supabase
      .from('domains')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Domain;
  };

  const deleteDomain = async (id: string) => {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  // --- Databases ---
  const addDatabase = async (db: Partial<Database>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('databases')
      .insert([{ ...db, user_id: requireUser().id }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Database;
  };

  const updateDatabase = async (id: string, updates: Partial<Database>) => {
    const { data, error } = await supabase
      .from('databases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Database;
  };

  const deleteDatabase = async (id: string) => {
    const { error } = await supabase
      .from('databases')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  // --- PEC Emails ---
  const addPec = async (pec: Partial<PecEmail>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('pec_emails')
      .insert([{ ...pec, user_id: requireUser().id }])
      .select()
      .single();
    if (error) throw error;
    return data as PecEmail;
  };

  const updatePec = async (id: string, updates: Partial<PecEmail>) => {
    const { data, error } = await supabase
      .from('pec_emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PecEmail;
  };

  const deletePec = async (id: string) => {
    const { error } = await supabase
      .from('pec_emails')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  // --- Subscriptions ---
  const addSubscription = async (sub: Partial<Subscription>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ ...sub, user_id: requireUser().id }])
      .select()
      .single();
    if (error) throw error;
    return data as Subscription;
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Subscription;
  };

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  };

  // --- Slots ---
  const upsertDBSlots = async (databaseId: string, slots: { slot_number: number, content: string | null, notes: string | null }[]) => {
    if (!user) return null;
    
    const upsertData = slots.map(slot => ({
      ...slot,
      database_id: databaseId,
      user_id: requireUser().id
    }));

    const { data, error } = await supabase
      .from('db_slots')
      .upsert(upsertData, {
        onConflict: 'database_id,slot_number'
      })
      .select();
    
    if (error) throw error;
    return data;
  };

  return {
    loading,
    error,
    fetchPanels,
    addPanel,
    updatePanel,
    deletePanel,
    addDomain,
    updateDomain,
    deleteDomain,
    addDatabase,
    updateDatabase,
    deleteDatabase,
    upsertDBSlots,
    fetchPecs,
    addPec,
    updatePec,
    deletePec,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
}
