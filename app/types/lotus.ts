export type LotusType = 'white' | 'pink' | 'gold'

export interface LotusBlessingItem {
  id: string
  sender: string
  recipient: string
  wish: string
  lotusType: LotusType
  createdAt: string
}

