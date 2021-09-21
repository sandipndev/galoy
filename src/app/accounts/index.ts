export * from "./add-api-key-for-account"
export * from "./get-api-keys-for-account"
export * from "./disable-api-key-for-account"

import { hashApiKey } from "@domain/accounts"
import { AccountsRepository, AccountApiKeysRepository } from "@services/mongoose"

export const getAccount = async (accountId: AccountId) => {
  const accounts = AccountsRepository()
  return accounts.findById(accountId)
}

export const getAccountByApiKey = async (
  key: string,
  secret: string,
): Promise<Account | ApplicationError> => {
  const hashedKey = await hashApiKey({ key, secret })
  if (hashedKey instanceof Error) return hashedKey

  const accountApiKeysRepository = AccountApiKeysRepository()
  const accountApiKey = await accountApiKeysRepository.findByHashedKey(hashedKey)
  if (accountApiKey instanceof Error) return accountApiKey

  const accountRepo = AccountsRepository()
  return accountRepo.findById(accountApiKey.accountId)
}

export const hasPermissions = async (
  userId: UserId,
  walletName: WalletName,
): Promise<boolean | ApplicationError> => {
  const accounts = AccountsRepository()

  const userAccounts = await accounts.listByUserId(userId)
  if (userAccounts instanceof Error) return userAccounts

  const walletAccount = await accounts.findByWalletName(walletName)
  if (walletAccount instanceof Error) return walletAccount

  return userAccounts.some((a) => a.id === walletAccount.id)
}

export const getBusinessMapMarkers = async () => {
  const accounts = AccountsRepository()
  return accounts.listBusinessesForMap()
}
