const jwt = require('jsonwebtoken')

const USERS_API = 'https://jsonplaceholder.typicode.com/users'

async function fetchUsers(fetcher = fetch) {
  const response = await fetcher(USERS_API)

  if (!response.ok) {
    const error = new Error('사용자 API 요청 실패')
    error.status = 502
    throw error
  }

  return response.json()
}

async function issueToken(
  username,
  secret = process.env.JWT_SECRET,
  fetcher = fetch,
) {
  if (!username) {
    const error = new Error('username 입력 필요')
    error.status = 400
    throw error
  }

  if (!secret) {
    const error = new Error('JWT_SECRET 설정 필요')
    error.status = 500
    throw error
  }

  const users = await fetchUsers(fetcher)

  const user = users.find((u) => u.username === username)

  if (!user) {
    const error = new Error('사용자 없음')
    error.status = 404
    throw error
  }

  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
  }

  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '10m',
  })

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
    },
  }
}

module.exports = { fetchUsers, issueToken }
