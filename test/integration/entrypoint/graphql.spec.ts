import { redis } from "src/redis"
import { sleep } from "src/utils"
import { yamlConfig } from "src/config"
import { createTestClient } from "apollo-server-testing"
import { startApolloServerForSchema } from "src/entrypoint/graphql-core-server"

let server, httpServer
const { phone, code: correctCode } = yamlConfig.test_accounts[9]
const badCode = 123456

beforeAll(async () => {
  ;({ server, httpServer } = await startApolloServerForSchema())
  await sleep(2500)
})

beforeEach(async () => {
  await clearLimiters("login")
  await clearLimiters("failed_attempt_ip")
  await clearLimiters("request_phone_code")
  await clearLimiters("request_phone_code_ip")
})

afterAll(async () => {
  await sleep(2500)
  await httpServer.close()
  redis.disconnect()
})

describe("graphql", () => {
  it("start server", async () => {
    const { query } = createTestClient(server)

    const {
      data: {
        nodeStats: { id, peersCount },
      },
    } = await query({
      query: `query nodeStats {
      nodeStats {
          id
          peersCount
          channelsCount
      }
    }`,
    })

    expect(id).toBeTruthy()
    expect(peersCount).toBeGreaterThanOrEqual(1)
  })

  it("rate limit limiterRequestPhoneCode", async () => {
    const { mutate } = createTestClient(server)
    const phone = "+123"

    const mutation = `mutation requestPhoneCode ($phone: String) {
      requestPhoneCode (phone: $phone) {
          success
      }
    }`

    // exhaust the limiter
    for (let i = 0; i < yamlConfig.limits.requestPhoneCode.points; i++) {
      const result = await mutate({ mutation, variables: { phone } })
      expect(result.errors).toBeFalsy()
    }

    try {
      const result = await mutate({ mutation, variables: { phone } })
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: "TOO_MANY_REQUEST" })]),
      )
    } catch (err) {
      expect(true).toBeFalsy()
    }
  })

  it("rate limit login", async () => {
    const { mutate } = createTestClient(server)

    const mutation = `mutation login ($phone: String, $code: Int) {
      login (phone: $phone, code: $code) {
          token
      }
    }`

    const {
      data: {
        login: { token: tokenNull },
      },
    } = await mutate({ mutation, variables: { phone, code: badCode } })
    expect(tokenNull).toBeFalsy()

    const {
      data: {
        login: { token },
      },
    } = await mutate({ mutation, variables: { phone, code: correctCode } })
    expect(token).toBeTruthy()

    // exhaust the limiter
    for (let i = 0; i < yamlConfig.limits.loginAttempt.points; i++) {
      const result = await mutate({ mutation, variables: { phone, code: badCode } })
      expect(result.errors).toBeFalsy()
    }

    try {
      const result = await mutate({ mutation, variables: { phone, code: correctCode } })
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: "TOO_MANY_REQUEST" })]),
      )
      expect(result.data.login).toBeFalsy()
    } catch (err) {
      expect(true).toBeFalsy()
    }
  })
})

const clearLimiters = async (prefix) => {
  const keys = await redis.keys(`${prefix}:*`)
  for (const key of keys) {
    await redis.del(key)
  }
}
