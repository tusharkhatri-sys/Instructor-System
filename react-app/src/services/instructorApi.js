import { supabase } from './supabaseClient';

export const getInstructors = async () => {
    const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .order('registered_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
};

export const addInstructor = async (instructor) => {
    const { data, error } = await supabase
        .from('instructors')
        .insert([instructor])
        .select();
        
    if (error) throw error;
    return data[0];
};

export const updateInstructor = async (id, updates) => {
    const { data, error } = await supabase
        .from('instructors')
        .update(updates)
        .eq('id', id)
        .select();
        
    if (error) throw error;
    return data[0];
};

export const removeInstructor = async (id) => {
    // Attempt to delete photo and sig, though it's fire-and-forget
    await supabase.storage.from('photos').remove([id + '.jpg', id + '_sig.png']);
    
    const { error } = await supabase
        .from('instructors')
        .delete()
        .eq('id', id);
        
    if (error) throw error;
};

export const findInstructorByIdAndDob = async (empId, dob) => {
    const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .ilike('id', empId)
        .eq('dob', dob)
        .single();
        
    if (error) return null;
    return data;
};

const getPublicUrlWithCacheBust = (fileName) => {
    const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
    return data.publicUrl + '?t=' + new Date().getTime();
};

export const uploadPhoto = async (file, instructorId) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${instructorId}.${fileExt}`;
    
    const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
    if (error) {
        // Fallback Base64 (simplified for modern setups, ideally we avoid it)
        console.error('Upload failed, falling back to null', error);
        return null; 
    }
    return getPublicUrlWithCacheBust(fileName);
};

export const uploadSignature = async (file, instructorId) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${instructorId}_sig.${fileExt}`;
    
    const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
    if (error) return null;
    return getPublicUrlWithCacheBust(fileName);
};

export const uploadAdminSignature = async (file) => {
    if (!file) return null;
    const fileName = 'admin_signature.png';
    const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
    if (error) throw error;
    return getPublicUrlWithCacheBust(fileName);
};

// ========== NEW FEATURES API ==========

export const getNotices = async () => {
    const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const createNotice = async (notice) => {
    const { data, error } = await supabase.from('notices').insert([notice]).select();
    if (error) throw error; return data[0];
};

export const deleteNotice = async (id) => {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) throw error;
};

// Leaves
export const getMyLeaves = async (instructorId) => {
    const { data, error } = await supabase.from('leaves').select('*').eq('instructor_id', instructorId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const getPendingLeaves = async () => {
    const { data, error } = await supabase.from('leaves').select('*, instructors(name)').eq('status', 'Pending').order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const submitLeave = async (leaveData) => {
    const { data, error } = await supabase.from('leaves').insert([leaveData]).select();
    if (error) throw error; return data[0];
};

export const updateLeaveStatus = async (id, status) => {
    const { data, error } = await supabase.from('leaves').update({ status }).eq('id', id).select();
    if (error) throw error; return data[0];
};

// Edit Requests
export const submitEditRequest = async (requestData) => {
    const { data, error } = await supabase.from('edit_requests').insert([requestData]).select();
    if (error) throw error; return data[0];
};

export const getPendingEditRequests = async () => {
    const { data, error } = await supabase.from('edit_requests').select('*, instructors(name)').eq('status', 'Pending').order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const updateEditRequestStatus = async (id, status) => {
    const { data, error } = await supabase.from('edit_requests').update({ status }).eq('id', id).select();
    if (error) throw error; return data[0];
};

// Tool Requests
export const getMyToolRequests = async (instructorId) => {
    const { data, error } = await supabase.from('tool_requests').select('*').eq('instructor_id', instructorId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const getPendingToolRequests = async () => {
    const { data, error } = await supabase.from('tool_requests').select('*, instructors(name)').eq('status', 'Pending').order('created_at', { ascending: false });
    if (error) throw error; return data || [];
};

export const submitToolRequest = async (requestData) => {
    const { data, error } = await supabase.from('tool_requests').insert([requestData]).select();
    if (error) throw error; return data[0];
};

export const updateToolRequestStatus = async (id, status) => {
    const { data, error } = await supabase.from('tool_requests').update({ status }).eq('id', id).select();
    if (error) throw error; return data[0];
};

export const getPendingCounts = async () => {
    const [leavesCount, editsCount, toolsCount] = await Promise.all([
        supabase.from('leaves').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('edit_requests').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('tool_requests').select('id', { count: 'exact', head: true }).eq('status', 'Pending')
    ]);
    
    return {
        leaves: leavesCount.count || 0,
        edits: editsCount.count || 0,
        tools: toolsCount.count || 0
    };
};
