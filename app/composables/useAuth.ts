import { useSupabase } from './useSupabase'

export interface Pilgrim {
  id: string
  name: string
  email?: string
  guest: boolean
}

const current = ref<Pilgrim | null>(null)
const ready = ref(false)
const syncing = ref(false)

const LS_KEY = 'dco.pilgrim'

/**
 * Quản lý tài khoản hành hương: Hybrid Local-first & Supabase Auth.
 * - Khách (Guest): Lưu vĩnh viễn ở trình duyệt (localStorage).
 * - Đăng nhập Cloud: Đồng bộ dữ liệu tu tập lên Supabase PostgreSQL.
 */
export function useAuth() {
  const { client, isConfigured } = useSupabase()

  async function init() {
    if (ready.value) return
    if (import.meta.client) {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        try { current.value = JSON.parse(raw) } catch {}
      }
    }

    if (!current.value && isConfigured && client) {
      try {
        const { data } = await client.auth.getUser()
        if (data.user) {
          current.value = {
            id: data.user.id,
            name: (data.user.user_metadata?.name as string) || data.user.email || 'Thiện nam/Tín nữ',
            email: data.user.email || undefined,
            guest: false
          }
          await syncCloudToLocal(data.user.id)
        }
      } catch {}
    }
    ready.value = true
  }

  function persistGuest(p: Pilgrim) {
    current.value = p
    if (import.meta.client) localStorage.setItem(LS_KEY, JSON.stringify(p))
  }

  /** Vào chùa ngay với tên tự đặt (không cần mật khẩu / email). */
  function enterAsGuest(name: string) {
    persistGuest({
      id: 'guest-' + Math.random().toString(36).slice(2, 9),
      name: name.trim() || 'Khách thập phương',
      guest: true
    })
  }

  /** Đồng bộ dữ liệu local lên Supabase khi người dùng đăng nhập */
  async function syncLocalToCloud(userId: string) {
    if (!isConfigured || !client || !import.meta.client) return
    syncing.value = true
    try {
      // 1. Đồng bộ thống kê tu tập
      const journalRaw = localStorage.getItem('dco_journal_v1')
      if (journalRaw) {
        const journal = JSON.parse(journalRaw)
        let totalIncense = 0, totalChanting = 0, totalMeditation = 0, totalSutras = 0, totalPrayers = 0
        for (const rec of Object.values(journal) as any[]) {
          totalIncense += rec.incenseCount || 0
          totalChanting += rec.chantingCount || 0
          totalMeditation += rec.meditationMinutes || 0
          totalSutras += rec.sutraReadCount || 0
          totalPrayers += rec.prayersCount || 0
        }

        await client.from('user_practice_stats').upsert({
          user_id: userId,
          display_name: current.value?.name || 'Thiện nam / Tín nữ',
          total_incense: totalIncense,
          total_chanting_rounds: Math.floor(totalChanting / 108),
          total_meditation_minutes: totalMeditation,
          total_sutras_read: totalSutras,
          total_prayers: totalPrayers,
          updated_at: new Date().toISOString()
        })
      }

      // 2. Đồng bộ cây Bồ Đề
      const treeRaw = localStorage.getItem('dco_bodhi_tree_v1')
      if (treeRaw) {
        const tree = JSON.parse(treeRaw)
        await client.from('bodhi_trees').upsert({
          user_id: userId,
          tree_name: tree.treeName || 'Cây Bồ Đề Tâm',
          water_count: tree.waterCount || 1,
          last_watered_date: tree.lastWateredDate || new Date().toISOString().slice(0, 10),
          stage: tree.stage || 'sprout',
          ribbons: tree.ribbons || []
        }, { onConflict: 'user_id' })
      }
    } catch (e) {
      console.warn('Lỗi đồng bộ dữ liệu lên cloud:', e)
    } finally {
      syncing.value = false
    }
  }

  /** Tải dữ liệu từ Supabase về nếu người dùng đăng nhập trên máy mới */
  async function syncCloudToLocal(userId: string) {
    if (!isConfigured || !client || !import.meta.client) return
    try {
      const { data: treeData } = await client
        .from('bodhi_trees')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (treeData) {
        localStorage.setItem('dco_bodhi_tree_v1', JSON.stringify({
          id: treeData.id,
          treeName: treeData.tree_name,
          plantedAt: new Date(treeData.planted_at).getTime(),
          waterCount: treeData.water_count,
          lastWateredDate: treeData.last_watered_date,
          stage: treeData.stage,
          ribbons: treeData.ribbons || []
        }))
      }
    } catch (e) {
      console.warn('Lỗi tải dữ liệu từ cloud về:', e)
    }
  }

  async function signUp(name: string, email: string, password: string) {
    if (!(isConfigured && client)) {
      enterAsGuest(name)
      return { ok: true, cloud: false }
    }
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) return { ok: false, error: error.message }
    if (data.user) {
      current.value = { id: data.user.id, name, email, guest: false }
      persistGuest(current.value)
      await syncLocalToCloud(data.user.id)
    }
    return { ok: true, cloud: true }
  }

  async function signIn(email: string, password: string) {
    if (!(isConfigured && client)) return { ok: false, error: 'Chưa bật đăng nhập cloud.' }
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    current.value = {
      id: data.user.id,
      name: (data.user.user_metadata?.name as string) || email,
      email,
      guest: false
    }
    persistGuest(current.value)
    await syncLocalToCloud(data.user.id)
    return { ok: true }
  }

  async function signOut() {
    if (isConfigured && client) await client.auth.signOut()
    current.value = null
    if (import.meta.client) localStorage.removeItem(LS_KEY)
  }

  return {
    current,
    ready,
    syncing,
    cloudEnabled: isConfigured,
    init,
    enterAsGuest,
    signUp,
    signIn,
    signOut,
    syncLocalToCloud
  }
}
