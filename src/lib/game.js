export function calcParams(playerCount) {
  const range = playerCount <= 5 ? 10 : Math.ceil((playerCount * 2) / 5) * 5
  const winScore = Math.max(30, Math.ceil((range * 1.5) / 10) * 10)
  return { range, winScore }
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const AVATAR_COLORS = [
  { bg: '#B5D4F4', text: '#042C53' },
  { bg: '#9FE1CB', text: '#04342C' },
  { bg: '#F5C4B3', text: '#4A1B0C' },
  { bg: '#F4C0D1', text: '#4B1528' },
  { bg: '#FAC775', text: '#412402' },
  { bg: '#C0DD97', text: '#173404' },
  { bg: '#EEEDFE', text: '#26215C' },
  { bg: '#FAECE7', text: '#4A1B0C' },
  { bg: '#E6F1FB', text: '#042C53' },
  { bg: '#D3D1C7', text: '#2C2C2A' },
  { bg: '#FCEBEB', text: '#501313' },
  { bg: '#FAEEDA', text: '#412402' },
  { bg: '#E1F5EE', text: '#04342C' },
  { bg: '#F1EFE8', text: '#2C2C2A' },
  { bg: '#EAF3DE', text: '#173404' },
  { bg: '#FBEAF0', text: '#4B1528' },
  { bg: '#9FE1CB', text: '#085041' },
  { bg: '#FAC775', text: '#633806' },
  { bg: '#B5D4F4', text: '#0C447C' },
  { bg: '#C0DD97', text: '#27500A' },
]
