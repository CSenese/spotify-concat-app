import User from "../classes/User.js";

const accessToken = sessionStorage.getItem('access_token'); // or manually paste one for testing
let user = new User(accessToken);

const SUPABASE_URL = `https://mkdcyzujpwiscipgnzxr.supabase.co`;
const SUPABASE_PUBLISHABLE_KEY = `sb_publishable_fK6Nj4AvtyaXIdIgb2zViA_tLF0TB_p`;

user.initSupabaseClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

const playlist = await user.loadUserPlaylists();